import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createCloudRunServer } from '../server/cloud-run.mjs';

async function withServer(options, run) {
  const server = createCloudRunServer(options);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('Cloud Run server returns health and serves the SPA fallback safely', async () => {
  const distDir = await mkdtemp(join(tmpdir(), 'cispar-cloud-run-'));
  await writeFile(join(distDir, 'index.html'), '<main>Landing demo</main>');
  await mkdir(join(distDir, 'assets'));
  await writeFile(join(distDir, 'assets', 'app.js'), 'console.log("ok")');
  await withServer({ distDir }, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/healthz`);
    assert.equal(health.status, 200);
    assert.equal(await health.text(), 'ok\n');

    const page = await fetch(`${baseUrl}/contact`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(await page.text(), '<main>Landing demo</main>');

    const asset = await fetch(`${baseUrl}/assets/app.js`);
    assert.equal(asset.headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.equal(await asset.text(), 'console.log("ok")');

    const traversal = await fetch(`${baseUrl}/%2e%2e/secret`);
    assert.equal(traversal.status, 200);
    assert.equal(await traversal.text(), '<main>Landing demo</main>');
  });
  await rm(distDir, { recursive: true, force: true });
});

test('Cloud Run server serves Quick Scan on the same origin and limits requests', async () => {
  let calls = 0;
  const distDir = await mkdtemp(join(tmpdir(), 'cispar-cloud-run-api-'));
  await writeFile(join(distDir, 'index.html'), '<main>Landing demo</main>');
  await withServer({
    distDir,
    limiter: (() => { let remaining = 1; return () => remaining-- > 0; })(),
    quickScan: async (request) => {
      calls += 1;
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED' } }), {
          status: 405,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        });
      }
      assert.equal(new URL(request.url).pathname, '/api/quick-scan');
      assert.deepEqual(await request.json(), { domain: 'example.com' });
      return new Response(JSON.stringify({ domain: 'example.com', checks: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    },
  }, async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/quick-scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com' }),
    });
    assert.equal(first.status, 200);
    assert.equal((await first.json()).domain, 'example.com');

    const second = await fetch(`${baseUrl}/api/quick-scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com' }),
    });
    assert.equal(second.status, 429);
    assert.equal((await second.json()).error.code, 'RATE_LIMITED');
    assert.equal(calls, 1);

    const method = await fetch(`${baseUrl}/api/quick-scan`);
    assert.equal(method.status, 405);
  });
  await rm(distDir, { recursive: true, force: true });
});
