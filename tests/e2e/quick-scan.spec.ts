import { test, expect, type Page } from '@playwright/test';

const report = {
  domain: 'example.com', checkedAt: '2026-10-29T12:00:00Z',
  checks: [
    { id: 'spf', status: 'review', code: 'SPF_MULTIPLE_POLICIES', evidence: ['v=spf1 -all', 'v=spf1 ~all'] },
    { id: 'dmarc', status: 'review', code: 'DMARC_MONITORING_POLICY', evidence: ['v=DMARC1; p=none'] },
    { id: 'mx', status: 'observed', code: 'MX_RECORDS_PUBLISHED', evidence: ['mail.example.com'] },
    { id: 'caa', status: 'observed', code: 'CAA_NOT_PUBLISHED', evidence: [] },
    { id: 'dnssec', status: 'unknown', code: 'DNSSEC_NOT_VALIDATED', evidence: [] },
    { id: 'certificates', status: 'observed', code: 'CT_CERTIFICATES_FOUND', evidence: ['www.example.com · not_before=2025-01-01'] },
  ],
};
async function fill(page: Page) {
  await page.locator('.quick-scan-form [name=name]').fill('Persona de prueba');
  await page.locator('.quick-scan-form [name=email]').fill('persona@example.com');
  await page.locator('.quick-scan-form [name=phone]').fill('+52 55 1234 5678');
  await page.locator('#public-domain').fill('example.com');
  await page.locator('.quick-scan-consent input').check();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('.language-switch').selectOption('es');
});

test('requires identity and consent; queries only domain; report has evidence, download and contact handoff', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/quick-scan', async route => {
    calls++;
    expect(route.request().postDataJSON()).toEqual({ domain: 'example.com' });
    await route.fulfill({ json: report });
  });
  await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
  expect(calls).toBe(0);
  await fill(page);
  await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
  await expect(page.locator('.quick-scan-report-heading h3')).toHaveText('example.com');
  expect(calls).toBe(1);
  await expect(page.locator('.finding-error')).toHaveCount(1);
  await expect(page.locator('.finding-hardening')).toHaveCount(1);
  await expect(page.locator('.quick-scan-impact').first()).toContainText('errores de autenticación');
  await expect(page.locator('.quick-scan-result')).toHaveCount(6);
  await expect(page.locator('.quick-scan-observation').filter({ hasText: 'La política DMARC está en monitoreo: p=none.' })).toBeVisible();
  await page.getByRole('button', { name: 'Para revisar', exact: true }).click();
  await expect(page.locator('.quick-scan-result')).toHaveCount(2);
  await page.locator('.quick-scan-result details').first().locator('summary').click();
  await expect(page.getByText('v=spf1 -all', { exact: true })).toBeVisible();
  const file = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar resultados' }).click();
  expect((await file).suggestedFilename()).toBe('cispar-quick-scan-example.com.txt');
  await page.getByRole('button', { name: 'Revisar estos riesgos con CISPAR' }).click();
  await expect(page.locator('.contact-form [name=email]')).toHaveValue('persona@example.com');
  await expect(page.locator('.contact-form [name=phone]')).toHaveValue('+52 55 1234 5678');
  await expect(page.locator('.contact-form textarea')).toContainText('SPF');
  expect(page.url()).not.toContain('persona');
});

test('email in domain field is rejected without a request', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/quick-scan', route => { calls++; return route.fulfill({ json: report }); });
  await fill(page);
  await page.locator('#public-domain').fill('persona@gmail.com');
  await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('no una dirección de correo');
  expect(calls).toBe(0);
});

for (const kind of ['unavailable', 'malformed', 'wrong-domain'] as const) {
  test(`${kind} response never becomes a successful assessment`, async ({ page }) => {
    await page.route('**/api/quick-scan', route => kind === 'unavailable' ? route.fulfill({ status: 503, json: { error: {} } }) : route.fulfill({ json: kind === 'malformed' ? { ...report, checks: [] } : { ...report, domain: 'other.example' } }));
    await fill(page);
    await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.locator('.quick-scan-report')).toHaveCount(0);
    await expect(page.locator('.quick-scan-form [name=email]')).toHaveValue('persona@example.com');
  });
}

test('cancel clears pending work and ignores late responses', async ({ page }) => {
  await page.route('**/api/quick-scan', async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.fulfill({ json: report }).catch(() => undefined);
  });
  await fill(page);
  await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar consulta' }).click();
  await expect(page.locator('.quick-scan-form')).toBeVisible();
  await page.waitForTimeout(650);
  await expect(page.locator('.quick-scan-report')).toHaveCount(0);
});

for (const width of [320, 390, 768, 1440]) {
  test(`form and results fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/api/quick-scan', route => route.fulfill({ json: report }));
    await fill(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
    await expect(page.locator('.quick-scan-result')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/cispar-quick-scan-${width}.png` });
  });
}

test('unavailable sources never imply a clear or protected domain', async ({ page }) => {
  await page.route('**/api/quick-scan', route => route.fulfill({ json: { ...report, checks: report.checks.map(check => ({ ...check, status: 'unknown', code: 'UPSTREAM_UNAVAILABLE', evidence: [] })) } }));
  await fill(page);
  await page.locator('.quick-scan-form').getByRole('button', { name: 'Iniciar Quick Scan', exact: true }).click();
  await expect(page.getByText('No pudimos verificar ninguna de las comprobaciones.', { exact: false })).toBeVisible();
  await expect(page.locator('.quick-scan-result')).toHaveCount(6);
  const position = await page.locator('.quick-scan-report-heading h3').boundingBox();
  expect(position?.y).toBeGreaterThanOrEqual(90);
});

test('English form and report retain the same scope and real observations', async ({ page }) => {
  await page.locator('.language-switch').selectOption('en');
  await page.route('**/api/quick-scan', route => route.fulfill({ json: report }));
  await fill(page);
  await page.locator('.quick-scan-form').getByRole('button', { name: 'Start Quick Scan', exact: true }).click();
  await expect(page.locator('.quick-scan-result')).toHaveCount(6);
  await expect(page.locator('.quick-scan-observation').filter({ hasText: 'DMARC is in monitoring mode: p=none.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download results' })).toBeVisible();
});
