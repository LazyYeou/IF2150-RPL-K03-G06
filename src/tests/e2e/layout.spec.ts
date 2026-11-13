import { test, expect, type Page } from "@playwright/test";

async function masuk(page: Page, email: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password: "Password123!" },
  });
  expect(response.ok()).toBe(true);
}
for (const [akun, path, heading, menus] of [
  [
    "tk1",
    "/tk",
    "Selamat datang, Siti.",
    [
      "Dashboard",
      "Lamaran saya",
      "Pekerjaan saya",
      "Verifikasi identitas",
      "Dompet",
      "Profil saya",
    ],
  ],
  [
    "pk1",
    "/pk",
    "Selamat datang, Budi.",
    ["Dashboard", "Lowongan saya", "Transaksi", "Profil saya"],
  ],
  [
    "cs1",
    "/cs/verifikasi",
    "Antrean verifikasi identitas",
    ["Verifikasi identitas", "Tiket & sengketa"],
  ],
] as const) {
  test(`layout ${akun}: menu peran, ukuran target sentuh, dan tanpa mode akun`, async ({
    page,
  }) => {
    await masuk(page, `${akun}@kerjain.test`);
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    const nav = page.getByRole("navigation", {
      name: "Navigasi ruang kerja",
      exact: true,
    });
    await expect(nav.getByRole("link")).toHaveCount(menus.length);
    for (const name of menus) {
      const link = nav.getByRole("link", { name, exact: true });
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByText("Mode akun", { exact: true })).toHaveCount(0);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  });
}
test("CS: dialog pengajuan bisa ditutup dengan Escape dan fokus kembali", async ({
  page,
}) => {
  await masuk(page, "cs1@kerjain.test");
  await page.goto("/cs/verifikasi");
  const trigger = page
    .getByRole("button", { name: "Tolak pengajuan", exact: true })
    .first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("mobile: drawer, navigasi aktif, dan logout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await masuk(page, "tk1@kerjain.test");
  await page.goto("/tk");
  const trigger = page.getByRole("button", {
    name: "Menu ruang kerja",
    exact: true,
  });
  await trigger.click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Lamaran saya", exact: true })
    .click();
  await expect(page).toHaveURL(/\/tk\/lamaran$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await trigger.click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "Lamaran saya", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Keluar", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "sudah keluar" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/masuk$/);
});
test("tanpa sesi dan sesi peran lain tidak dapat membuka halaman CS", async ({
  page,
}) => {
  await page.goto("/cs/tiket");
  await expect(page).toHaveURL(/\/masuk\?next=/);
  await masuk(page, "tk2@kerjain.test");
  await page.goto("/cs/tiket");
  await expect(page).toHaveURL(/\/tk$/);
});
