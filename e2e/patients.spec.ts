import { test, expect } from './fixtures';

const mockPatients = [
  {
    id: 1,
    name: 'Juan Pérez',
    dni: '45.678.901',
    phone: '+52 55 1234 5678',
    email: 'juan@email.com',
    address: 'Av. Corrientes 1234',
    healthInsurance: 'IMSS',
    memberNumber: 'IM-12345',
    status: 'active',
    notes: 'Paciente regular',
    createdAt: '2026-01-15',
  },
];

const updatedPatient = {
  ...mockPatients[0],
  name: 'Juan Pérez Actualizado',
};

test.describe('Patients CRUD', () => {
  test('complete flow: view, create, edit, delete', async ({ authenticatedPage: page }) => {
    await page.route(
      (url) => {
        try {
          return new URL(url).pathname.startsWith('/api/patients');
        } catch { return false; }
      },
      (route) => {
        const method = route.request().method();
        const url = route.request().url();
        const pathname = new URL(url).pathname;

        if (method === 'GET' && pathname === '/api/patients') {
          return route.fulfill({
            status: 200,
            body: JSON.stringify({ data: mockPatients, total: 1 }),
          });
        }

        if (method === 'POST') {
          const body = route.request().postDataJSON();
          return route.fulfill({
            status: 201,
            body: JSON.stringify({ data: { id: 2, ...body, createdAt: '2026-08-29' } }),
          });
        }

        if (pathname === '/api/patients/1' && method === 'PUT') {
          const body = route.request().postDataJSON();
          return route.fulfill({
            status: 200,
            body: JSON.stringify({ data: { ...updatedPatient, ...body } }),
          });
        }

        if (pathname === '/api/patients/1' && method === 'DELETE') {
          return route.fulfill({ status: 204 });
        }

        return route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [], total: 0 }),
        });
      },
    );

    await page.locator('nav a[href="/patients"]').click();

    await expect(page.getByRole('heading', { name: 'Patients', exact: true })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr').first()).toContainText('Juan Pérez');

    await page.getByRole('button', { name: /new patient/i }).click();
    const newPatientHeading = page.getByRole('heading', { name: 'New Patient', exact: true });
    await expect(newPatientHeading).toBeVisible();

    const createDialog = page.locator('[role="dialog"]');
    await createDialog.getByPlaceholder('Patient full name').fill('María García');
    await createDialog.getByPlaceholder('e.g. 45.678.901').fill('33.111.222');
    await createDialog.getByPlaceholder('+52 55 1234 5678').fill('+52 55 9988 7766');
    await createDialog.getByPlaceholder('patient@email.com').fill('maria@email.com');
    await createDialog.getByPlaceholder('e.g. IMSS, ISSSTE').fill('ISSSTE');
    await createDialog.getByPlaceholder('Insurance member number').fill('IS-67890');

    await createDialog.getByRole('button', { name: /create patient/i }).click();
    await expect(newPatientHeading).not.toBeVisible();

    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('button').nth(1).click();

    const editDialog = page.locator('[role="dialog"]');
    await expect(editDialog.getByRole('heading', { name: /edit patient/i })).toBeVisible();

    const nameInput = editDialog.getByPlaceholder('Patient full name');
    await nameInput.clear();
    await nameInput.fill('Juan Pérez Modificado');

    await editDialog.getByRole('button', { name: /save/i }).click();
    await expect(editDialog.getByRole('heading', { name: /edit patient/i })).not.toBeVisible();

    await firstRow.locator('button').nth(2).click();

    const deleteDialog = page.locator('[role="dialog"]');
    await expect(deleteDialog.getByRole('heading', { name: 'Delete Patient', exact: true })).toBeVisible();
    await expect(deleteDialog).toContainText('Are you sure');
    await deleteDialog.getByRole('button', { name: /delete/i }).click();
    await expect(deleteDialog.getByRole('heading', { name: /delete patient/i })).not.toBeVisible();
  });
});
