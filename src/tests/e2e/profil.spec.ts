import { test, expect } from "@playwright/test";
test("profil tersimpan dan nama header/sidebar/dashboard diperbarui", async ({
  page,
}) => {
  expect(
    (
      await page.request.post("/api/auth/login", {
        data: { email: "tk1@kerjain.test", password: "Password123!" },
      })
    ).ok(),
  ).toBe(true);
  await page.goto("/profil");
  await expect(page.getByText("Terverifikasi", { exact: true })).toBeVisible();
  await page.getByLabel("Nama lengkap", { exact: true }).fill("Profil Terbaru");
  await page
    .getByLabel("Area layanan", { exact: true })
    .fill("Bandung dan sekitarnya");
  await page
    .getByLabel("Tentang saya", { exact: true })
    .fill("Berpengalaman membantu pekerjaan harian.");
  await page
    .getByRole("button", { name: "Simpan perubahan", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Profil berhasil disimpan",
  );
  await expect(
    page.locator('header [data-slot="header-user-name"]'),
  ).toHaveText("Profil Terbaru");
  await expect(
    page.locator("aside").getByText("Profil Terbaru", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nama lengkap", { exact: true })).toHaveValue(
    "Profil Terbaru",
  );
  await page
    .getByRole("navigation", { name: "Navigasi ruang kerja", exact: true })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Selamat datang, Profil.", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/profil");
  const heading = await page
    .getByRole("region", { name: "Ringkasan profil" })
    .getByRole("heading")
    .boundingBox();
  expect(heading!.width).toBeGreaterThan(150);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("halaman informasi publik dan status HTTP 404 sungguhan", async ({
  page,
}) => {
  for (const [path, title] of [
    ["/privasi", "Kebijakan Privasi"],
    ["/syarat", "Ketentuan Penggunaan"],
    ["/ketentuan", "Ketentuan Penggunaan"],
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  const response = await page.goto("/halaman-tidak-ada-issue-27");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Halaman tidak ditemukan", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Kembali ke beranda", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
});
test("profil memerlukan login", async ({ page }) => {
  await page.goto("/profil");
  await expect(page).toHaveURL(/\/masuk$/);
  expect((await page.request.get("/api/profil")).status()).toBe(401);
});
