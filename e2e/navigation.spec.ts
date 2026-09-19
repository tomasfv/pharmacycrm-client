import { test, expect, type Page } from './fixtures';

const directPages = [
  { href: '/dashboard', heading: 'Dashboard' },
  { href: '/contacts', heading: 'Contacts' },
  { href: '/reports', heading: 'Reports' },
  { href: '/notifications', heading: 'Notifications' },
  { href: '/users', heading: 'Users' },
  { href: '/settings', heading: 'Settings' },
];

const patientsPages = [
  { href: '/patients', heading: 'Patients' },
  { href: '/followups', heading: 'Follow-ups' },
  { href: '/medications', heading: 'Medications' },
];

async function expandPatientsSection(page: Page) {
  await page.locator('nav button').filter({ hasText: /Patients|Pacientes/i }).click();
  await page.waitForTimeout(200);
}

test.describe('Sidebar Navigation', () => {
  test('sidebar links are all visible', async ({ authenticatedPage: page }) => {
    for (const { href } of directPages) {
      const link = page.locator(`nav a[href="${href}"]`);
      await expect(link).toBeVisible();
    }

    await expandPatientsSection(page);

    for (const { href } of patientsPages) {
      const link = page.locator(`nav a[href="${href}"]`);
      await expect(link).toBeVisible();
    }
  });

  test('each sidebar link navigates to the correct page', async ({ authenticatedPage: page }) => {
    for (const { href, heading } of directPages) {
      await page.locator(`nav a[href="${href}"]`).click();
      await expect(page).toHaveURL(href);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }

    await expandPatientsSection(page);

    for (const { href, heading } of patientsPages) {
      await page.locator(`nav a[href="${href}"]`).click();
      await expect(page).toHaveURL(href);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }
  });
});
