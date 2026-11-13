import { randomUUID } from "node:crypto";
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const password = "Password123!";
async function masuk(request: APIRequestContext, email = "tk1@kerjain.test") {
  expect(
    (
      await request.post("/api/auth/login", { data: { email, password } })
    ).status(),
  ).toBe(200);
}
async function lowongan(request: APIRequestContext) {
  await masuk(request, "pk1@kerjain.test");
  const res = await request.post("/api/lowongan", {
    data: {
      judul: `Lowongan UI ${randomUUID()}`,
      deskripsi: "Pekerjaan pengujian penawaran lewat UI dan API nyata.",
      ruangLingkup: "Bersihkan area kerja",
      kriteriaHasil: "Area bersih sesuai kesepakatan",
      kategori: "Kebersihan",
      lokasi: "Bandung",
      tanggalPekerjaan: "2026-11-20",
      estimasiDurasi: "2 jam",
      upah: 50000,
      satuanUpah: "PER_TUGAS",
      kuota: 2,
      pernyataanRisiko: false,
    },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as { id: string; judul: string };
}
async function isi(page: Page, id: string) {
  await page.goto(`/lowongan/${id}`);
  await page
    .getByRole("button", { name: "Ajukan Penawaran", exact: true })
    .click();
  await page.getByLabel("Upah penawaran (Rp)", { exact: true }).fill("1500");
  await page
    .getByLabel("Kapan kamu tersedia?", { exact: true })
    .fill("20 November pukul 09.00 WIB");
  await page
    .getByLabel("Pesan untuk penyedia (opsional)", { exact: true })
    .fill("Siap bekerja sesuai ruang lingkup.");
  await page
    .getByRole("button", { name: "Tinjau penawaran", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Tinjau penawaranmu" }),
  ).toBeVisible();
}
async function kirim(page: Page) {
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/penawaran") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Ajukan penawaran", exact: true })
    .click();
  return await response;
}

test("UI nyata: pengajuan masuk database/PK, tarik, ajukan ulang, dan dashboard berubah", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  const awal = await (
    await page.request.get("/api/penawaran/saya?status=MENUNGGU")
  ).json();
  await isi(page, job.id);
  const res = await kirim(page);
  expect(res.status()).toBe(201);
  const submitted = await res.json();
  await expect(
    page.getByText("Penawaran sudah diajukan", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Penawaran sudah diajukan", { exact: true }),
  ).toBeVisible();
  const pk = await request.get(`/api/lowongan/${job.id}/pelamar`);
  expect(pk.status()).toBe(200);
  expect((await pk.json()).items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        idPenawaran: submitted.id,
        hargaPenawaran: 1500,
        pesan: "Siap bekerja sesuai ruang lingkup.",
      }),
    ]),
  );
  const notif = await request.get("/api/notifikasi");
  expect(JSON.stringify(await notif.json())).toContain(job.judul);
  await page.goto("/tk");
  await expect(
    page
      .getByRole("link")
      .filter({ hasText: "Penawaran menunggu" })
      .locator("strong"),
  ).toHaveText(String(awal.total + 1));
  await page.goto("/tk/lamaran?status=MENUNGGU&page=1");
  const card = page.getByRole("article").filter({ hasText: job.judul });
  await expect(card).toBeVisible();
  await card
    .getByRole("button", { name: "Tarik penawaran", exact: true })
    .click();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(card).toBeVisible();
  expect(
    (
      await (
        await page.request.get("/api/penawaran/saya?status=MENUNGGU")
      ).json()
    ).items.some((x: { id: string }) => x.id === submitted.id),
  ).toBe(true);
  await card
    .getByRole("button", { name: "Tarik penawaran", exact: true })
    .click();
  const withdrawn = page.waitForResponse((r) =>
    r.url().endsWith(`/api/penawaran/${submitted.id}/tarik`),
  );
  await page
    .getByRole("button", { name: "Ya, tarik penawaran", exact: true })
    .click();
  expect((await withdrawn).status()).toBe(200);
  await expect(card).toHaveCount(0);
  await page.goto("/tk");
  await expect(
    page
      .getByRole("link")
      .filter({ hasText: "Penawaran menunggu" })
      .locator("strong"),
  ).toHaveText(String(awal.total));
  await page.goto("/tk/lamaran?status=DITARIK&page=1");
  const ditarik = page.getByRole("article").filter({ hasText: job.judul });
  await expect(ditarik).toContainText("Ditarik");
  await expect(
    ditarik.getByRole("button", { name: "Tarik penawaran", exact: true }),
  ).toHaveCount(0);
  await isi(page, job.id);
  expect((await kirim(page)).status()).toBe(201);
});

