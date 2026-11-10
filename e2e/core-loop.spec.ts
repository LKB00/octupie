import { expect, test } from "@playwright/test";

const CREATOR = "/c/c_demo";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ request }) => {
  await request.post("/api/mock/reset");
});

test("feed has at least 15 outliers, and 7 days shows the sparse banner", async ({ page }) => {
  await page.goto(`${CREATOR}/discover`);
  await expect(page.getByTestId("reel-card").first()).toBeVisible();
  expect(await page.getByTestId("reel-card").count()).toBeGreaterThanOrEqual(15);

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByRole("button", { name: "7 days" }).click();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/window=7/);
  await expect(page.getByTestId("sparse-banner")).toContainText(
    "Only 3 outliers in the last 7 days",
  );

  await page.reload();
  await expect(page.getByTestId("sparse-banner")).toBeVisible();
});

test("core loop: reel → breakdown → write → edit → find it in Scripts", async ({ page }) => {
  await page.goto(`${CREATOR}/reels/cuEMrZrsBBq`);
  // Breakdowns left: the meter's value is what's left, not what's used.
  const breakdownsLeft = page.getByTestId("quota-meter").getByRole("meter", { name: "Breakdowns" });
  await expect(breakdownsLeft).toHaveAttribute("aria-valuenow", "3");

  await page.getByRole("button", { name: "Break it down · uses 1 breakdown" }).click();
  await expect(page.getByText("Watching the video")).toBeVisible();
  await expect(page.getByTestId("breakdown")).toBeVisible({ timeout: 10_000 });
  await expect(breakdownsLeft).toHaveAttribute("aria-valuenow", "2");

  const writer = page.getByTestId("writer-panel");
  await writer.getByText("Your counter-take").click();
  await writer.getByRole("button", { name: "Write script · uses 1 script" }).click();

  await expect(page).toHaveURL(/studio\?script=/, { timeout: 10_000 });
  const title = page.locator("#script-title");
  await expect(title).toHaveValue("Why that advice breaks for fintech products");

  const lines = page.getByRole("list", { name: "Script lines" }).locator("textarea");
  const before = await lines.count();
  await page.getByRole("button", { name: "Make it shorter" }).click();
  await expect(lines).toHaveCount(before - 1);
  await page
    .getByRole("region", { name: "Studio assistant" })
    .getByRole("button", { name: "Undo" })
    .click();
  await expect(lines).toHaveCount(before);

  await page.getByRole("link", { name: "Scripts" }).first().click();
  await expect(
    page.getByRole("link", { name: "Why that advice breaks for fintech products" }),
  ).toBeVisible();
});

test("the 6th breakdown on Free shows the upgrade card", async ({ page }) => {
  // Fixtures start at 2 of 5; run three more, then the next one hits the limit.
  for (const code of ["8ET-BrF2SFp", "jRveGY6GwMC", "FQqMLGVSm3B"]) {
    await page.goto(`${CREATOR}/reels/${code}`);
    await page.getByRole("button", { name: /Break it down · uses 1 breakdown/ }).click();
    await expect(page.getByTestId("breakdown")).toBeVisible({ timeout: 10_000 });
  }
  await expect(page.getByTestId("quota-meter")).toContainText("None left");

  await page.goto(`${CREATOR}/discover?window=90&sort=newest`);
  const unanalysed = page.getByTestId("reel-card").nth(5).getByRole("link");
  await unanalysed.click();
  // At the limit the inline upgrade card replaces the paid button.
  await expect(page.getByTestId("upgrade-card")).toBeVisible();
  await expect(page.getByRole("button", { name: /Break it down/ })).toHaveCount(0);
});

test("home is the landing page and ⌘K finds a script", async ({ page }) => {
  await page.goto(CREATOR);
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "broke out in your niche this week",
  );
  await page.keyboard.press("ControlOrMeta+k");
  const search = page.getByRole("combobox", { name: "Search" });
  await search.fill("fintech onboarding");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/studio\?script=s_demo/);
});
