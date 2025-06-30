import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
	test('should successfully register a new user when registration is enabled', async ({ page }) => {
		// Navigate to the registration page
		await page.goto('/register');

		// Wait for the form to be visible
		await page.waitForSelector('form');

		// Make sure registration is enabled (using mock API or environment variable)
		// This test assumes the backend is configured with ALLOW_REGISTRATION=true

		// Fill out the registration form
		await page.fill('#name', 'Test User');
		await page.fill('#email', `test-${Date.now()}@example.com`); // Unique email
		await page.fill('#password', 'password123');

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for registration to complete and redirect to home page
		await page.waitForURL('/');

		// Verify success - check for user info or logout button
		await expect(page.locator('text=Test User')).toBeVisible();
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

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for registration to complete
		await page.waitForURL('/');

		// Sign out
		await page.click('text=Log out');

		// Try to register with the same email
		await page.goto('/register');

		// Fill out the registration form with the same email
		await page.fill('#name', 'Another User');
		await page.fill('#email', email);
		await page.fill('#password', 'password456');

		// Submit the form
		await page.click('button[type="submit"]');

		// Verify error message for duplicate email
		await expect(page.locator('text=Email already in use')).toBeVisible();
	});

	test('should show message when registration is disabled', async ({ page, request }) => {
		// This test requires the ability to toggle the ALLOW_REGISTRATION setting
		// For a real test, you might use an admin API to toggle this setting
		// For this demo, we'll assume there's a way to disable registration

		// Navigate to the registration page
		await page.goto('/register');

		// Simulate registration being disabled
		// Mock API response or use a special test route that makes registration appear disabled
		await page.evaluate(() => {
			// This is a client-side workaround for testing
			// In a real scenario, this would be controlled by the backend
			window.__TEST_DISABLE_REGISTRATION = true;
		});

		// Refresh the page or trigger a state update
		await page.reload();

		// Verify the disabled message is shown
		await expect(page.locator('text=Registration is currently disabled')).toBeVisible();

		// Verify the form is disabled
		await expect(page.locator('button[type="submit"]')).toBeDisabled();
	});
});