for (const width of [360, 768, 1280]) {
  test(`dialog penawaran ${width}px: fokus, validasi, tinjau/ubah, Escape tanpa kirim`, async ({
    page,
    request,
  }) => {
    const job = await lowongan(request);
    await masuk(page.request);
    await page.setViewportSize({ width, height: 900 });
    let posts = 0;
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().endsWith("/api/penawaran"))
        posts++;
    });
    await page.goto(`/lowongan/${job.id}`);
    const trigger = page.getByRole("button", {
      name: "Ajukan Penawaran",
      exact: true,
    });
    await trigger.click();
    let dialog = page.getByRole("dialog", {
      name: "Ajukan penawaran",
      exact: true,
    });
    await expect(
      page.getByLabel("Upah penawaran (Rp)", { exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Tinjau penawaran", exact: true })
      .click();
    await expect(dialog.getByRole("alert")).toContainText("Periksa isian");
    await page.getByLabel("Upah penawaran (Rp)", { exact: true }).fill("999");
    await page
      .getByLabel("Kapan kamu tersedia?", { exact: true })
      .fill("Jumat pagi");
    await page
      .getByRole("button", { name: "Tinjau penawaran", exact: true })
      .click();
    await expect(
      page.getByLabel("Upah penawaran (Rp)", { exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
    await page.getByLabel("Upah penawaran (Rp)", { exact: true }).fill("1500");
    await page
      .getByRole("button", { name: "Tinjau penawaran", exact: true })
      .click();
    dialog = page.getByRole("dialog", {
      name: "Tinjau penawaranmu",
      exact: true,
    });
    await expect(dialog).toContainText("Jumat pagi");
    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press(key);
        await expect
          .poll(
            async () =>
              dialog.evaluate((el) => ({
                inside: el.contains(document.activeElement),
                tag: document.activeElement?.tagName,
                id: document.activeElement?.id,
                guard: document.activeElement?.getAttribute(
                  "data-base-ui-focus-guard",
                ),
              })),
            { timeout: 1500 },
          )
          .toMatchObject({ inside: true });
      }
    }
    for (const button of await dialog.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    await dialog.getByRole("button", { name: "Ubah", exact: true }).click();
    await expect(
      page.getByLabel("Upah penawaran (Rp)", { exact: true }),
    ).toHaveValue("1500");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(posts).toBe(0);
  });
}

test("penawaran ganda dari tab lain menampilkan error API 409 tanpa data tambahan", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  await isi(page, job.id);
  const first = await page.request.post("/api/penawaran", {
    data: {
      idLowongan: job.id,
      hargaPenawaran: 50000,
      ketersediaan: "Jumat pagi",
    },
  });
  expect(first.status()).toBe(201);
  expect((await kirim(page)).status()).toBe(409);
  await expect(page.getByRole("alert")).toContainText(
    "sudah mengajukan penawaran",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("Penawaran sudah diajukan", { exact: true }),
  ).toBeVisible();
  const own = await (
    await page.request.get("/api/penawaran/saya?status=MENUNGGU")
  ).json();
  expect(
    own.items.filter(
      (x: { lowongan: { id: string } }) => x.lowongan.id === job.id,
    ),
  ).toHaveLength(1);
});

test("klik kirim berulang hanya menghasilkan satu permintaan", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  await isi(page, job.id);
  let count = 0;
  await page.route("**/api/penawaran", async (route) => {
    count++;
    await new Promise((r) => setTimeout(r, 250));
    await route.continue();
  });
  const submit = page.getByRole("button", {
    name: "Ajukan penawaran",
    exact: true,
  });
  await submit.evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(
    page.getByText("Penawaran sudah diajukan", { exact: true }),
  ).toBeVisible();
  expect(count).toBe(1);
});

