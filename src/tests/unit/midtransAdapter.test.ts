import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { dbAplikasiSementara } from "@/tests/helpers/db";

describe("MidtransPaymentGateway (Issue #53)", () => {
  let tutupDb: () => void;
  let MidtransPaymentGateway: typeof import("@/lib/payment/midtrans").MidtransPaymentGateway;
  let getPaymentAdapter: typeof import("@/lib/payment/adapter").getPaymentAdapter;
  let ambilLog: typeof import("@/models/LogGateway").ambilLog;

  const TEST_SERVER_KEY = "SB-Mid-server-test-key-1234567890";

  beforeAll(async () => {
    const sem = await dbAplikasiSementara({ seed: false });
    tutupDb = sem.tutup;

    process.env.MIDTRANS_SERVER_KEY = TEST_SERVER_KEY;
    process.env.PAYMENT_PROVIDER = "midtrans";
    process.env.PAYMENT_WEBHOOK_SECRET = "secret-test-webhook-1234567890";

    const midtransMod = await import("@/lib/payment/midtrans");
    MidtransPaymentGateway = midtransMod.MidtransPaymentGateway;

    const adapterMod = await import("@/lib/payment/adapter");
    getPaymentAdapter = adapterMod.getPaymentAdapter;

    const logMod = await import("@/models/LogGateway");
    ambilLog = logMod.ambilLog;
  });

  afterAll(() => {
    delete process.env.MIDTRANS_SERVER_KEY;
    process.env.PAYMENT_PROVIDER = "mock";
    tutupDb?.();
  });

  describe("Factory getPaymentAdapter", () => {
    it("mengembalikan MidtransPaymentGateway jika PAYMENT_PROVIDER=midtrans dan key diset", () => {
      process.env.PAYMENT_PROVIDER = "midtrans";
      process.env.MIDTRANS_SERVER_KEY = TEST_SERVER_KEY;
      const adapter = getPaymentAdapter();
      expect(adapter).toBeInstanceOf(MidtransPaymentGateway);
    });

    it("melempar error jika PAYMENT_PROVIDER=midtrans tapi key kosong", () => {
      process.env.PAYMENT_PROVIDER = "midtrans";
      const lama = process.env.MIDTRANS_SERVER_KEY;
      delete process.env.MIDTRANS_SERVER_KEY;
      try {
        expect(() => getPaymentAdapter()).toThrow(
          /MIDTRANS_SERVER_KEY wajib diisi/i,
        );
      } finally {
        process.env.MIDTRANS_SERVER_KEY = lama;
      }
    });
  });

  describe("charge()", () => {
    it("memanggil endpoint Snap dan mengembalikan redirectUrl serta mencatat log CHARGE MIDTRANS", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          token: "snap-token-123",
          redirect_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-123",
        }),
      });
      vi.stubGlobal("fetch", mockFetch);

      try {
        const gateway = new MidtransPaymentGateway();
        const res = await gateway.charge({
          idTagihan: "mt-charge-001",
          total: 75000,
          metode: "gopay",
        });

        expect(res.redirectUrl).toBe(
          "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-123",
        );
        expect(mockFetch).toHaveBeenCalledWith(
          "https://app.sandbox.midtrans.com/snap/v1/transactions",
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: expect.stringMatching(/^Basic /),
            }),
          }),
        );

        const logs = ambilLog("mt-charge-001");
        expect(logs).toHaveLength(1);
        expect(logs[0].jenis).toBe("CHARGE");
        expect(logs[0].provider).toBe("MIDTRANS");
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe("disburse() — idempotency lokal", () => {
    it("mencatat log DISBURSEMENT dengan provider MIDTRANS", async () => {
      const gateway = new MidtransPaymentGateway();
      const res = await gateway.disburse({
        idPencairan: "mt-cair-001",
        rekening: "BCA:1234567890",
        nominal: 50000,
      });

      expect(res.status).toBe("DITERIMA");

      const logs = ambilLog("mt-cair-001");
      expect(logs).toHaveLength(1);
      expect(logs[0].jenis).toBe("DISBURSEMENT");
      expect(logs[0].provider).toBe("MIDTRANS");
    });

    it("disbursement idempotent: panggilan kedua tidak menambah log", async () => {
      const gateway = new MidtransPaymentGateway();
      const res = await gateway.disburse({
        idPencairan: "mt-cair-001",
        rekening: "BCA:1234567890",
        nominal: 50000,
      });

      expect(res.status).toBe("DITERIMA");
      expect(ambilLog("mt-cair-001")).toHaveLength(1);
    });
  });

  describe("refund() — idempotency lokal", () => {
    it("mencatat log REFUND dengan provider MIDTRANS", async () => {
      const gateway = new MidtransPaymentGateway();
      const res = await gateway.refund({
        idempotencyKey: "refund:mt-tiket-001",
        idTagihan: "mt-tagihan-001",
        nominal: 30000,
      });

      expect(res.status).toBe("BERHASIL");

      const logs = ambilLog("mt-tagihan-001");
      expect(logs).toHaveLength(1);
      expect(logs[0].jenis).toBe("REFUND");
      expect(logs[0].provider).toBe("MIDTRANS");
    });

    it("refund idempotent: panggilan kedua mengembalikan BERHASIL tanpa log baru", async () => {
      const gateway = new MidtransPaymentGateway();
      const res = await gateway.refund({
        idempotencyKey: "refund:mt-tiket-001",
        idTagihan: "mt-tagihan-001",
        nominal: 30000,
      });

      expect(res.status).toBe("BERHASIL");
      expect(ambilLog("mt-tagihan-001")).toHaveLength(1);
    });
  });

  describe("verifikasiWebhook() — SHA-512 Midtrans", () => {
    function buatSignature(
      orderId: string,
      statusCode: string,
      grossAmount: string,
      key: string,
    ): string {
      return createHash("sha512")
        .update(orderId + statusCode + grossAmount + key)
        .digest("hex");
    }

    it("memvalidasi signature SHA-512 Midtrans yang sah", () => {
      const gateway = new MidtransPaymentGateway();
      const payload = {
        order_id: "order-123",
        status_code: "200",
        gross_amount: "50000.00",
        transaction_status: "capture",
      };

      const sig = buatSignature(
        payload.order_id,
        payload.status_code,
        payload.gross_amount,
        TEST_SERVER_KEY,
      );

      expect(gateway.verifikasiWebhook(JSON.stringify(payload), sig)).toBe(
        true,
      );
    });

    it("menolak signature yang salah", () => {
      const gateway = new MidtransPaymentGateway();
      const payload = {
        order_id: "order-123",
        status_code: "200",
        gross_amount: "50000.00",
      };

      const fakeSig = "a".repeat(128);
      expect(
        gateway.verifikasiWebhook(JSON.stringify(payload), fakeSig),
      ).toBe(false);
    });

    it("menolak jika body bukan JSON valid", () => {
      const gateway = new MidtransPaymentGateway();
      expect(gateway.verifikasiWebhook("bukan json", "abcdef")).toBe(false);
    });
  });
});