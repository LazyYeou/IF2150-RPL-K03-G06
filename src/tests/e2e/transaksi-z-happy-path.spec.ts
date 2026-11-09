import Database from "better-sqlite3";
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const password = "Password123!";
const emailPK = "pk1@kerjain.test";
const emailTK = "tk1@kerjain.test";
const emailTKBelumTerverifikasi = "tk2@kerjain.test";
let idLowongan: string;

async function login(page: Page, email: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(response.status(), `Login ${email}`).toBe(200);
}

async function logout(page: Page) {
  expect((await page.request.post("/api/auth/logout")).status()).toBe(204);
}

function saldoTK(): number {
  const fixtureDir = process.env.TRANSAKSI_E2E_DIR;
  if (!fixtureDir) throw new Error("DB fixture e2e tidak tersedia");
  const db = new Database(path.join(fixtureDir, "test.db"), {
    readonly: true,
  });
  try {
    const row = db
      .prepare(
        `SELECT tk.saldo_pendapatan AS saldo
         FROM tenaga_kerja tk
         JOIN pengguna p USING (id_pengguna)
         WHERE p.email = ?`,
      )
      .get(emailTK) as { saldo: number } | undefined;
    if (!row) throw new Error("Saldo tenaga kerja fixture tidak ditemukan");
    return row.saldo;
  } finally {
    db.close();
  }
}

test.describe.configure({ mode: "serial" });

