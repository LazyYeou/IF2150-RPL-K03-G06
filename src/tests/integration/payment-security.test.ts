import { randomUUID } from "node:crypto";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { dbSementara } from "../helpers/db";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) =>
      jar.has(n) ? { name: n, value: jar.get(n) } : undefined,
    set: (n: string, v: string) => void jar.set(n, v),
    delete: (n: string) => void jar.delete(n),
  }),
}));
let fixture: Awaited<ReturnType<typeof dbSementara>>;
let db: typeof import("@/lib/db").db;
let trigger: typeof import("@/app/api/mock-gateway/trigger/route");
let webhook: typeof import("@/app/api/webhooks/payment/route");
let buatSesi: typeof import("@/lib/auth/session").buatSesi;
let sign: typeof import("@/lib/payment/mock").tandaTanganiWebhook;
let invoice: { id: string; trx: string; owner: string; nominal: number };
let payout: { id: string; tk: string; owner: string; nominal: number };
let pkLain: string;
const one = <T>(sql: string, ...params: unknown[]) =>
  db.prepare(sql).get(...params) as T;
type Jenis = "tagihan" | "pencairan";
const reference = (jenis: Jenis) =>
  jenis === "tagihan" ? invoice.id : payout.id;
const body = (jenis: Jenis) =>
  jenis === "tagihan"
    ? { idTagihan: invoice.id, status: "BERHASIL" }
    : { idPencairan: payout.id, status: "BERHASIL" };
