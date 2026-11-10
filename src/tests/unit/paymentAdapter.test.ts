import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dbAplikasiSementara } from "@/tests/helpers/db";

describe("Payment Gateway Adapter & LogGateway (Issue #15)", () => {
  let tutupDb: () => void;
  let getPaymentAdapter: typeof import("@/lib/payment/adapter").getPaymentAdapter;
  let MockPaymentGateway: typeof import("@/lib/payment/mock").MockPaymentGateway;
  let tandaTanganiWebhook: typeof import("@/lib/payment/mock").tandaTanganiWebhook;
  let catatLog: typeof import("@/models/LogGateway").catatLog;
  let ambilLog: typeof import("@/models/LogGateway").ambilLog;
  let db: typeof import("@/lib/db").db;

  beforeAll(async () => {
    const sem = await dbAplikasiSementara({ seed: false });
    tutupDb = sem.tutup;
    process.env.PAYMENT_WEBHOOK_SECRET = "secret-test-webhook-1234567890";

    const adapterMod = await import("@/lib/payment/adapter");
    getPaymentAdapter = adapterMod.getPaymentAdapter;

    const mockMod = await import("@/lib/payment/mock");
    MockPaymentGateway = mockMod.MockPaymentGateway;
    tandaTanganiWebhook = mockMod.tandaTanganiWebhook;

    const logMod = await import("@/models/LogGateway");
    catatLog = logMod.catatLog;
    ambilLog = logMod.ambilLog;

    db = (await import("@/lib/db")).db;
  });

  afterAll(() => {
    tutupDb?.();
  });

  describe("getPaymentAdapter factory", () => {
    it("mengembalikan MockPaymentGateway jika env tidak diset atau 'mock'", () => {
      delete process.env.PAYMENT_PROVIDER;
      const adapter1 = getPaymentAdapter();
      expect(adapter1).toBeInstanceOf(MockPaymentGateway);

      process.env.PAYMENT_PROVIDER = "mock";
      const adapter2 = getPaymentAdapter();
      expect(adapter2).toBeInstanceOf(MockPaymentGateway);
    });

    it("melemparkan error informatif jika provider 'midtrans' dipilih (belum dikonfigurasi)", () => {
      process.env.PAYMENT_PROVIDER = "midtrans";
      expect(() => getPaymentAdapter()).toThrow(
        /Midtrans belum dikonfigurasi/i,
      );
    });

    it("melemparkan error jika provider tidak dikenal", () => {
      process.env.PAYMENT_PROVIDER = "stripe";
      expect(() => getPaymentAdapter()).toThrow(/tidak didukung/i);
    });
  });

  describe("MockPaymentGateway", () => {
    it("charge(): mengembalikan URL redirect mock dan mencatat log jenis CHARGE", async () => {
      const gateway = new MockPaymentGateway();
      const res = await gateway.charge({
        idTagihan: "tagihan-001",
        total: 52500,
        metode: "VA_BCA",
      });

      expect(res.redirectUrl).toBe("/mock-gateway/tagihan-001");

      const logs = ambilLog("tagihan-001");
      expect(logs).toHaveLength(1);
      expect(logs[0].jenis).toBe("CHARGE");
      expect(logs[0].provider).toBe("MOCK");
      expect(logs[0].payload).toMatchObject({
        idTagihan: "tagihan-001",
        total: 52500,
        metode: "VA_BCA",
        idempotencyKey: "tagihan-001",
      });
    });

    it("disburse(): mengembalikan status DITERIMA dan mencatat log jenis DISBURSEMENT", async () => {
      const gateway = new MockPaymentGateway();
      const res = await gateway.disburse({
        idPencairan: "cair-001",
        rekening: "BCA:1234567890",
        nominal: 50000,
      });

      expect(res.status).toBe("DITERIMA");

      const logs = ambilLog("cair-001");
      expect(logs).toHaveLength(1);
      expect(logs[0].jenis).toBe("DISBURSEMENT");
      expect(logs[0].payload).toMatchObject({
        idPencairan: "cair-001",
        rekeningMasked: "****7890",
        rekeningFingerprint: expect.any(String),
        nominal: 50000,
        idempotencyKey: "cair-001",
      });
    });

    it("refund(): mengembalikan status BERHASIL dan meneruskan idempotency key pada log REFUND", async () => {
      const gateway = new MockPaymentGateway();
      const res = await gateway.refund({
        idempotencyKey: "refund:tiket-123",
        idTagihan: "tagihan-002",
        nominal: 50000,
      });

      expect(res.status).toBe("BERHASIL");

      const logs = ambilLog("tagihan-002");
      expect(logs).toHaveLength(1);
      expect(logs[0].jenis).toBe("REFUND");
      expect(logs[0].payload).toMatchObject({
        idTagihan: "tagihan-002",
        nominal: 50000,
        idempotencyKey: "refund:tiket-123",
      });
    });
  });

  describe("verifikasiWebhook & tandaTanganiWebhook (HMAC-SHA256)", () => {
    it("memvalidasi signature yang sah dengan timingSafeEqual", () => {
      const gateway = new MockPaymentGateway();
      const payload = {
        jenis: "PEMBAYARAN",
        referensiId: "tagihan-001",
        status: "BERHASIL",
        nominal: 52500,
        waktu: new Date().toISOString(),
      };

      const { rawBody, signature } = tandaTanganiWebhook(payload);
      expect(gateway.verifikasiWebhook(rawBody, signature)).toBe(true);
    });

    it("menolak signature yang salah atau payload yang telah dimanipulasi", () => {
      const gateway = new MockPaymentGateway();
      const payload = {
        jenis: "PEMBAYARAN",
        referensiId: "tagihan-001",
        status: "BERHASIL",
        nominal: 52500,
      };

      const { rawBody, signature } = tandaTanganiWebhook(payload);

      // Body dimanipulasi
      const tamperedBody = rawBody.replace("52500", "10000");
      expect(gateway.verifikasiWebhook(tamperedBody, signature)).toBe(false);

      // Signature diubah
      const fakeSig = "a".repeat(64);
      expect(gateway.verifikasiWebhook(rawBody, fakeSig)).toBe(false);
    });

    it("menolak jika signature memiliki panjang berbeda tanpa melempar error timingSafeEqual", () => {
      const gateway = new MockPaymentGateway();
      const rawBody = JSON.stringify({ ok: true });
      expect(gateway.verifikasiWebhook(rawBody, "pendek")).toBe(false);
      expect(gateway.verifikasiWebhook(rawBody, "")).toBe(false);
    });

    it("menolak jika PAYMENT_WEBHOOK_SECRET tidak ada", () => {
      const gateway = new MockPaymentGateway();
      const secretLama = process.env.PAYMENT_WEBHOOK_SECRET;
      delete process.env.PAYMENT_WEBHOOK_SECRET;

      try {
        expect(gateway.verifikasiWebhook("{}", "abcdef")).toBe(false);
      } finally {
        process.env.PAYMENT_WEBHOOK_SECRET = secretLama;
      }
    });
  });

  describe("Model LogGateway", () => {
    it("mencatat log dan mengambil kembali dengan format ISO", () => {
      const ref = "ref-test-999";
      catatLog("CALLBACK", ref, { status: "BERHASIL" }, "MOCK");

      const logs = ambilLog(ref);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      const latest = logs[logs.length - 1];
      expect(latest.referensiId).toBe(ref);
      expect(latest.jenis).toBe("CALLBACK");
      expect(latest.provider).toBe("MOCK");
      expect(latest.payload).toEqual({ status: "BERHASIL" });
      expect(latest.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);
    });

    it("menjaga sifat immutability (KNF20): tidak mengizinkan UPDATE atau DELETE pada log_gateway", () => {
      const ref = "ref-immutable-test";
      const id = catatLog("CHARGE", ref, { test: 1 });

      // Verifikasi trigger immutability mencegah UPDATE
      expect(() => {
        db.prepare(
          "UPDATE log_gateway SET provider = 'HACK' WHERE id_log = ?",
        ).run(id);
      }).toThrow(/append-only/i);

      // Verifikasi trigger immutability mencegah DELETE
      expect(() => {
        db.prepare("DELETE FROM log_gateway WHERE id_log = ?").run(id);
      }).toThrow(/append-only/i);
    });
  });
});
