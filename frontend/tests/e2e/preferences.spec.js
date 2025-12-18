const { test, expect } = require("@playwright/test");

test("loads preferences page and shows categories", async ({ page }) => {
    await page.goto("http://127.0.0.1:5173/index.html");
    await expect(page.getByText("User Preferences")).toBeVisible();
    await expect(page.getByText("Account Settings")).toBeVisible();
    await expect(page.getByText("Notification Settings")).toBeVisible();
    await expect(page.getByText("Theme Settings")).toBeVisible();
    await expect(page.getByText("Privacy Settings")).toBeVisible();
});

test("validation blocks invalid email on save", async ({ page }) => {
    await page.goto("http://127.0.0.1:5173/index.html");

    // Ensure Account selected
    await page.getByText("Account Settings").click();

    // Fill invalid email
    const email = page.getByLabel("Email");
    await email.fill("not-an-email");

    // Save All should enable (unsaved changes)
    await expect(page.getByText("Unsaved changes")).toBeVisible();

    await page.getByRole("button", { name: "Save All" }).click();

    // Error banner should show
    await expect(page.getByText("Please fix the highlighted fields before saving.")).toBeVisible();
});

test("can save valid changes", async ({ page }) => {
    await page.goto("http://127.0.0.1:5173/index.html");

    await page.getByText("Account Settings").click();

    await page.getByLabel("Username").fill("john.smith");
    await page.getByLabel("Email").fill("john.smith@example.com");

    await page.getByRole("button", { name: "Save All" }).click();

    // Success toast from Webix should appear (message area)
    // We look for the success text (may appear briefly)
    await expect(page.getByText("Preferences saved successfully.")).toBeVisible();
});
