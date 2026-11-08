import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dbAplikasiSementara, dbSementara } from "../helpers/db";
import type Database from "better-sqlite3";

describe("helper database test (#40)", () => {
  it("setiap DB terisolasi, termigrasi/seed, dan dibersihkan secara idempoten", async () => {
    const satu = await dbSementara();
    let dua: Awaited<ReturnType<typeof dbSementara>> | undefined;
    try {
      dua = await dbSementara();
      expect(satu.file).not.toBe(dua.file);
      expect(satu.db.prepare("SELECT count(*) c FROM _migrasi").get()).toEqual({
        c: 2,
      });
      expect(dua.db.prepare("SELECT count(*) c FROM pengguna").get()).toEqual({
        c: 5,
      });
      const awal = dua.db
        .prepare("SELECT nama FROM pengguna WHERE email = ?")
        .get("tk1@kerjain.test");
      satu.db
        .prepare("UPDATE pengguna SET nama = ? WHERE email = ?")
        .run("Nama terisolasi", "tk1@kerjain.test");
      expect(
        dua.db
          .prepare("SELECT nama FROM pengguna WHERE email = ?")
          .get("tk1@kerjain.test"),
      ).toEqual(awal);
    } finally {
      satu.tutup();
      dua?.tutup();
    }
    expect(existsSync(satu.file)).toBe(false);
    expect(satu.db.open).toBe(false);
    if (dua) expect(existsSync(dua.file)).toBe(false);
    expect(() => satu.tutup()).not.toThrow();
  });
  it("binding aplikasi memakai DB sementara dan mengembalikan environment/singleton setelah tutup", async () => {
    const originalPath = process.env.DATABASE_PATH;
    const globalDb = globalThis as unknown as { __db?: Database.Database };
    const originalDb = globalDb.__db;
    const sementara = await dbAplikasiSementara({ seed: false });
    try {
      expect(process.env.DATABASE_PATH).toBe(sementara.file);
      expect((await import("@/lib/db")).db).toBe(sementara.db);
      expect(
        sementara.db.prepare("SELECT count(*) c FROM pengguna").get(),
      ).toEqual({ c: 0 });
      expect(sementara.db.pragma("foreign_keys", { simple: true })).toBe(1);
    } finally {
      sementara.tutup();
    }
    expect(process.env.DATABASE_PATH).toBe(originalPath);
    expect(globalDb.__db).toBe(originalDb);
    expect(existsSync(sementara.file)).toBe(false);
    expect(() => sementara.tutup()).not.toThrow();
  });
  it("menolak menimpa singleton yang masih terbuka", async () => {
    const globalDb = globalThis as unknown as { __db?: Database.Database };
    const lama = globalDb.__db;
    const pathLama = process.env.DATABASE_PATH;
    const aktif = await dbSementara({ seed: false });
    globalDb.__db = aktif.db;
    try {
      await expect(dbAplikasiSementara()).rejects.toThrow(
        /singleton sudah terbuka/,
      );
      expect(aktif.db.open).toBe(true);
      expect(process.env.DATABASE_PATH).toBe(pathLama);
    } finally {
      if (lama === undefined) delete globalDb.__db;
      else globalDb.__db = lama;
      aktif.tutup();
    }
  });
});