for (const email of [
  null,
  "tk2@kerjain.test",
  "pk1@kerjain.test",
  "cs1@kerjain.test",
]) {
  test(`gate pengajuan: ${email ?? "tanpa sesi"}`, async ({
    page,
    request,
  }) => {
    const job = await lowongan(request);
    if (email) await masuk(page.request, email);
    await page.goto(`/lowongan/${job.id}`);
    await expect(
      page.getByRole("button", { name: "Ajukan Penawaran", exact: true }),
    ).toHaveCount(0);
    if (!email)
      await expect(
        page.getByRole("link", { name: "Masuk untuk mengajukan penawaran" }),
      ).toHaveAttribute(
        "href",
        `/masuk?next=${encodeURIComponent(`/lowongan/${job.id}`)}`,
      );
    else if (email.startsWith("tk2"))
      await expect(
        page.getByText("Identitas harus terverifikasi", { exact: false }),
      ).toBeVisible();
    else
      await expect(
        page.getByText(
          "Penawaran hanya dapat diajukan oleh akun tenaga kerja.",
          { exact: true },
        ),
      ).toBeVisible();
  });
}

test("API 403 NOT_VERIFIED yang datang setelah form dibuka ditampilkan", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  await isi(page, job.id);
  await page.route("**/api/penawaran", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "NOT_VERIFIED",
          message: "Akun Anda belum terverifikasi",
        },
      }),
    }),
  );
  await kirim(page);
  await expect(page.getByRole("alert")).toContainText("belum terverifikasi");
  await expect(
    page.getByRole("link", { name: "Verifikasi identitas" }),
  ).toHaveAttribute("href", "/tk/verifikasi");
});

test("lamaran memakai data akun sendiri, status, paginasi, dan refresh URL", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  expect(
    (
      await page.request.post("/api/penawaran", {
        data: {
          idLowongan: job.id,
          hargaPenawaran: 50000,
          ketersediaan: "Khusus TK pertama",
        },
      })
    ).status(),
  ).toBe(201);
  await page.goto("/tk/lamaran?status=DITERIMA&page=1");
  const list = page.getByRole("region", {
    name: "Daftar lamaran",
    exact: true,
  });
  await expect(list.getByRole("article")).toHaveCount(12);
  const first = await list.getByRole("heading").allTextContents();
  await page
    .getByRole("navigation", { name: "Paginasi lamaran" })
    .getByRole("link", { name: "Berikutnya", exact: true })
    .click();
  await expect(page).toHaveURL(/status=DITERIMA/);
  await expect(page).toHaveURL(/page=2/);
  await expect(
    page.getByText("Halaman 2 dari", { exact: false }),
  ).toBeVisible();
  const second = await list.getByRole("heading").allTextContents();
  expect(second.some((title) => first.includes(title))).toBe(false);
  await page.reload();
  await expect(page.getByLabel("Status lamaran", { exact: true })).toHaveValue(
    "DITERIMA",
  );
  await expect(list.getByRole("heading")).toHaveCount(second.length);
  await masuk(page.request, "tk2@kerjain.test");
  await page.goto("/tk/lamaran");
  await expect(
    page.getByRole("heading", { name: "Lamaran saya", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Daftar lamaran", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: job.judul, exact: true }),
  ).toHaveCount(0);
  const api = await (await page.request.get("/api/penawaran/saya")).json();
  expect(
    api.items.some(
      (x: { lowongan: { id: string } }) => x.lowongan.id === job.id,
    ),
  ).toBe(false);
});

test("penawaran diterima tidak punya tombol tarik; request lama ditolak 409", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  const post = await page.request.post("/api/penawaran", {
    data: { idLowongan: job.id, hargaPenawaran: 50000, ketersediaan: "Senin" },
  });
  expect(post.status()).toBe(201);
  const offer = await post.json();
  expect(
    (await request.post(`/api/penawaran/${offer.id}/terima`)).status(),
  ).toBe(200);
  let acceptedPage = 1;
  while (true) {
    const own = await (
      await page.request.get(
        `/api/penawaran/saya?status=DITERIMA&page=${acceptedPage}`,
      )
    ).json();
    if (own.items.some((item: { id: string }) => item.id === offer.id)) break;
    expect(acceptedPage * own.pageSize).toBeLessThan(own.total);
    acceptedPage++;
  }
  await page.goto(`/tk/lamaran?status=DITERIMA&page=${acceptedPage}`);
  const card = page.getByRole("article").filter({ hasText: job.judul });
  await expect(card).toContainText("Diterima");
  await expect(
    card.getByRole("button", { name: "Tarik penawaran", exact: true }),
  ).toHaveCount(0);
  expect(
    (await page.request.post(`/api/penawaran/${offer.id}/tarik`)).status(),
  ).toBe(409);
});

