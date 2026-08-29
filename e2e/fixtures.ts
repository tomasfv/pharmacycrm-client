import { test as base, type Page } from '@playwright/test';

const AUTH_TOKEN = 'fake-e2e-token';
const AUTH_USER = {
  id: 1,
  email: 'admin@pharmacare.com',
  name: 'Admin',
  role: 'admin',
};

function isApiRequest(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

function isAuthMeRequest(url: string): boolean {
  try {
    return new URL(url).pathname === '/api/auth/me';
  } catch {
    return false;
  }
}

async function setupAuth(page: Page) {
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }, { token: AUTH_TOKEN, user: AUTH_USER });

  await page.route(
    (url) => isAuthMeRequest(url),
    (route) => route.fulfill({
      status: 200,
      body: JSON.stringify({ data: AUTH_USER }),
    }),
  );

  await page.route(
    (url) => isApiRequest(url),
    (route) => route.fulfill({
      status: 200,
      body: JSON.stringify({ data: [], total: 0 }),
    }),
  );

  await page.goto('/dashboard');
  await page.waitForURL('**/dashboard');
}

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await setupAuth(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
