import { test, expect } from "@playwright/test";

test("lupa sandi dari halaman masuk dan tautan reset tanpa token", async ({
  page,
}) => {
  await page.goto("/masuk");
  await page.getByRole("link", { name: "Lupa kata sandi?" }).click();
  await page
    .getByLabel("Email", { exact: true })
    .fill(`e2e-${Date.now()}@kerjain.test`);
  await page.getByRole("button", { name: "Kirim tautan reset" }).click();
  await expect(page.getByRole("status")).toContainText("Jika email terdaftar");
  await page.goto("/reset-sandi");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "tidak lengkap atau tidak valid",
  );
  await expect(
    page.getByRole("link", { name: "Minta tautan baru" }),
  ).toBeVisible();
});