test("error koneksi daftar ditampilkan dan Coba lagi memuat API kembali", async ({
  page,
}) => {
  await masuk(page.request);
  let gagal = true;
  await page.route("**/api/penawaran/saya?*", async (route) => {
    if (gagal) await route.abort();
    else await route.continue();
  });
  await page.goto("/tk/lamaran");
  await expect(
    page.getByRole("alert").filter({ hasText: "Tidak dapat memuat lamaran" }),
  ).toBeVisible();
  gagal = false;
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Daftar lamaran", exact: true }),
  ).toBeVisible();
});

test("sesi kedaluwarsa setelah tinjau menampilkan 401 dan tautan masuk", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  await isi(page, job.id);
  await page.context().clearCookies();
  expect((await kirim(page)).status()).toBe(401);
  const dialog = page.getByRole("dialog", { name: "Tinjau penawaranmu" });
  await expect(dialog.getByRole("alert")).toContainText("Silakan masuk");
  await expect(
    dialog.getByRole("link", { name: "Masuk kembali" }),
  ).toHaveAttribute(
    "href",
    `/masuk?next=${encodeURIComponent(`/lowongan/${job.id}`)}`,
  );
});

test("penawaran dipilih dari tab PK ketika konfirmasi tarik terbuka tidak dapat ditarik", async ({
  page,
  request,
}) => {
  const job = await lowongan(request);
  await masuk(page.request);
  const offer = await (
    await page.request.post("/api/penawaran", {
      data: {
        idLowongan: job.id,
        hargaPenawaran: 50000,
        ketersediaan: "Selasa pagi",
      },
    })
  ).json();
  await page.goto("/tk/lamaran?status=MENUNGGU&page=1");
  const card = page.getByRole("article").filter({ hasText: job.judul });
  await expect(card).toBeVisible();
  await card
    .getByRole("button", { name: "Tarik penawaran", exact: true })
    .click();
  expect(
    (await request.post(`/api/penawaran/${offer.id}/terima`)).status(),
  ).toBe(200);
  const rejected = page.waitForResponse((r) =>
    r.url().endsWith(`/api/penawaran/${offer.id}/tarik`),
  );
  await page
    .getByRole("button", { name: "Ya, tarik penawaran", exact: true })
    .click();
  expect((await rejected).status()).toBe(409);
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Hanya penawaran yang masih menunggu",
  );
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(card).toHaveCount(0);
  const detail = await (
    await page.request.get(`/api/lowongan/${job.id}`)
  ).json();
  expect(detail.penawaranSaya.status).toBe("DITERIMA");
});