test("PK dan TK menyelesaikan seluruh alur transaksi dan saling memberi ulasan", async ({
  page,
}) => {
  const saldoAwal = saldoTK();
  const judul = `E2E pekerjaan ${Date.now()}`;

  await login(page, emailPK);
  const lowonganResponse = await page.request.post("/api/lowongan", {
    data: {
      judul,
      deskripsi: "Merapikan taman kecil dan membersihkan area kerja.",
      ruangLingkup: "Merapikan tanaman dan membersihkan sisa daun.",
      kriteriaHasil: "Taman rapi dan seluruh area bersih.",
      kategori: "Kebersihan",
      lokasi: "Coblong, Bandung",
      tanggalPekerjaan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      estimasiDurasi: "4 jam",
      upah: 125000,
      satuanUpah: "PER_TUGAS",
      kuota: 1,
      pernyataanRisiko: false,
    },
  });
  expect(lowonganResponse.status()).toBe(201);
  const lowongan = await lowonganResponse.json();
  idLowongan = lowongan.id;
  expect(lowongan).toMatchObject({ judul, status: "OPEN", jumlahDiterima: 0 });

  await logout(page);
  await login(page, emailTKBelumTerverifikasi);
  const detailLowongan = await page.goto(`/lowongan/${idLowongan}`);
  expect(detailLowongan?.status()).toBe(200);
  await expect(
    page.getByRole("button", { name: /ajukan penawaran/i }),
  ).toHaveCount(0);
  const penawaranDitolak = await page.request.post("/api/penawaran", {
    data: {
      idLowongan,
      hargaPenawaran: 125000,
      ketersediaan: "Sesuai jadwal",
    },
  });
  expect(penawaranDitolak.status()).toBe(403);
  expect((await penawaranDitolak.json()).error.code).toBe("NOT_VERIFIED");

  await logout(page);
  await login(page, emailTK);
  await page.goto(`/lowongan/${idLowongan}`);
  const tombolAjukan = page.getByRole("button", {
    name: "Ajukan penawaran",
    exact: true,
  });
  await expect(tombolAjukan).toBeVisible();
  await tombolAjukan.click();
  await page.getByLabel("Upah penawaran (Rp)").fill("125000");
  await page.getByLabel("Kapan kamu tersedia?").fill("Sesuai jadwal");
  await page
    .getByLabel("Pesan untuk penyedia (opsional)")
    .fill("Saya siap mengerjakan sesuai ruang lingkup.");
  await page.getByRole("button", { name: "Tinjau penawaran" }).click();
  await expect(
    page.getByRole("heading", { name: "Tinjau penawaranmu" }),
  ).toBeVisible();
  const penawaranRequest = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/penawaran",
  );
  await page
    .getByRole("button", { name: "Ajukan penawaran", exact: true })
    .last()
    .click();
  const penawaranResponse = await penawaranRequest;
  expect(penawaranResponse.status()).toBe(201);
  const penawaran = await penawaranResponse.json();
  expect(penawaran).toMatchObject({
    lowongan: { id: idLowongan, judul },
    status: "MENUNGGU",
  });
  await expect(
    page.getByText("Penawaranmu sedang menunggu tanggapan.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Lihat lamaran saya" }),
  ).toHaveAttribute("href", "/tk/lamaran");

  await logout(page);
  await login(page, emailPK);
  const daftarPelamar = await page.request.get(
    `/api/lowongan/${idLowongan}/pelamar`,
  );
  expect(daftarPelamar.status()).toBe(200);
  const pelamar = (await daftarPelamar.json()).items.find(
    (item: { idPenawaran: string }) => item.idPenawaran === penawaran.id,
  );
  expect(pelamar?.status).toBe("MENUNGGU");

  const terimaResponse = await page.request.post(
    `/api/penawaran/${penawaran.id}/terima`,
  );
  expect(terimaResponse.status()).toBe(200);
  const { idTransaksi } = await terimaResponse.json();

  const tagihanResponse = await page.request.post(
    `/api/transaksi/${idTransaksi}/tagihan`,
  );
  expect(tagihanResponse.status()).toBe(201);
  const tagihan = await tagihanResponse.json();
  const bayarResponse = await page.request.post(
    `/api/tagihan/${tagihan.id}/bayar`,
    { data: { metode: "QRIS" } },
  );
  expect(bayarResponse.status()).toBe(200);
  const { redirectUrl } = await bayarResponse.json();
  await page.goto(redirectUrl);
  await expect(
    page.getByRole("heading", { name: /Simulasi Gateway Pembayaran/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bayar Berhasil" }).click();
  await expect(page).toHaveURL(new RegExp(`/pk/transaksi/${idTransaksi}$`), {
    timeout: 10000,
  });
  const setelahBayar = await page.request.get(`/api/transaksi/${idTransaksi}`);
  expect(setelahBayar.status()).toBe(200);
  expect(await setelahBayar.json()).toMatchObject({
    status: "IN_PROGRESS",
    tagihan: { status: "BERHASIL" },
  });

  await logout(page);
  await login(page, emailTK);
  await page.goto(`/tk/pekerjaan/${idTransaksi}`);
  const unggahBukti = await page.request.post(
    `/api/transaksi/${idTransaksi}/bukti`,
    {
      multipart: {
        deskripsi:
          "Pekerjaan selesai rapi dan sesuai kriteria yang disepakati.",
        berkas: {
          name: "bukti.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4\nBukti pekerjaan selesai\n%%EOF"),
        },
      },
    },
  );
  expect(unggahBukti.status()).toBe(201);
  await page.reload();
  await expect(
    page.getByText(
      "Pekerjaan selesai rapi dan sesuai kriteria yang disepakati.",
      { exact: true },
    ),
  ).toBeVisible();
  const buktiDetail = await page.request.get(`/api/transaksi/${idTransaksi}`);
  expect((await buktiDetail.json()).status).toBe("SUBMITTED");

  await logout(page);
  await login(page, emailPK);
  const saldoSebelumSetujui = saldoTK();
  await page.goto(`/pk/transaksi/${idTransaksi}`);
  await page
    .getByRole("button", { name: "Terima hasil pekerjaan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ya, setujui hasil", exact: true })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/pk/transaksi/${idTransaksi}/ulasan$`),
  );
  expect(saldoTK()).toBe(saldoSebelumSetujui + 125000);
  expect(saldoTK()).toBe(saldoAwal + 125000);

  await page.locator('input[name="nilai"][value="5"]').check({ force: true });
  await page
    .getByLabel("Ulasan (opsional)")
    .fill("Pekerjaan selesai sesuai kesepakatan.");
  await page.getByRole("button", { name: "Kirim ulasan" }).click();
  await expect(page).toHaveURL(new RegExp(`/pk/transaksi/${idTransaksi}$`));

  await logout(page);
  await login(page, emailTK);
  await page.goto(`/tk/pekerjaan/${idTransaksi}`);
  await page.getByRole("button", { name: "Beri ulasan", exact: true }).click();
  await page.locator('input[name="nilai"][value="4"]').check({ force: true });
  await page
    .getByLabel("Ulasan (opsional)")
    .fill("Penyedia kerja memberi instruksi yang jelas.");
  await page.getByRole("button", { name: "Kirim ulasan" }).click();
  await expect(page).toHaveURL(new RegExp(`/tk/pekerjaan/${idTransaksi}$`));

  const detailFinal = await page.request.get(`/api/transaksi/${idTransaksi}`);
  expect(detailFinal.status()).toBe(200);
  expect((await detailFinal.json()).status).toBe("COMPLETED");
  const db = new Database(
    path.join(process.env.TRANSAKSI_E2E_DIR!, "test.db"),
    { readonly: true },
  );
  try {
    const ratings = db
      .prepare(
        `SELECT p.email AS penilai, u.nilai, u.deskripsi_ulasan AS deskripsi
         FROM ulasan_rating u
         JOIN pengguna p ON p.id_pengguna = u.id_penilai
         WHERE u.id_transaksi = ?
         ORDER BY p.email`,
      )
      .all(idTransaksi);
    expect(ratings).toHaveLength(2);
    expect(ratings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          penilai: emailPK,
          nilai: 5,
          deskripsi: "Pekerjaan selesai sesuai kesepakatan.",
        }),
        expect.objectContaining({
          penilai: emailTK,
          nilai: 4,
          deskripsi: "Penyedia kerja memberi instruksi yang jelas.",
        }),
      ]),
    );
    const mutasiUpah = db
      .prepare(
        `SELECT COUNT(*) AS jumlah FROM mutasi_saldo
         WHERE kunci_operasi = ?`,
      )
      .get(`upah:${idTransaksi}`) as { jumlah: number };
    expect(mutasiUpah.jumlah).toBe(1);
  } finally {
    db.close();
  }
});

test("tenaga kerja belum terverifikasi tidak dapat mengajukan penawaran", async ({
  page,
}) => {
  await login(page, emailTKBelumTerverifikasi);
  await page.goto(`/lowongan/${idLowongan}`);
  await expect(
    page.getByRole("button", { name: /ajukan penawaran/i }),
  ).toHaveCount(0);
  const status = await page.request.get("/api/verifikasi/status");
  expect(status.status()).toBe(200);
  expect((await status.json()).status).not.toBe("TERVERIFIKASI");
});