const mock = (input: unknown) =>
  trigger.POST(
    new Request("http://localhost/api/mock-gateway/trigger", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
const snapshot = () => ({
  invoice: one(
    "SELECT status_pembayaran FROM tagihan_pembayaran WHERE id_tagihan = ?",
    invoice.id,
  ),
  work: one(
    "SELECT status_pekerjaan FROM transaksi_pekerjaan WHERE id_transaksi = ?",
    invoice.trx,
  ),
  payout: one(
    "SELECT status_pencairan FROM pencairan_dana WHERE id_pencairan = ?",
    payout.id,
  ),
  saldo: one(
    "SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?",
    payout.tk,
  ),
  ledger: one("SELECT COUNT(*) AS n FROM mutasi_saldo"),
  logs: one("SELECT COUNT(*) AS n FROM log_gateway"),
  notifications: one("SELECT COUNT(*) AS n FROM notifikasi"),
});
async function loginEmail(email: string) {
  await buatSesi(
    one<{ id: string }>(
      "SELECT id_pengguna AS id FROM pengguna WHERE email = ?",
      email,
    ).id,
  );
}
async function signed(jenis: Jenis, nominal: unknown, status = "BERHASIL") {
  const payload = {
    jenis: jenis === "tagihan" ? "PEMBAYARAN" : "PENCAIRAN",
    referensiId: reference(jenis),
    nominal,
    status,
    waktu: new Date().toISOString(),
  };
  const { rawBody, signature } = sign(payload);
  return webhook.POST(
    new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      headers: { "x-signature": signature },
      body: rawBody,
    }),
  );
}
beforeAll(async () => {
  fixture = await dbSementara();
  fixture.db.close();
  vi.stubEnv("DATABASE_PATH", fixture.file);
  vi.stubEnv("PAYMENT_PROVIDER", "mock");
  vi.stubEnv("PAYMENT_WEBHOOK_SECRET", "payment-security-fixture-secret");
  ({ db } = await import("@/lib/db"));
  trigger = await import("@/app/api/mock-gateway/trigger/route");
  webhook = await import("@/app/api/webhooks/payment/route");
  ({ buatSesi } = await import("@/lib/auth/session"));
  ({ tandaTanganiWebhook: sign } = await import("@/lib/payment/mock"));
  const trx = one<{ id: string; owner: string; nominal: number }>(
    `SELECT t.id_transaksi AS id, pk.id_pengguna AS owner, t.nominal_upah AS nominal
     FROM transaksi_pekerjaan t JOIN penyedia_kerja pk USING (id_penyedia_kerja)
     WHERE t.status_pekerjaan = 'MENUNGGU_PEMBAYARAN' LIMIT 1`,
  );
  invoice = {
    id: randomUUID(),
    trx: trx.id,
    owner: trx.owner,
    nominal: trx.nominal + 5000,
  };
  db.prepare(
    `INSERT INTO tagihan_pembayaran
    (id_tagihan, id_transaksi, nominal_upah, commission_fee, total_bayar, expiry_timestamp, status_pembayaran)
    VALUES (?, ?, ?, 5000, ?, datetime('now', '+1 day'), 'DIPROSES')`,
  ).run(invoice.id, trx.id, trx.nominal, invoice.nominal);
  pkLain = randomUUID();
  db.prepare(
    `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
    VALUES (?, 'PK lain', 'security-pk@test.local', 'fixture', 'PK', '1990-01-01', datetime('now'))`,
  ).run(pkLain);
  db.prepare(
    "INSERT INTO penyedia_kerja (id_penyedia_kerja, id_pengguna) VALUES (?, ?)",
  ).run(randomUUID(), pkLain);
});
beforeEach(() => {
  jar.clear();
  process.env.PAYMENT_PROVIDER = "mock";
  db.prepare(
    "UPDATE tagihan_pembayaran SET status_pembayaran = 'DIPROSES' WHERE id_tagihan = ?",
  ).run(invoice.id);
  db.prepare(
    "UPDATE transaksi_pekerjaan SET status_pekerjaan = 'MENUNGGU_PEMBAYARAN' WHERE id_transaksi = ?",
  ).run(invoice.trx);
  payout = {
    id: randomUUID(),
    owner: randomUUID(),
    tk: randomUUID(),
    nominal: 50000,
  };
  db.prepare(
    `INSERT INTO pengguna (id_pengguna, nama, email, password_hash, peran, tanggal_lahir, persetujuan_privasi_at)
    VALUES (?, 'TK pemilik', ?, 'fixture', 'TK', '1990-01-01', datetime('now'))`,
  ).run(payout.owner, `${payout.owner}@test.local`);
  db.prepare(
    "INSERT INTO tenaga_kerja (id_tenaga_kerja, id_pengguna, status_verifikasi, saldo_pendapatan) VALUES (?, ?, 'TERVERIFIKASI', 150000)",
  ).run(payout.tk, payout.owner);
  db.prepare(
    "INSERT INTO mutasi_saldo (kunci_operasi, id_tenaga_kerja, nominal) VALUES (?, ?, 150000)",
  ).run(`fixture:${payout.tk}`, payout.tk);
  db.prepare(
    "INSERT INTO pencairan_dana (id_pencairan, id_tenaga_kerja, nominal, rekening_tujuan, status_pencairan) VALUES (?, ?, ?, 'BANK:1234567890', 'DIPROSES')",
  ).run(payout.id, payout.tk, payout.nominal);
});
afterAll(() => {
  jar.clear();
  db.close();
  fixture.tutup();
  vi.unstubAllEnvs();
});

