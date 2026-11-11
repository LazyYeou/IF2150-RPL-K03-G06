import { expect, test } from "@playwright/test";

test("parameter URL tidak valid tidak membuat /lowongan error 500", async ({
  page,
}) => {
  for (const q of [
    "page=0",
    "page=abc",
    "upahMin=abc",
    "upahMin=-1",
    `q=${"a".repeat(101)}`,
  ]) {
    const response = await page.goto(`/lowongan?${q}`);
    expect(response?.status(), q).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Temukan pekerjaan" }),
    ).toBeVisible();
  }
});

test("halaman di luar rentang tidak menampilkan rentang yang mustahil", async ({
  page,
}) => {
  await page.goto("/lowongan?page=99");
  await expect(page.getByText("0 lowongan di halaman ini")).toBeVisible();
  await expect(page.getByText(/Menampilkan \d+–\d+/)).toHaveCount(0);
});

test("wizard pasang lowongan: Lanjutkan di langkah 3 membuka Tinjau, tidak langsung menerbitkan", async ({
  page,
}) => {
  const login = await page.request.post("/api/auth/login", {
    data: { email: "pk1@kerjain.test", password: "Password123!" },
  });
  expect(login.ok()).toBe(true);
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname === "/api/lowongan")
      posts.push(r.url());
  });

  await page.goto("/pk/lowongan/pasang");
  const lanjut = page.getByRole("button", { name: /Lanjutkan/ });
  await page
    .getByPlaceholder("Contoh: Bantu pindahan rumah di Dago")
    .fill("Bantu pindahan rumah");
  await page.getByRole("combobox").selectOption("Kebersihan");
  await page
    .getByPlaceholder(
      "Jelaskan pekerjaan dan kebutuhan yang perlu diketahui pelamar.",
    )
    .fill("Membantu pindahan rumah dengan mengangkat dan menata barang.");
  await page
    .getByPlaceholder(/Angkat 8 kardus/)
    .fill("Angkat dan tata barang.");
  await page
    .getByPlaceholder(/Jelaskan hasil yang menandakan/)
    .fill("Barang tertata rapi.");
  await lanjut.click();

  await page
    .getByPlaceholder("Contoh: Coblong, Bandung")
    .fill("Coblong, Bandung");
  const besok = new Date(Date.now() + 2 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  await page.locator('input[type="date"]').fill(besok);
  await page.getByPlaceholder("Contoh: 3–4 jam").fill("3 jam");
  await lanjut.click();

  await page.getByPlaceholder("150000").fill("150000");
  await lanjut.click();

  await expect(
    page.getByRole("button", { name: "Terbitkan lowongan" }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  expect(posts).toHaveLength(0);
});
