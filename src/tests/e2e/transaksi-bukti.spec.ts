import { expect, test } from "@playwright/test";

test("TK dapat mengirim bukti penyelesaian dari halaman pekerjaan", async ({
  page,
}) => {
  const login = await page.request.post("/api/auth/login", {
    data: { email: "tk1@kerjain.test", password: "Password123!" },
  });
  expect(login.ok()).toBe(true);

  await page.goto("/tk/pekerjaan");
  await page
    .getByRole("link", { name: /Rapikan taman belakang rumah/i })
    .click();

  await expect(
    page.getByRole("heading", { name: "Kirim bukti penyelesaian" }),
  ).toBeVisible();
  await page
    .getByLabel("Deskripsi pengerjaan")
    .fill("Pekerjaan taman sudah selesai sesuai deskripsi dan jadwal.");
  await page.getByLabel(/Berkas bukti/i).setInputFiles({
    name: "bukti.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\nbukti pekerjaan"),
  });
  await page.getByRole("button", { name: "Kirim bukti" }).click();

  await expect(page).toHaveURL(/\/tk\/pekerjaan\/[^/]+$/);
  await expect(page.getByRole("alert")).not.toBeVisible();
  await expect(page.getByText(/Menunggu pemeriksaan/i).first()).toBeVisible();
});
