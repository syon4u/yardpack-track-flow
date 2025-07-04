import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login form on auth page', async ({ page }) => {
    await page.goto('/auth');
    
    // Check that login form is visible
    await expect(page.getByText('Sign in to your account')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show signup form when clicking signup link', async ({ page }) => {
    await page.goto('/auth');
    
    // Click signup link
    await page.getByText('Sign up').click();
    
    // Check that signup form is visible
    await expect(page.getByText('Create your account')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill invalid email
    await page.getByPlaceholder('Enter your email').fill('invalid-email');
    await page.getByPlaceholder('Enter your password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show validation error
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('should require password', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill email but not password
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should show validation error
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});