describe.each<Jenis>(["tagihan", "pencairan"])(
  "keamanan mock dan webhook %s",
  (jenis) => {
    const loginOwner = () =>
      buatSesi(jenis === "tagihan" ? invoice.owner : payout.owner);

    it("tanpa sesi ditolak 401 tanpa mutasi", async () => {
      const before = snapshot();
      expect((await mock(body(jenis))).status).toBe(401);
      expect(snapshot()).toEqual(before);
    });
    it("pemilik lain ditolak 403 tanpa mutasi", async () => {
      if (jenis === "tagihan") await buatSesi(pkLain);
      else await loginEmail("tk2@kerjain.test");
      const before = snapshot();
      expect((await mock(body(jenis))).status).toBe(403);
      expect(snapshot()).toEqual(before);
    });
    it("peran lain ditolak 403 tanpa mutasi", async () => {
      await loginEmail(
        jenis === "tagihan" ? "tk1@kerjain.test" : "pk1@kerjain.test",
      );
      const before = snapshot();
      expect((await mock(body(jenis))).status).toBe(403);
      expect(snapshot()).toEqual(before);
    });
    it("CS tidak mendapat akses simulator milik pengguna", async () => {
      await loginEmail("cs1@kerjain.test");
      const before = snapshot();
      expect((await mock(body(jenis))).status).toBe(403);
      expect(snapshot()).toEqual(before);
    });
    it("provider non-mock ditolak tanpa mutasi", async () => {
      await loginOwner();
      process.env.PAYMENT_PROVIDER = "midtrans";
      const before = snapshot();
      expect((await mock(body(jenis))).status).toBe(403);
      expect(snapshot()).toEqual(before);
    });
    it("pemilik sah dapat menjalankan simulasi dan duplikat tidak mengulang mutasi uang/notifikasi", async () => {
      await loginOwner();
      const response = await mock(body(jenis));
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        success: true,
        status: "BERHASIL",
        redirectUrl:
          jenis === "tagihan" ? `/pk/transaksi/${invoice.trx}` : "/tk/dompet",
      });
      const first = snapshot();
      expect((await mock(body(jenis))).status).toBe(200);
      const second = snapshot();
      // Setiap callback tetap dicatat pada log audit, tetapi tidak mendebit/notifikasi ulang.
      expect({ ...second, logs: first.logs }).toEqual(first);
      if (jenis === "pencairan")
        expect(
          one<{ saldo: number }>(
            "SELECT saldo_pendapatan AS saldo FROM tenaga_kerja WHERE id_tenaga_kerja = ?",
            payout.tk,
          ).saldo,
        ).toBe(100000);
    });
    it("nominal hilang atau invalid ditolak sebelum status, saldo, ledger, log, atau notifikasi berubah", async () => {
      for (const nominal of [
        undefined,
        null,
        "50000",
        0,
        -1,
        1.5,
        true,
        {},
        [],
        Number.MAX_SAFE_INTEGER + 1,
        NaN,
        Infinity,
      ]) {
        const before = snapshot();
        expect(
          (await signed(jenis, nominal)).status,
          `nominal=${String(nominal)}`,
        ).toBe(400);
        expect(snapshot()).toEqual(before);
      }
    });
    it("nominal berbeda dengan DB ditolak tanpa mutasi", async () => {
      const before = snapshot();
      expect(
        (
          await signed(
            jenis,
            (jenis === "tagihan" ? invoice.nominal : payout.nominal) + 1,
          )
        ).status,
      ).toBe(400);
      expect(snapshot()).toEqual(before);
    });
    it("gateway asli dengan HMAC dan nominal valid tetap diterima tanpa sesi", async () => {
      expect(jar.size).toBe(0);
      const response = await signed(
        jenis,
        jenis === "tagihan" ? invoice.nominal : payout.nominal,
      );
      expect(response.status).toBe(200);
      expect((await response.json()).status).toBe("BERHASIL");
    });
  },
);

it("input simulator ambigu, field tambahan, dan format ID/status salah ditolak", async () => {
  await buatSesi(invoice.owner);
  for (const input of [
    null,
    [],
    {},
    { idTagihan: "bukan-uuid" },
    { ...body("tagihan"), idPencairan: payout.id },
    { ...body("tagihan"), nominal: 1 },
    { idTagihan: invoice.id, status: "TIDAK_VALID" },
  ]) {
    const before = snapshot();
    expect((await mock(input)).status).toBe(400);
    expect(snapshot()).toEqual(before);
  }
});
it("JSON simulator rusak mendapat 400", async () => {
  await buatSesi(invoice.owner);
  const before = snapshot();
  expect(
    (
      await trigger.POST(
        new Request("http://localhost/api/mock-gateway/trigger", {
          method: "POST",
          body: "{",
        }),
      )
    ).status,
  ).toBe(400);
  expect(snapshot()).toEqual(before);
});
it("payload webhook non-objek atau JSON rusak bertanda tangan valid ditolak 400", async () => {
  for (const raw of ["null", "[]", '"teks"', "{"]) {
    const before = snapshot();
    const { rawBody, signature } = sign(raw);
    expect(
      (
        await webhook.POST(
          new Request("http://localhost/api/webhooks/payment", {
            method: "POST",
            headers: { "x-signature": signature },
            body: rawBody,
          }),
        )
      ).status,
    ).toBe(400);
    expect(snapshot()).toEqual(before);
  }
});
