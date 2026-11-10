import { randomUUID } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) =>
      jar.has(n) ? { name: n, value: jar.get(n) } : undefined,
    set: (n: string, v: string) => void jar.set(n, v),
    delete: (n: string) => void jar.delete(n),
  }),
}));

type Db = typeof import("@/lib/db").db;
let db: Db;
let dir: string;

let pencairanRoute: typeof import("@/app/api/pencairan/route");
let dompetRoute: typeof import("@/app/api/dompet/route");
let webhookRoute: typeof import("@/app/api/webhooks/payment/route");
let mockPayment: typeof import("@/lib/payment/mock");
let sessionModule: typeof import("@/lib/auth/session");

describe("Integrasi Pencairan Dana & Webhook Disbursement (Issue #34 / UC10 / KF19, KF20)", () => {
  let idPenggunaTKTerverifikasi: string;
  let idTKTerverifikasi: string;
  let idPenggunaTKBelumVerif: string;
  let idPenggunaPK: string;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(tmpdir(), "kerjain-pencairan-"));
    process.env.DATABASE_PATH = path.join(dir, "test.db");
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.PAYMENT_WEBHOOK_SECRET = "secret-pencairan-uji-123";

    const { bukaDb } = await import("@/db/open");
    const { migrate } = await import("@/scripts/migrate");
    const { seed } = await import("@/db/seed");

    const awal = bukaDb();
    migrate(awal);
    await seed(awal);
    awal.close();

    ({ db } = await import("@/lib/db"));
    sessionModule = await import("@/lib/auth/session");
    pencairanRoute = await import("@/app/api/pencairan/route");
    dompetRoute = await import("@/app/api/dompet/route");
    webhookRoute = await import("@/app/api/webhooks/payment/route");
    mockPayment = await import("@/lib/payment/mock");

    const tk1Row = db
      .prepare(
        `SELECT tk.id_tenaga_kerja, tk.id_pengguna
         FROM tenaga_kerja tk
         JOIN pengguna p ON tk.id_pengguna = p.id_pengguna
         WHERE p.email = 'tk1@kerjain.test'`,
      )
      .get() as { id_tenaga_kerja: string; id_pengguna: string };
    idPenggunaTKTerverifikasi = tk1Row.id_pengguna;
    idTKTerverifikasi = tk1Row.id_tenaga_kerja;

    const tk2Row = db
      .prepare(
        `SELECT tk.id_pengguna
         FROM tenaga_kerja tk
         JOIN pengguna p ON tk.id_pengguna = p.id_pengguna
         WHERE p.email = 'tk2@kerjain.test'`,
      )
      .get() as { id_pengguna: string };
    idPenggunaTKBelumVerif = tk2Row.id_pengguna;

    const pkRow = db
      .prepare(
        `SELECT id_pengguna FROM pengguna WHERE email = 'pk1@kerjain.test'`,
      )
      .get() as { id_pengguna: string };
    idPenggunaPK = pkRow.id_pengguna;
  });

  async function loginSebagai(idPengguna: string) {
    jar.clear();
    await sessionModule.buatSesi(idPengguna);
  }

  function logout() {
    jar.clear();
  }

  it("POST /api/pencairan tanpa autentikasi mengembalikan 401 UNAUTHENTICATED", async () => {
    logout();
    const req = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 50000,
        rekeningTujuan: "BANK:1234567890",
      }),
    });

    const res = await pencairanRoute.POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error?.code).toBe("UNAUTHENTICATED");
  });

  it("POST /api/pencairan oleh peran PK mengembalikan 403 FORBIDDEN", async () => {
    await loginSebagai(idPenggunaPK);
    const req = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 50000,
        rekeningTujuan: "BANK:1234567890",
      }),
    });

    const res = await pencairanRoute.POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error?.code).toBe("FORBIDDEN");
  });

  it("POST /api/pencairan oleh TK yang belum terverifikasi mengembalikan 403 NOT_VERIFIED", async () => {
    await loginSebagai(idPenggunaTKBelumVerif);
    const req = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 50000,
        rekeningTujuan: "BANK:1234567890",
      }),
    });

    const res = await pencairanRoute.POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error?.code).toBe("NOT_VERIFIED");
  });

  it("Kriteria penerimaan: Rekening tidak valid mengembalikan 400 VALIDATION_ERROR (UC10 alt1)", async () => {
    await loginSebagai(idPenggunaTKTerverifikasi);

    const req1 = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 50000,
        rekeningTujuan: "1234567890",
      }),
    });
    const res1 = await pencairanRoute.POST(req1);
    expect(res1.status).toBe(400);
    const body1 = await res1.json();
    expect(body1.error?.code).toBe("VALIDATION_ERROR");

    const req2 = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 50000,
        rekeningTujuan: "BANK:12345678",
      }),
    });
    const res2 = await pencairanRoute.POST(req2);
    expect(res2.status).toBe(400);

    const req3 = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 50000,
        rekeningTujuan: "EWALLET:0912345678",
      }),
    });
    const res3 = await pencairanRoute.POST(req3);
    expect(res3.status).toBe(400);
  });

  it("Validasi nominal: nominal < Rp 10.000 ditolak 400 VALIDATION_ERROR", async () => {
    await loginSebagai(idPenggunaTKTerverifikasi);
    const req = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: 5000,
        rekeningTujuan: "BANK:1234567890",
      }),
    });

    const res = await pencairanRoute.POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error?.code).toBe("VALIDATION_ERROR");
  });

  it("Kriteria penerimaan: Nominal > saldo tersedia mengembalikan 422 SALDO_TIDAK_CUKUP (UC10 alt2)", async () => {
    await loginSebagai(idPenggunaTKTerverifikasi);

    // Ambil saldo tersedia saat ini
    const dompetRes = await dompetRoute.GET();
    const dompet = await dompetRes.json();
    const saldoTersedia = dompet.saldoTersedia;

    // Coba tarik nominal melebihi saldo tersedia
    const req = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: saldoTersedia + 50000,
        rekeningTujuan: "BANK:1234567890",
      }),
    });

    const res = await pencairanRoute.POST(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error?.code).toBe("SALDO_TIDAK_CUKUP");
  });

  it("TX1: Berhasil mengajukan pencairan (201 DIPROSES), saldo tersedia terpotong, rekening bertopeng", async () => {
    await loginSebagai(idPenggunaTKTerverifikasi);

    const dompetAwalRes = await dompetRoute.GET();
    const dompetAwal = await dompetAwalRes.json();

    const nominalTarik = 100000;
    const rekeningInput = "BANK:123456789012";

    const req = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: nominalTarik,
        rekeningTujuan: rekeningInput,
      }),
    });

    const res = await pencairanRoute.POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();

    expect(body).toHaveProperty("id");
    expect(body.nominal).toBe(nominalTarik);
    expect(body.status).toBe("DIPROSES");
    expect(body.rekeningMasked).toBe("****9012");

    const row = db
      .prepare(
        `SELECT id_pencairan, nominal, status_pencairan, rekening_tujuan
         FROM pencairan_dana WHERE id_pencairan = ?`,
      )
      .get(body.id) as {
      id_pencairan: string;
      nominal: number;
      status_pencairan: string;
      rekening_tujuan: string;
    };
    expect(row).toBeDefined();
    expect(row.status_pencairan).toBe("DIPROSES");
    expect(row.rekening_tujuan).toMatch(/^enc:rekening:v1:/);
    expect(row.rekening_tujuan).not.toContain(rekeningInput);
    const { dekripsiRekening } = await import("@/lib/rekening");
    expect(
      dekripsiRekening(row.rekening_tujuan, `pencairan:${row.id_pencairan}`),
    ).toBe(rekeningInput);

    const dompetSetelahRes = await dompetRoute.GET();
    const dompetSetelah = await dompetSetelahRes.json();
    expect(dompetSetelah.saldo).toBe(dompetAwal.saldo);
    expect(dompetSetelah.saldoTersedia).toBe(
      dompetAwal.saldoTersedia - nominalTarik,
    );
  });

  it("Webhook TX2: Callback BERHASIL mendebit saldo_pendapatan & mencatat mutasi cair:<id>", async () => {
    await loginSebagai(idPenggunaTKTerverifikasi);

    const nominalTarik = 75000;
    const reqPencairan = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: nominalTarik,
        rekeningTujuan: "EWALLET:08123456789",
      }),
    });
    const resPencairan = await pencairanRoute.POST(reqPencairan);
    expect(resPencairan.status).toBe(201);
    const { id: idPencairan } = await resPencairan.json();

    const dompetSebelumWebhook = await (await dompetRoute.GET()).json();
    const saldoSebelumDebit = dompetSebelumWebhook.saldo;

    const payload = {
      jenis: "PENCAIRAN",
      idPencairan,
      referensiId: idPencairan,
      nominal: nominalTarik,
      status: "BERHASIL",
      waktu: new Date().toISOString(),
    };
    const { rawBody, signature } = mockPayment.tandaTanganiWebhook(payload);

    const webhookReq = new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: rawBody,
    });

    const webhookRes = await webhookRoute.POST(webhookReq);
    expect(webhookRes.status).toBe(200);
    const webhookBody = await webhookRes.json();
    expect(webhookBody.received).toBe(true);
    expect(webhookBody.status).toBe("BERHASIL");

    const pencairanDB = db
      .prepare(
        `SELECT status_pencairan FROM pencairan_dana WHERE id_pencairan = ?`,
      )
      .get(idPencairan) as { status_pencairan: string };
    expect(pencairanDB.status_pencairan).toBe("BERHASIL");

    const mutasiDB = db
      .prepare(
        `SELECT kunci_operasi, nominal FROM mutasi_saldo WHERE kunci_operasi = ?`,
      )
      .get(`cair:${idPencairan}`) as {
      kunci_operasi: string;
      nominal: number;
    };
    expect(mutasiDB).toBeDefined();
    expect(mutasiDB.nominal).toBe(-nominalTarik);

    // Periksa saldo_pendapatan TK telah berkurang
    const tkDB = db
      .prepare(
        `SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`,
      )
      .get(idTKTerverifikasi) as { saldo_pendapatan: number };
    expect(tkDB.saldo_pendapatan).toBe(saldoSebelumDebit - nominalTarik);

    const dompetSetelahWebhook = await (await dompetRoute.GET()).json();
    expect(dompetSetelahWebhook.saldo).toBe(saldoSebelumDebit - nominalTarik);
  });

  it("Kriteria penerimaan: Webhook dikirim ulang tidak mendebit dua kali (Idempoten)", async () => {
    const pencairanBerhasil = db
      .prepare(
        `SELECT id_pencairan, nominal FROM pencairan_dana WHERE status_pencairan = 'BERHASIL' LIMIT 1`,
      )
      .get() as { id_pencairan: string; nominal: number };
    expect(pencairanBerhasil).toBeDefined();

    const tkSebelum = db
      .prepare(
        `SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`,
      )
      .get(idTKTerverifikasi) as { saldo_pendapatan: number };

    // Kirim ulang webhook BERHASIL yang identik
    const payload = {
      jenis: "PENCAIRAN",
      idPencairan: pencairanBerhasil.id_pencairan,
      referensiId: pencairanBerhasil.id_pencairan,
      nominal: pencairanBerhasil.nominal,
      status: "BERHASIL",
      waktu: new Date().toISOString(),
    };
    const { rawBody, signature } = mockPayment.tandaTanganiWebhook(payload);

    const reqUlang = new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: rawBody,
    });

    const resUlang = await webhookRoute.POST(reqUlang);
    expect(resUlang.status).toBe(200);
    const bodyUlang = await resUlang.json();
    expect(bodyUlang.duplicate || bodyUlang.ignored).toBe(true);

    const tkSetelah = db
      .prepare(
        `SELECT saldo_pendapatan FROM tenaga_kerja WHERE id_tenaga_kerja = ?`,
      )
      .get(idTKTerverifikasi) as { saldo_pendapatan: number };
    expect(tkSetelah.saldo_pendapatan).toBe(tkSebelum.saldo_pendapatan);
  });

  it("Webhook GAGAL: Reservasi saldo lepas dan saldoTersedia pulih kembali", async () => {
    await loginSebagai(idPenggunaTKTerverifikasi);

    const nominalTarik = 60000;
    const reqPencairan = new Request("http://localhost/api/pencairan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        nominal: nominalTarik,
        rekeningTujuan: "BANK:987654321098",
      }),
    });
    const resPencairan = await pencairanRoute.POST(reqPencairan);
    const { id: idPencairan } = await resPencairan.json();

    const dompetSaatDiproses = await (await dompetRoute.GET()).json();
    const saldoSaatDiproses = dompetSaatDiproses.saldo;
    const saldoTersediaSaatDiproses = dompetSaatDiproses.saldoTersedia;

    // Kirim webhook GAGAL
    const payload = {
      jenis: "PENCAIRAN",
      idPencairan,
      referensiId: idPencairan,
      nominal: nominalTarik,
      status: "GAGAL",
      waktu: new Date().toISOString(),
    };
    const { rawBody, signature } = mockPayment.tandaTanganiWebhook(payload);

    const reqGagal = new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
      },
      body: rawBody,
    });

    const resGagal = await webhookRoute.POST(reqGagal);
    expect(resGagal.status).toBe(200);

    const pencairanDB = db
      .prepare(
        `SELECT status_pencairan FROM pencairan_dana WHERE id_pencairan = ?`,
      )
      .get(idPencairan) as { status_pencairan: string };
    expect(pencairanDB.status_pencairan).toBe("GAGAL");

    const dompetSetelahGagal = await (await dompetRoute.GET()).json();
    expect(dompetSetelahGagal.saldo).toBe(saldoSaatDiproses);
    expect(dompetSetelahGagal.saldoTersedia).toBe(
      saldoTersediaSaatDiproses + nominalTarik,
    );
  });

  it("Webhook dengan signature salah mengembalikan 401 UNAUTHORIZED", async () => {
    const payload = {
      jenis: "PENCAIRAN",
      idPencairan: randomUUID(),
      nominal: 50000,
      status: "BERHASIL",
    };
    const req = new Request("http://localhost/api/webhooks/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": "signature-palsu-123456",
      },
      body: JSON.stringify(payload),
    });

    const res = await webhookRoute.POST(req);
    expect(res.status).toBe(401);
  });
});
