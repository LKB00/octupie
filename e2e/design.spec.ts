import { expect, test } from "@playwright/test";

test.describe("/design", () => {
  test("renders tokens and components, switches theme and persists it", async ({ page }) => {
    await page.goto("/design");
    await expect(page.getByRole("heading", { level: 1, name: "Design system" })).toBeVisible();
    await expect(page.getByText("--brand-strong")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Break it down · uses 1 breakdown" }).first(),
    ).toBeVisible();

    await page
      .getByRole("group", { name: "Colour theme" })
      .getByRole("button", { name: "Dark" })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(darkBg).toBe("rgb(11, 11, 15)");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page
      .getByRole("group", { name: "Colour theme" })
      .getByRole("button", { name: "Light" })
      .click();
    const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(lightBg).toBe("rgb(243, 243, 247)");
  });

  test("primary button darkens on hover", async ({ page }) => {
    await page.goto("/design");
    await page
      .getByRole("group", { name: "Colour theme" })
      .getByRole("button", { name: "Light" })
      .click();
    const button = page.getByRole("button", { name: "Primary", exact: true }).first();
    const before = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
    await button.hover();
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(before);
  });

  test("dialog traps focus and closes on Escape", async ({ page }) => {
    await page.goto("/design");
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Write your version" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("toast shows and auto-dismisses", async ({ page }) => {
    await page.goto("/design");
    await page.getByRole("button", { name: "Success" }).click();
    const toast = page.getByText("Breakdown ready · 3 left this month");
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 8000 });
  });

  test("skeleton shimmer stops with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/design");
    const name = await page
      .locator("[data-slot=skeleton]")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("none");
    await context.close();
  });
});
