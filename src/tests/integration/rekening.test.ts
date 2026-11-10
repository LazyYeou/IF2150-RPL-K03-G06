import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { dbAplikasiSementara } from "../helpers/db";
import { dekripsiRekening } from "@/lib/rekening";
import { lindungiRekening } from "@/scripts/protect-accounts";
let fixture: Awaited<ReturnType<typeof dbAplikasiSementara>>;
let model: typeof import("@/models/PencairanDana");
let log: typeof import("@/models/LogGateway");
let tk: string;
beforeAll(async () => {
  fixture = await dbAplikasiSementara();
  process.env.PAYMENT_PROVIDER = "mock";
  model = await import("@/models/PencairanDana");
  log = await import("@/models/LogGateway");
  tk = (
    fixture.db
      .prepare("SELECT id_tenaga_kerja id FROM tenaga_kerja LIMIT 1")
      .get() as { id: string }
  ).id;
  fixture.db
    .prepare(
      "INSERT INTO mutasi_saldo (kunci_operasi,id_tenaga_kerja,nominal) VALUES (?,?,1000000)",
    )
    .run(randomUUID(), tk);
});
afterAll(() => fixture?.tutup());
describe("Rekening terenkripsi dan migrasi data lama", () => {
  it("pengajuan dan replay menyimpan ciphertext, log tanpa rekening lengkap, respons masked", async () => {
    const key = randomUUID();
    const account = "BANK:123456789012";
    const hasil = await model.ajukanPencairanDana(tk, 10000, account, key);
    expect(hasil.rekeningMasked).toBe("****9012");
    expect(JSON.stringify(hasil)).not.toContain("123456789012");
    const row = fixture.db
      .prepare(
        "SELECT rekening_tujuan rekening FROM pencairan_dana WHERE id_pencairan = ?",
      )
      .get(key) as { rekening: string };
    expect(row.rekening).toMatch(/^enc:rekening:v1:/);
    expect(dekripsiRekening(row.rekening, `pencairan:${key}`)).toBe(account);
    const raw = fixture.db
      .prepare("SELECT payload FROM log_gateway WHERE referensi_id = ?")
      .get(key) as { payload: string };
    expect(raw.payload).not.toContain("123456789012");
    expect(JSON.stringify(log.ambilLog(key))).not.toContain("123456789012");
    expect(await model.ajukanPencairanDana(tk, 10000, account, key)).toEqual(
      hasil,
    );
    expect(
      fixture.db
        .prepare("SELECT COUNT(*) n FROM log_gateway WHERE referensi_id = ?")
        .get(key),
    ).toEqual({ n: 1 });
  });
  it("migrasi rekening lama dan log append-only idempoten, menjaga identitas log dan saldo", () => {
    const id = randomUUID();
    const account = "EWALLET:081234567890";
    fixture.db
      .prepare(
        "INSERT INTO pencairan_dana (id_pencairan,id_tenaga_kerja,nominal,rekening_tujuan) VALUES (?,?,10000,?)",
      )
      .run(id, tk, account);
    fixture.db
      .prepare(
        "UPDATE tenaga_kerja SET rekening_tujuan = ? WHERE id_tenaga_kerja = ?",
      )
      .run(account, tk);
    const logId = fixture.db
      .prepare(
        "INSERT INTO log_gateway (jenis,referensi_id,provider,payload) VALUES ('DISBURSEMENT',?,'MOCK',?)",
      )
      .run(
        id,
        JSON.stringify({
          rekening: account,
          nominal: 10000,
          idempotencyKey: id,
        }),
      ).lastInsertRowid;
    const walletBefore = fixture.db
      .prepare(
        "SELECT SUM(nominal) saldo FROM mutasi_saldo WHERE id_tenaga_kerja = ?",
      )
      .get(tk);
    const before = fixture.db
      .prepare("SELECT id_log,created_at FROM log_gateway WHERE id_log = ?")
      .get(logId);
    expect(lindungiRekening(fixture.db)).toMatchObject({ rekening: 2, log: 1 });
    expect(lindungiRekening(fixture.db)).toEqual({ rekening: 0, log: 0 });
    expect(
      fixture.db
        .prepare("SELECT id_log,created_at FROM log_gateway WHERE id_log = ?")
        .get(logId),
    ).toEqual(before);
    const raw = fixture.db
      .prepare("SELECT payload FROM log_gateway WHERE id_log = ?")
      .get(logId) as { payload: string };
    expect(raw.payload).not.toContain("081234567890");
    expect(
      fixture.db
        .prepare(
          "SELECT SUM(nominal) saldo FROM mutasi_saldo WHERE id_tenaga_kerja = ?",
        )
        .get(tk),
    ).toEqual(walletBefore);
    expect(() =>
      fixture.db
        .prepare("UPDATE log_gateway SET payload = '{}' WHERE id_log = ?")
        .run(logId),
    ).toThrow(/append-only/);
    expect(() =>
      fixture.db.prepare("DELETE FROM log_gateway WHERE id_log = ?").run(logId),
    ).toThrow(/append-only/);
    expect(model.cariPencairanBerdasarkanId(id)?.rekeningTujuan).toBe(account);
  });
  it("migrasi gagal tidak meninggalkan perubahan parsial atau membuka trigger", () => {
    const id = randomUUID();
    const account = "BANK:987654321012";
    fixture.db
      .prepare(
        "INSERT INTO pencairan_dana (id_pencairan,id_tenaga_kerja,nominal,rekening_tujuan) VALUES (?,?,10000,?)",
      )
      .run(id, tk, account);
    fixture.db.exec(
      "CREATE TRIGGER uji_gagal_rekening BEFORE UPDATE ON pencairan_dana BEGIN SELECT RAISE(ABORT,'uji gagal'); END",
    );
    try {
      expect(() => lindungiRekening(fixture.db)).toThrow(/uji gagal/);
    } finally {
      fixture.db.exec("DROP TRIGGER uji_gagal_rekening");
    }
    expect(
      fixture.db
        .prepare(
          "SELECT rekening_tujuan rekening FROM pencairan_dana WHERE id_pencairan = ?",
        )
        .get(id),
    ).toEqual({ rekening: account });
    expect(() =>
      fixture.db.exec("UPDATE log_gateway SET payload = '{}' "),
    ).toThrow(/append-only/);
    lindungiRekening(fixture.db);
  });
  it("pencatatan callback lama/raw JSON tidak menyimpan rekening lengkap", () => {
    const id = randomUUID();
    log.catatLog(
      "CALLBACK",
      id,
      JSON.stringify({
        rekeningTujuan: "BANK:111222333444",
        status: "BERHASIL",
      }),
    );
    const raw = fixture.db
      .prepare("SELECT payload FROM log_gateway WHERE referensi_id = ?")
      .get(id) as { payload: string };
    expect(raw.payload).not.toContain("111222333444");
    expect(raw.payload).toContain("****3444");
  });
  it("gagal saat sanitasi log mengembalikan trigger append-only dan seluruh perubahan", () => {
    const id = randomUUID();
    const logId = fixture.db
      .prepare(
        "INSERT INTO log_gateway (jenis,referensi_id,payload) VALUES ('CALLBACK',?,?)",
      )
      .run(
        id,
        JSON.stringify({ rekening: "BANK:111222333444" }),
      ).lastInsertRowid;
    fixture.db.exec(
      "CREATE TRIGGER uji_gagal_log BEFORE UPDATE ON log_gateway BEGIN SELECT RAISE(ABORT,'uji sanitasi gagal'); END",
    );
    try {
      expect(() => lindungiRekening(fixture.db)).toThrow(/sanitasi gagal/);
    } finally {
      fixture.db.exec("DROP TRIGGER uji_gagal_log");
    }
    expect(() =>
      fixture.db
        .prepare("UPDATE log_gateway SET payload = '{}' WHERE id_log = ?")
        .run(logId),
    ).toThrow(/append-only/);
    const row = fixture.db
      .prepare("SELECT payload FROM log_gateway WHERE id_log = ?")
      .get(logId) as { payload: string };
    expect(row.payload).toContain("111222333444");
    lindungiRekening(fixture.db);
  });
  it("CLI maintenance dapat dijalankan dua kali pada DB sementara tanpa membocorkan data", () => {
    const id = randomUUID();
    fixture.db
      .prepare(
        "INSERT INTO pencairan_dana (id_pencairan,id_tenaga_kerja,nominal,rekening_tujuan) VALUES (?,?,10000,'BANK:555666777888')",
      )
      .run(id, tk);
    const run = () =>
      execFileSync(
        process.execPath,
        ["node_modules/tsx/dist/cli.mjs", "scripts/protect-accounts.ts"],
        {
          env: { ...process.env, DATABASE_PATH: fixture.file },
          encoding: "utf8",
        },
      );
    const first = run();
    expect(first).toContain("1 rekening, 0 log");
    expect(first).not.toContain("555666777888");
    expect(first).not.toContain(process.env.FILE_ENCRYPTION_KEY!);
    expect(run()).toContain("0 rekening, 0 log");
    expect(model.cariPencairanBerdasarkanId(id)?.rekeningTujuan).toBe(
      "BANK:555666777888",
    );
  });
});
