import { test, expect } from './fixtures';

const pages = [
  { href: '/dashboard', heading: 'Dashboard' },
  { href: '/patients', heading: 'Patients' },
  { href: '/followups', heading: 'Follow-ups' },
  { href: '/contacts', heading: 'Contacts' },
  { href: '/medications', heading: 'Medications' },
  { href: '/reports', heading: 'Reports' },
  { href: '/notifications', heading: 'Notifications' },
  { href: '/users', heading: 'Users' },
  { href: '/settings', heading: 'Settings' },
];

test.describe('Sidebar Navigation', () => {
  test('sidebar links are all visible', async ({ authenticatedPage: page }) => {
    for (const { href } of pages) {
      const link = page.locator(`nav a[href="${href}"]`);
      await expect(link).toBeVisible();
    }
  });

  test('each sidebar link navigates to the correct page', async ({ authenticatedPage: page }) => {
    for (const { href, heading } of pages) {
      await page.locator(`nav a[href="${href}"]`).click();
      await expect(page).toHaveURL(href);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }
  });
});
