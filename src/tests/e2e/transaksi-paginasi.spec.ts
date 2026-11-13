import { expect, test } from "@playwright/test";

// Dijalankan dengan DB fixture sementara berisi >12 transaksi (helpers/transaksi.ts).
for (const { peran, path, email } of [
  { peran: "TK", path: "/tk/pekerjaan", email: "tk1@kerjain.test" },
  { peran: "PK", path: "/pk/transaksi", email: "pk1@kerjain.test" },
]) {
  test(`${peran}: paginasi dan filter status tetap konsisten`, async ({
    page,
  }) => {
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { email, password: "Password123!" },
        })
      ).ok(),
    ).toBe(true);
    await page.goto(path);
    const daftar = page.getByRole("region", {
      name: "Daftar transaksi",
      exact: true,
    });
    const judul = () =>
      daftar.getByRole("heading", { level: 3 }).allTextContents();
    const pertama = await judul();
    expect(pertama.length).toBe(12);
    const nav = page.getByRole("navigation", { name: "Paginasi transaksi" });
    await nav.getByRole("link", { name: "Berikutnya", exact: true }).click();
    await expect(page).toHaveURL((url) => url.searchParams.get("page") === "2");
    await expect(nav).toContainText("Halaman 2");
    const kedua = await judul();
    expect(kedua.length).toBe(12);
    expect(kedua.some((judul) => pertama.includes(judul))).toBe(false);
    await nav.getByRole("link", { name: "Sebelumnya", exact: true }).click();
    await expect(nav).toContainText("Halaman 1");
    expect(await judul()).toEqual(pertama);

    await page
      .getByLabel("Status transaksi", { exact: true })
      .selectOption("SUBMITTED");
    await page.getByRole("button", { name: "Terapkan filter" }).click();
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get("page") === "1" &&
        url.searchParams.get("status") === "SUBMITTED",
    );
    await expect(
      nav.getByRole("link", { name: "Berikutnya", exact: true }),
    ).toHaveAttribute("href", `${path}?page=2&status=SUBMITTED`);
    await nav.getByRole("link", { name: "Berikutnya", exact: true }).click();
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get("page") === "2" &&
        url.searchParams.get("status") === "SUBMITTED",
    );
    await expect(daftar.getByRole("heading", { level: 3 })).toHaveCount(3);
    await expect(
      page.getByLabel("Status transaksi", { exact: true }),
    ).toHaveValue("SUBMITTED");
    const filtered = await (
      await page.request.get(
        `/api/transaksi?peran=${peran}&status=SUBMITTED&page=2`,
      )
    ).json();
    expect(await judul()).toEqual(
      filtered.items.map((item: { judul: string }) => item.judul),
    );

    // Mengganti filter dari halaman 2 selalu kembali ke halaman 1.
    await page
      .getByLabel("Status transaksi", { exact: true })
      .selectOption("COMPLETED");
    await page.getByRole("button", { name: "Terapkan filter" }).click();
    await expect(nav).toContainText("Halaman 1 dari 1");
    await expect(daftar.getByRole("heading", { level: 3 })).toHaveCount(1);
    await expect(
      nav.getByRole("link", { name: "Berikutnya", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Hapus filter", exact: true }).click();
    await expect(
      page.getByLabel("Status transaksi", { exact: true }),
    ).toHaveValue("");
    await expect(daftar.getByRole("heading", { level: 3 })).toHaveCount(12);
  });

  test(`${peran}: halaman di luar jangkauan kembali ke halaman terakhir`, async ({
    page,
  }) => {
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { email, password: "Password123!" },
        })
      ).ok(),
    ).toBe(true);
    await page.goto(`${path}?page=999&status=COMPLETED`);
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get("page") === "1" &&
        url.searchParams.get("status") === "COMPLETED",
    );
    await expect(
      page
        .getByRole("region", { name: "Daftar transaksi", exact: true })
        .getByRole("heading", { level: 3 }),
    ).toHaveCount(1);
  });
}

test("timeline sengketa mempertahankan tahap penyerahan", async ({ page }) => {
  expect(
    (
      await page.request.post("/api/auth/login", {
        data: { email: "tk1@kerjain.test", password: "Password123!" },
      })
    ).ok(),
  ).toBe(true);
  const { items } = await (
    await page.request.get("/api/transaksi?peran=TK&status=DISENGKETAKAN")
  ).json();
  await page.goto(`/tk/pekerjaan/${items[0].id}`);
  const tahap = page
    .getByRole("listitem")
    .filter({ hasText: "Menunggu pemeriksaan" });
  await expect(
    tahap.getByRole("img", { name: "Tahap sudah tercapai", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText(
    "Dalam peninjauan CS",
  );
});

test("timeline pembatalan sebelum pembayaran tidak menandai pekerjaan berjalan", async ({
  page,
}) => {
  expect(
    (
      await page.request.post("/api/auth/login", {
        data: { email: "tk1@kerjain.test", password: "Password123!" },
      })
    ).ok(),
  ).toBe(true);
  const { items } = await (
    await page.request.get("/api/transaksi?peran=TK&status=DIBATALKAN")
  ).json();
  expect(items.length).toBeGreaterThan(0);
  await page.goto(`/tk/pekerjaan/${items[0].id}`);
  const tahap = page
    .getByRole("listitem")
    .filter({ hasText: "Sedang dikerjakan" });
  await expect(
    tahap.getByRole("img", { name: "Tahap belum tercapai", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText(
    "Dibatalkan",
  );
});
