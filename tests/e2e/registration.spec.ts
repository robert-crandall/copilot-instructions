import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should successfully register a new user when registration is enabled', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Wait for the form to be visible
    await page.waitForSelector('form');

    // Provide registration token if required by backend configuration

    // Fill out the registration form
    await page.fill('#name', 'Test User');
    await page.fill('#email', `test-${Date.now()}@example.com`); // Unique email
    await page.fill('#password', 'password123');

    // If token field exists, fill it
    if (await page.$('#registrationToken')) {
      await page.fill('#registrationToken', process.env.REGISTRATION_TOKEN || 'test-registration-token');
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for registration to complete and redirect to home page
    await page.waitForURL('/');

    // Verify success - check for success message on the home page
    await expect(page.locator("text=You're successfully logged in to your account.")).toBeVisible();
  });

  test('should display validation errors for invalid inputs', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Wait for the form to be visible
    await page.waitForSelector('form');

    // Submit an empty form
    await page.click('button[type="submit"]');

    // Verify validation errors are displayed
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Fill with invalid data
    await page.fill('#name', 'Test');
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', '12345'); // Too short

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify validation errors for invalid data
    await expect(page.locator('text=valid email')).toBeVisible();
    await expect(page.locator('text=least 6 characters')).toBeVisible();
  });

  test('should show error for duplicate email', async ({ page }) => {
    // First register a user
    const email = `duplicate-${Date.now()}@example.com`;

    // Navigate to the registration page
    await page.goto('/register');

    // Fill out the registration form
    await page.fill('#name', 'Test User');
    await page.fill('#email', email);
    await page.fill('#password', 'password123');

    if (await page.$('#registrationToken')) {
      await page.fill('#registrationToken', process.env.REGISTRATION_TOKEN || 'test-registration-token');
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await page.waitForURL('/');

    // Sign out by clearing localStorage then performing an explicit navigation to avoid race conditions
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });
    // Navigate to home explicitly and wait for network to settle so no pending navigations race with the next goto
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to register with the same email
    await page.goto('/register', { waitUntil: 'domcontentloaded' });

    // Fill out the registration form with the same email
    await page.fill('#name', 'Another User');
    await page.fill('#email', email);
    await page.fill('#password', 'password456');

    if (await page.$('#registrationToken')) {
      await page.fill('#registrationToken', process.env.REGISTRATION_TOKEN || 'test-registration-token');
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify error message for duplicate email
    await expect(page.locator('text=Email already in use')).toBeVisible();
  });

  test('should show message when registration is disabled', async ({ page, request }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Wait for the form to be visible
    await page.waitForSelector('form');

    // Simulate registration being disabled
    // Mock API response or use a special test route that makes registration appear disabled
    await page.evaluate(() => {
      // This is a client-side workaround for testing
      // In a real scenario, this would be controlled by the backend
      (window as any).__TEST_DISABLE_REGISTRATION = true;
    });

    // Trigger a re-check by calling the function directly
    await page.evaluate(async () => {
      // Force a page re-evaluation by dispatching a focus event
      window.dispatchEvent(new Event('focus'));
      // Give some time for the async function to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify the page reflects disabled registration (alert or disabled button)
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Verify the form is disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});
