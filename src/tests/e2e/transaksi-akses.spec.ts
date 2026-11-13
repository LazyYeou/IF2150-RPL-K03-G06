import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";

let idTransaksi: string;
let judul: string;
const emailPkLain = `pk-akses-${randomUUID()}@kerjain.test`;
const password = "Password123!";

async function masuk(request: APIRequestContext, email: string) {
  expect(
    (
      await request.post("/api/auth/login", { data: { email, password } })
    ).status(),
  ).toBe(200);
}

test.beforeAll(async ({ request }) => {
  await masuk(request, "tk1@kerjain.test");
  const response = await request.get("/api/transaksi?peran=TK");
  expect(response.status()).toBe(200);
  const { items } = await response.json();
  expect(items.length).toBeGreaterThan(0);
  idTransaksi = items[0].id;
  judul = items[0].judul;
  const registrasi = await request.post("/api/auth/register", {
    data: {
      nama: "PK Non Peserta",
      email: emailPkLain,
      password,
      peran: "PK",
      tanggalLahir: "1995-01-01",
      persetujuanPrivasi: true,
    },
  });
  expect(registrasi.status()).toBe(201);
});

for (const { peran, prefix, pemilik, nonPeserta } of [
  {
    peran: "TK",
    prefix: "/tk/pekerjaan",
    pemilik: "tk1@kerjain.test",
    nonPeserta: "tk2@kerjain.test",
  },
  {
    peran: "PK",
    prefix: "/pk/transaksi",
    pemilik: "pk1@kerjain.test",
    nonPeserta: emailPkLain,
  },
]) {
  test.describe(`akses detail ${peran}`, () => {
    test("peserta dapat membuka transaksi miliknya", async ({ page }) => {
      await masuk(page.request, pemilik);
      const response = await page.goto(`${prefix}/${idTransaksi}`);
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { name: judul, exact: true }),
      ).toBeVisible();
    });

    test("non-peserta melihat halaman 403 dan API tetap menolak", async ({
      page,
    }) => {
      await masuk(page.request, nonPeserta);
      const response = await page.goto(`${prefix}/${idTransaksi}`);
      expect(response?.status()).toBe(403);
      await expect(
        page.getByRole("heading", { name: "403 - Akses ditolak", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: judul, exact: true }),
      ).toHaveCount(0);
      expect(
        (await page.request.get(`/api/transaksi/${idTransaksi}`)).status(),
      ).toBe(403);
    });

    test("transaksi tidak ditemukan menampilkan 404", async ({ page }) => {
      await masuk(page.request, pemilik);
      const response = await page.goto(`${prefix}/${randomUUID()}`);
      expect(response?.status()).toBe(404);
      await expect(
        page.getByRole("heading", {
          name: "Halaman tidak ditemukan",
          exact: true,
        }),
      ).toBeVisible();
    });

    test("format ID yang salah menampilkan 404", async ({ page }) => {
      await masuk(page.request, pemilik);
      const response = await page.goto(`${prefix}/bukan-uuid`);
      expect(response?.status()).toBe(404);
      await expect(
        page.getByRole("heading", {
          name: "Halaman tidak ditemukan",
          exact: true,
        }),
      ).toBeVisible();
    });

    test("tanpa sesi diarahkan ke halaman masuk", async ({ page }) => {
      const tujuan = `${prefix}/${idTransaksi}`;
      const response = await page.goto(tujuan);
      expect(response?.status()).toBeLessThan(500);
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === "/masuk" && url.searchParams.get("next") === tujuan,
      );
      expect(
        (await page.request.get(`/api/transaksi/${idTransaksi}`)).status(),
      ).toBe(401);
    });

    test("cookie sesi tidak valid diarahkan ke halaman masuk tanpa error server", async ({
      page,
      context,
      baseURL,
    }) => {
      await context.addCookies([
        { name: "kerjain_sesi", value: "sesi-tidak-valid", url: baseURL! },
      ]);
      const response = await page.goto(`${prefix}/${idTransaksi}`);
      expect(response?.status()).toBeLessThan(500);
      await expect(page).toHaveURL((url) => url.pathname === "/masuk");
      expect(
        (await page.request.get(`/api/transaksi/${idTransaksi}`)).status(),
      ).toBe(401);
    });
  });
}

test("CS tetap dapat mengakses detail melalui API", async ({ request }) => {
  await masuk(request, "cs1@kerjain.test");
  const response = await request.get(`/api/transaksi/${idTransaksi}`);
  expect(response.status()).toBe(200);
  expect((await response.json()).id).toBe(idTransaksi);
});
