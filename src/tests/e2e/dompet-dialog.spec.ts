import { expect, test } from "@playwright/test";

for (const width of [360, 768, 1280]) {
  test(`dialog pencairan ${width}px: fokus, keyboard, Escape, dan target sentuh`, async ({
    page,
  }) => {
    const submissions: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().endsWith("/api/pencairan"))
        submissions.push(req.url());
    });
    await page.setViewportSize({ width, height: 900 });
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { email: "tk1@kerjain.test", password: "Password123!" },
        })
      ).ok(),
    ).toBe(true);
    await page.goto("/tk/dompet");
    const trigger = page.getByRole("button", {
      name: "Tarik Dana",
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog", {
      name: "Tarik Dana ke Rekening / E-Wallet",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#nomorRekening")).toBeFocused();
    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 16; i++) {
        await page.keyboard.press(key);
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        ).toBe(true);
      }
    }
    for (const button of await dialog.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page
      .getByRole("button", { name: "Tutup dialog", exact: true })
      .click();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("button", { name: "Batal", exact: true }).click();
    await expect(trigger).toBeFocused();
    expect(submissions).toHaveLength(0);
  });
}
