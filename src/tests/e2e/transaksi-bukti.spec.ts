import { expect, test } from "@playwright/test";

test("gambar dikompres hingga 2 MB sebelum dikirim", async ({ page }) => {
  expect(
    (
      await page.request.post("/api/auth/login", {
        data: { email: "tk1@kerjain.test", password: "Password123!" },
      })
    ).ok(),
  ).toBe(true);
  await page.goto("/tk/pekerjaan");
  await page
    .getByRole("link", { name: /Rapikan taman belakang rumah/i })
    .click();
  await expect(page.getByLabel("Deskripsi pengerjaan")).toHaveAttribute(
    "maxlength",
    "1000",
  );
  await page
    .getByLabel("Deskripsi pengerjaan")
    .fill("Foto pekerjaan yang sudah selesai sesuai kesepakatan.");
  // Gambar nyata dengan banyak detail: ukuran awal melebihi 2 MB.
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1400;
    const ctx = canvas.getContext("2d")!;
    const image = ctx.createImageData(canvas.width, canvas.height);
    let seed = 12345;
    for (let i = 0; i < image.data.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        image.data[i + channel] = seed >>> 24;
      }
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const original = Buffer.from(base64, "base64");
  expect(original.length).toBeGreaterThan(2 * 1024 * 1024);
  await page
    .getByLabel(/Berkas bukti/i)
    .setInputFiles({
      name: "hasil.png",
      mimeType: "image/png",
      buffer: original,
    });
  // Amati berkas yang benar-benar dikirim tanpa mengubah transaksi fixture.
  await page.route("**/api/transaksi/*/bukti", (route) =>
    route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "STATUS_TIDAK_VALID",
          message: "Pemeriksaan kompresi selesai.",
        },
      }),
    }),
  );
  const sending = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      /\/api\/transaksi\/[^/]+\/bukti$/.test(new URL(request.url()).pathname),
  );
  await page.getByRole("button", { name: "Kirim bukti", exact: true }).click();
  const request = await sending;
  const form = await new Response(new Uint8Array(request.postDataBuffer()!), {
    headers: { "content-type": (await request.headerValue("content-type"))! },
  }).formData();
  const berkas = form.get("berkas") as File;
  expect(berkas.type).toBe("image/png");
  expect(berkas.size).toBeGreaterThan(0);
  expect(berkas.size).toBeLessThanOrEqual(2 * 1024 * 1024);
  await expect(page.locator("form [role='alert']")).toHaveText(
    "Pemeriksaan kompresi selesai.",
  );
});

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
  await expect(page.locator("form [role='alert']")).not.toBeVisible();
  await expect(page.getByText(/Menunggu pemeriksaan/i).first()).toBeVisible();
  const deskripsi =
    "Pekerjaan taman sudah selesai sesuai deskripsi dan jadwal.";
  await expect(page.getByText(deskripsi, { exact: true })).toBeVisible();
  const detailUrl = new URL(page.url());
  const id = detailUrl.pathname.split("/").pop()!;
  const buktiLink = page.getByRole("link", { name: /Buka berkas bukti 1/ });
  const href = await buktiLink.getAttribute("href");
  expect(href).toMatch(/^\/api\/berkas\/bukti\//);

  await page.request.post("/api/auth/logout");
  const loginPk = await page.request.post("/api/auth/login", {
    data: { email: "pk1@kerjain.test", password: "Password123!" },
  });
  expect(loginPk.ok()).toBe(true);
  await page.goto(`/pk/transaksi/${id}`);
  await expect(page.getByText(deskripsi, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Buka berkas bukti 1/ }),
  ).toHaveAttribute("href", href!);
  const download = await page.request.get(href!);
  expect(download.status()).toBe(200);
  expect(download.headers()["content-type"]).toBe("application/pdf");
  expect(download.headers()["cache-control"]).toBe("no-store");
  expect((await download.body()).toString()).toBe("%PDF-1.4\nbukti pekerjaan");
});
