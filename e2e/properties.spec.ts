import { test, expect } from '@playwright/test';

test.describe('Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
  });

  test('should display properties list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /properties/i })).toBeVisible();
    await expect(page.getByText('99 Bishopsgate')).toBeVisible();
  });

  test('should filter properties by marketing status', async ({ page }) => {
    const statusFilter = page.locator('select').filter({ hasText: /all status/i });
    await statusFilter.selectOption('On Market');

    await expect(page.getByText('99 Bishopsgate')).toBeVisible();
    await expect(page.getByText('Sample Property 2')).not.toBeVisible();
  });

  test('should search properties', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search properties/i);
    await searchInput.fill('Bishopsgate');

    await expect(page.getByText('99 Bishopsgate')).toBeVisible();
    await expect(page.getByText('Sample Property 2')).not.toBeVisible();
  });

  test('should navigate to property details on click', async ({ page }) => {
    await page.getByText('99 Bishopsgate').click();

    await expect(page).toHaveURL(/\/properties\/99-bishopsgate/);
    await expect(page.getByRole('heading', { name: /99 bishopsgate/i })).toBeVisible();
  });

  test('should display property details with tabs', async ({ page }) => {
    await page.goto('/properties/99-bishopsgate');

    await expect(page.getByRole('heading', { name: /99 bishopsgate/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /units/i })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/properties/99-bishopsgate');

    const unitsTab = page.getByRole('tab', { name: /units/i });
    await unitsTab.click();

    await expect(unitsTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/tab=units/);
    await expect(page.getByText(/units/i)).toBeVisible();
  });

  test('should persist tab state in URL', async ({ page }) => {
    await page.goto('/properties/99-bishopsgate?tab=units');

    const unitsTab = page.getByRole('tab', { name: /units/i });
    await expect(unitsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should navigate to add property page', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /add property/i });
    await addButton.click();

    await expect(page).toHaveURL('/properties/new');
    await expect(page.getByRole('heading', { name: /add property/i })).toBeVisible();
  });
});

test.describe('Add Property Flow', () => {
  test('should complete add property wizard', async ({ page }) => {
    await page.goto('/properties/new');

    // Step 1: Basics
    await expect(page.getByText('Step 1 of 8')).toBeVisible();
    await page.getByLabel(/property name/i).fill('New Test Property');
    await page.getByLabel(/address line/i).fill('789 Test Avenue');
    await page.getByLabel(/city/i).fill('Manchester');
    await page.getByLabel(/postcode/i).fill('M1 1AA');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Location
    await expect(page.getByText('Step 2 of 8')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Specs
    await expect(page.getByText('Step 3 of 8')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Amenities
    await expect(page.getByText('Step 4 of 8')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 5: Marketing
    await expect(page.getByText('Step 5 of 8')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 6: Compliance
    await expect(page.getByText('Step 6 of 8')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 7: Contacts
    await expect(page.getByText('Step 7 of 8')).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 8: Review
    await expect(page.getByText('Step 8 of 8')).toBeVisible();
    await expect(page.getByText('New Test Property')).toBeVisible();

    // Create property
    await page.getByRole('button', { name: /create property/i }).click();

    // Should navigate to new property details
    await expect(page).toHaveURL(/\/properties\/property-\d+/);
    await expect(page.getByRole('heading', { name: /new test property/i })).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.goto('/properties/new');

    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/address is required/i)).toBeVisible();
  });

  test('should allow going back to previous steps', async ({ page }) => {
    await page.goto('/properties/new');

    // Fill step 1 and go to step 2
    await page.getByLabel(/property name/i).fill('Test');
    await page.getByLabel(/address line/i).fill('123 Test');
    await page.getByLabel(/city/i).fill('London');
    await page.getByLabel(/postcode/i).fill('SW1A 1AA');
    await page.getByRole('button', { name: /next/i }).click();

    await expect(page.getByText('Step 2 of 8')).toBeVisible();

    // Go back
    await page.getByRole('button', { name: /previous/i }).click();

    await expect(page.getByText('Step 1 of 8')).toBeVisible();
    await expect(page.getByLabel(/property name/i)).toHaveValue('Test');
  });
});

