import type Database from "better-sqlite3";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "@/scripts/migrate";
import { dbSementara } from "../helpers/db";

let db: Database.Database;
let tutup: () => void;
beforeAll(async () => ({ db, tutup } = await dbSementara()));
afterAll(() => tutup());

const hitung = (sql: string) => (db.prepare(sql).get() as { c: number }).c;

describe("migrasi & seed (#4)", () => {
  it("migrasi idempoten: menjalankan ulang tidak menerapkan apa pun", () => {
    expect(migrate(db)).toEqual([]);
    expect(hitung("SELECT count(*) c FROM _migrasi")).toBe(3);
  });
  it("seed membuat 5 akun, ±30 lowongan, transaksi di tiap status, 1 tiket aktif", () => {
    expect(hitung("SELECT count(*) c FROM pengguna")).toBe(5);
    expect(hitung("SELECT count(*) c FROM lowongan_pekerjaan")).toBe(30);
    expect(
      hitung(
        "SELECT count(DISTINCT status_pekerjaan) c FROM transaksi_pekerjaan",
      ),
    ).toBe(5);
    expect(
      hitung(
        "SELECT count(*) c FROM tiket_sengketa WHERE status_tiket = 'DIAJUKAN'",
      ),
    ).toBe(1);
  });
  it("password di-hash Argon2id dan saldo TK konsisten dengan ledger", () => {
    expect(
      hitung(
        "SELECT count(*) c FROM pengguna WHERE password_hash NOT LIKE '$argon2id$%'",
      ),
    ).toBe(0);
    expect(
      hitung(
        "SELECT saldo_pendapatan c FROM tenaga_kerja WHERE saldo_pendapatan > 0",
      ),
    ).toBe(hitung("SELECT sum(nominal) c FROM mutasi_saldo"));
  });
});

describe("invarian DB (db.md §3)", () => {
  it("KNF20: riwayat_sengketa, mutasi_saldo, log_gateway append-only", () => {
    expect(() =>
      db.exec("UPDATE riwayat_sengketa SET log_aktivitas = 'x'"),
    ).toThrow(/append-only/);
    expect(() => db.exec("DELETE FROM riwayat_sengketa")).toThrow(
      /append-only/,
    );
    expect(() => db.exec("UPDATE mutasi_saldo SET nominal = 0")).toThrow(
      /append-only/,
    );
    expect(() => db.exec("DELETE FROM mutasi_saldo")).toThrow(/append-only/);
    db.exec(
      "INSERT INTO log_gateway (jenis, referensi_id, payload) VALUES ('CHARGE', 'x', '{}')",
    );
    expect(() => db.exec("UPDATE log_gateway SET provider = 'X'")).toThrow(
      /append-only/,
    );
  });
  it("KNF07: jumlah_diterima tidak boleh melebihi kuota", () => {
    expect(() =>
      db.exec("UPDATE lowongan_pekerjaan SET jumlah_diterima = kuota + 1"),
    ).toThrow(/CHECK/);
  });
  it("KNF11: satu tagihan aktif/lunas per transaksi", () => {
    const t = db
      .prepare(
        "SELECT id_transaksi id, nominal_upah u FROM transaksi_pekerjaan WHERE status_pekerjaan = 'IN_PROGRESS'",
      )
      .get() as { id: string; u: number };
    const sql = `INSERT INTO tagihan_pembayaran (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar, expiry_timestamp)
                 VALUES ('dup', '${t.id}', ${t.u}, 0, ${t.u}, datetime('now'))`;
    expect(() => db.exec(sql)).toThrow(/UNIQUE/);
  });
  it("total_bayar harus = nominal_upah + commission_fee", () => {
    const t = db
      .prepare(
        "SELECT id_transaksi id FROM transaksi_pekerjaan WHERE status_pekerjaan = 'MENUNGGU_PEMBAYARAN'",
      )
      .get() as { id: string };
    expect(() =>
      db.exec(`INSERT INTO tagihan_pembayaran (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar, expiry_timestamp)
               VALUES ('salah', '${t.id}', 1000, 50, 999, datetime('now'))`),
    ).toThrow(/CHECK/);
  });
  it("foreign key aktif", () => {
    expect(() =>
      db.exec(
        "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES ('x', 'tidak-ada')",
      ),
    ).toThrow(/FOREIGN KEY/);
  });
});
