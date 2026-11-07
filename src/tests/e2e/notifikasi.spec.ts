import { test, expect } from "@playwright/test";
test("keputusan verifikasi membuat notifikasi yang bisa dibaca penerima", async ({
  page,
  browser,
  baseURL,
}) => {
  const cs = await browser.newContext({ baseURL });
  try {
    expect(
      (
        await cs.request.post("/api/auth/login", {
          data: { email: "cs1@kerjain.test", password: "Password123!" },
        })
      ).ok(),
    ).toBe(true);
    const antrean = await (await cs.request.get("/api/cs/verifikasi")).json();
    const target = antrean.items.find(
      (item: { email: string }) => item.email === "tk3@kerjain.test",
    );
    expect(target).toBeTruthy();
    expect(
      (
        await cs.request.post(
          `/api/cs/verifikasi/${target.idTenagaKerja}/setujui`,
        )
      ).ok(),
    ).toBe(true);
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { email: "tk3@kerjain.test", password: "Password123!" },
        })
      ).ok(),
    ).toBe(true);
    await page.goto("/tk");
    const bell = page.getByRole("button", {
      name: "Notifikasi, 1 belum dibaca",
      exact: true,
    });
    await expect(bell).toBeVisible();
    await bell.click();
    const dialog = page.getByRole("dialog", {
      name: "Daftar notifikasi",
      exact: true,
    });
    await dialog
      .getByRole("button", {
        name: /^Belum dibaca: Identitas Anda telah terverifikasi/,
      })
      .click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Notifikasi, 0 belum dibaca",
        exact: true,
      }),
    ).toBeVisible();
    const result = await (await page.request.get("/api/notifikasi")).json();
    expect(result.jumlahBelumDibaca).toBe(0);
    expect(result.items[0].dibaca).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: "Notifikasi, 0 belum dibaca",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    await cs.close();
  }
});
test("polling 30 detik, retry error, akses keyboard/mobile, dan cleanup setelah logout", async ({
  page,
}) => {
  let total = 1;
  let gagal = false;
  let requests = 0;
  const data = () => ({
    items: Array.from({ length: total }, (_, i) => ({
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      pesan: `Kabar pekerjaan ${i + 1}`,
      tautan: null,
      dibaca: false,
      waktuKirim: "2026-11-07T03:00:00Z",
    })),
    jumlahBelumDibaca: total,
  });
  await page.route("**/api/notifikasi", async (route) => {
    requests++;
    await route.fulfill({
      status: gagal ? 500 : 200,
      json: gagal ? { error: { message: "Gagal" } } : data(),
    });
  });
  expect(
    (
      await page.request.post("/api/auth/login", {
        data: { email: "tk1@kerjain.test", password: "Password123!" },
      })
    ).ok(),
  ).toBe(true);
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tk");
  await expect(
    page.getByRole("button", {
      name: "Notifikasi, 1 belum dibaca",
      exact: true,
    }),
  ).toBeVisible();
  const awal = requests;
  total = 2;
  await page.clock.fastForward(30_000);
  await expect(
    page.getByRole("button", {
      name: "Notifikasi, 2 belum dibaca",
      exact: true,
    }),
  ).toBeVisible();
  expect(requests).toBeGreaterThan(awal);
  const bell = page.getByRole("button", {
    name: "Notifikasi, 2 belum dibaca",
    exact: true,
  });
  const box = await bell.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
  await bell.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Daftar notifikasi",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  gagal = true;
  await page.clock.fastForward(30_000);
  await expect(dialog.getByRole("alert")).toContainText(
    "belum dapat diperbarui",
  );
  gagal = false;
  await dialog.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(dialog.getByRole("alert")).not.toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(bell).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Menu ruang kerja", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Ruang kerjamu", exact: true })
    .getByRole("button", { name: "Keluar", exact: true })
    .click();
  await expect(page).toHaveURL(/\/masuk$/);
  await expect(page.getByRole("button", { name: /^Notifikasi,/ })).toHaveCount(
    0,
  );
  const terakhir = requests;
  await page.clock.fastForward(60_000);
  expect(requests).toBe(terakhir);
});
test("notifikasi kosong, tautan berbahaya tidak dinavigasikan, dan POST gagal tidak menandai dibaca", async ({
  page,
}) => {
  expect(
    (
      await page.request.post("/api/auth/login", {
        data: { email: "pk1@kerjain.test", password: "Password123!" },
      })
    ).ok(),
  ).toBe(true);
  await page.goto("/pk");
  await page
    .getByRole("button", { name: "Notifikasi, 0 belum dibaca", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Daftar notifikasi",
    exact: true,
  });
  await expect(
    dialog.getByText("Belum ada notifikasi", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  let dibaca = false;
  let gagal = true;
  const id = "00000000-0000-4000-8000-000000000028";
  await page.route("**/api/notifikasi", (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id,
            pesan: "Kabar uji",
            tautan: "javascript:alert(1)",
            dibaca,
            waktuKirim: "2026-11-07T03:00:00Z",
          },
        ],
        jumlahBelumDibaca: dibaca ? 0 : 1,
      },
    }),
  );
  await page.route(`**/api/notifikasi/${id}/baca`, (route) => {
    if (!gagal) dibaca = true;
    return route.fulfill({ status: gagal ? 500 : 204, body: "" });
  });
  await page.getByRole("button", { name: /^Notifikasi,/ }).click();
  await dialog
    .getByRole("button", { name: "Belum dibaca: Kabar uji", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText(
    "belum ditandai dibaca",
  );
  expect(dibaca).toBe(false);
  await expect(
    page.getByRole("button", {
      name: "Notifikasi, 1 belum dibaca",
      exact: true,
    }),
  ).toBeVisible();
  gagal = false;
  await dialog
    .getByRole("button", { name: "Belum dibaca: Kabar uji", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", {
      name: "Sudah dibaca: Kabar uji",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/pk$/);
});
