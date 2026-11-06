import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('landing loads a Moto release manifest and downloads the local S3 fixture', async ({ page }) => {
  await page.goto('/#/download');
  await page.getByRole('button', { name: 'Ubuntu Server LTS' }).click();
  const release = page.locator('.release-card').filter({ hasText: 'fixture Moto; no instalar' });

  await expect(release).toBeVisible();
  await expect(release).toContainText('0.0.0-local-moto');
  await expect(release).toContainText('SHA-256');

  const downloadPromise = page.waitForEvent('download');
  await release.locator('a.btn-primary').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('cispar-agent-local-moto-fixture.txt');

  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const payload = Buffer.concat(chunks);
  expect(payload.toString('utf8')).toContain('TEST FILE ONLY');
  await expect(release.locator('.checksum')).toHaveText(createHash('sha256').update(payload).digest('hex'));
});
