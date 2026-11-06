import assert from 'node:assert/strict';
import test from 'node:test';
import { handleQuickScanRequest } from '../server/quick-scan.mjs';

function request(body, { method = 'POST', headers = { 'content-type': 'application/json' } } = {}) {
  return new Request('https://cispar.example/api/quick-scan', {
    method,
    headers,
    ...(method === 'GET' || method === 'HEAD' ? {} : { body: JSON.stringify(body) }),
  });
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

test('quick scan returns six bounded checks from fixed public sources', async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    const url = new URL(input);
    calls.push({ url, init });
    if (url.origin === 'https://cloudflare-dns.com') {
      const name = url.searchParams.get('name');
      const type = url.searchParams.get('type');
      if (type === 'TXT' && name === 'example.com') return jsonResponse({ Status: 0, Answer: [{ type: 16, data: '"v=spf1 -all"' }] });
      if (type === 'TXT' && name === '_dmarc.example.com') return jsonResponse({ Status: 0, Answer: [{ type: 16, data: '"v=DMARC1; p=none; rua=mailto:reports@example.com"' }] });
      if (type === 'MX') return jsonResponse({ Status: 0, Answer: [{ type: 15, data: '10 mail.example.com.' }] });
      if (type === 'CAA') return jsonResponse({ Status: 0, Answer: [{ type: 257, data: '0 issue "letsencrypt.org"' }] });
      if (type === 'DNSKEY') return jsonResponse({ Status: 0, AD: true, Answer: [{ type: 48, data: 'key-material' }] });
    }
    if (url.origin === 'https://crt.sh') return jsonResponse([{ name_value: 'example.com\nwww.example.com', not_before: '2026-01-03T00:00:00Z' }]);
    throw new Error(`Unexpected destination ${url.origin}`);
  };

  const response = await handleQuickScanRequest(request({ domain: 'Example.COM' }), { fetchImpl });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.domain, 'example.com');
  assert.equal(Number.isNaN(Date.parse(result.checkedAt)), false);
  assert.deepEqual(result.checks.map(({ id }) => id), ['spf', 'dmarc', 'mx', 'caa', 'dnssec', 'certificates']);
  assert.deepEqual(result.checks.map(({ status }) => status), ['observed', 'review', 'observed', 'observed', 'observed', 'observed']);
  assert.equal(result.checks[1].code, 'DMARC_MONITORING_POLICY');
  assert.equal(result.checks[3].code, 'CAA_RECORDS_PUBLISHED');
  assert.equal(result.checks[5].evidence[0], 'example.com, www.example.com · not_before=2026-01-03');
  assert.equal(calls.length, 6);
  for (const { url, init } of calls) {
    assert.ok(['https://cloudflare-dns.com', 'https://crt.sh'].includes(url.origin));
    assert.equal(init.redirect, 'error');
  }
});

test('invalid domains are rejected before any upstream request', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; throw new Error('must not be called'); };
  for (const domain of ['owner@gmail.com', 'https://example.com/path', '127.0.0.1', 'localhost', 'example..com', '[::1]']) {
    const response = await handleQuickScanRequest(request({ domain }), { fetchImpl });
    assert.equal(response.status, 400, domain);
    assert.equal((await response.json()).error.code, 'INVALID_DOMAIN');
  }
  assert.equal(calls, 0);
});

test('upstream failures return unknown checks rather than inferred findings', async () => {
  const response = await handleQuickScanRequest(request({ domain: 'example.com' }), {
    fetchImpl: async () => { throw new Error('network unavailable'); },
  });
  assert.equal(response.status, 200);
  const { checks } = await response.json();
  assert.equal(checks.length, 6);
  assert.ok(checks.every(({ status, code }) => status === 'unknown' && code === 'UPSTREAM_UNAVAILABLE'));
});

test('NXDOMAIN is unknown and a Null MX is reported as an explicit no-mail policy', async () => {
  const response = await handleQuickScanRequest(request({ domain: 'example.com' }), {
    fetchImpl: async (input) => {
      const url = new URL(input);
      if (url.origin === 'https://crt.sh') return jsonResponse([]);
      if (url.searchParams.get('type') === 'MX') {
        return jsonResponse({ Status: 0, Answer: [{ type: 15, data: '0 .' }] });
      }
      return jsonResponse({ Status: 3 });
    },
  });
  const { checks } = await response.json();
  assert.equal(checks.find(({ id }) => id === 'mx').code, 'MX_NULL_PUBLISHED');
  assert.equal(checks.find(({ id }) => id === 'mx').status, 'observed');
  for (const id of ['spf', 'dmarc', 'caa', 'dnssec']) {
    const check = checks.find((entry) => entry.id === id);
    assert.equal(check.status, 'unknown');
    assert.equal(check.code, 'DNS_NAME_NOT_FOUND');
  }
  assert.equal(checks.find(({ id }) => id === 'certificates').status, 'observed');
});

test('CAA and empty CT are informational; invalid DMARC and unvalidated DNSSEC are explicit', async () => {
  const response = await handleQuickScanRequest(request({ domain: 'example.com' }), {
    fetchImpl: async (input) => {
      const url = new URL(input);
      if (url.origin === 'https://crt.sh') return jsonResponse([]);
      const type = url.searchParams.get('type');
      const name = url.searchParams.get('name');
      if (type === 'TXT' && name.startsWith('_dmarc.')) return jsonResponse({ Status: 0, Answer: [{ type: 16, data: '"v=DMARC1; p=monitor"' }] });
      if (type === 'DNSKEY') return jsonResponse({ Status: 0, AD: false, Answer: [{ type: 48, data: 'key-material' }] });
      return jsonResponse({ Status: 0 });
    },
  });
  const { checks } = await response.json();
  const byId = Object.fromEntries(checks.map((entry) => [entry.id, entry]));
  assert.equal(byId.caa.status, 'observed');
  assert.equal(byId.caa.code, 'CAA_NOT_PUBLISHED');
  assert.equal(byId.certificates.status, 'observed');
  assert.equal(byId.certificates.code, 'CT_NO_CERTIFICATES_FOUND');
  assert.equal(byId.dmarc.status, 'review');
  assert.equal(byId.dmarc.code, 'DMARC_POLICY_INVALID');
  assert.equal(byId.dnssec.status, 'unknown');
  assert.equal(byId.dnssec.code, 'DNSSEC_NOT_VALIDATED');

  const unsignedResponse = await handleQuickScanRequest(request({ domain: 'example.com' }), {
    fetchImpl: async (input) => {
      const url = new URL(input);
      if (url.origin === 'https://crt.sh') return jsonResponse([]);
      if (url.searchParams.get('type') === 'DNSKEY') return jsonResponse({ Status: 0, Answer: [] });
      return jsonResponse({ Status: 0 });
    },
  });
  const unsigned = (await unsignedResponse.json()).checks.find(({ id }) => id === 'dnssec');
  assert.equal(unsigned.status, 'observed');
  assert.equal(unsigned.code, 'DNSSEC_NOT_OBSERVED');
});

test('truncated DNS responses remain unknown', async () => {
  const response = await handleQuickScanRequest(request({ domain: 'example.com' }), {
    fetchImpl: async (input) => {
      const url = new URL(input);
      if (url.origin === 'https://crt.sh') return jsonResponse([]);
      return jsonResponse({ Status: 0, TC: true, Answer: [] });
    },
  });
  const { checks } = await response.json();
  for (const id of ['spf', 'dmarc', 'mx', 'caa', 'dnssec']) {
    const check = checks.find((entry) => entry.id === id);
    assert.equal(check.status, 'unknown');
    assert.equal(check.code, 'DNS_RESPONSE_TRUNCATED');
  }
});

test('HTTP method, content type, and request size are enforced', async () => {
  assert.equal((await handleQuickScanRequest(request(null, { method: 'GET' }))).status, 405);
  assert.equal((await handleQuickScanRequest(request({ domain: 'example.com' }, { headers: {} }))).status, 400);
  const tooLarge = new Request('https://cispar.example/api/quick-scan', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'content-length': '5000' },
    body: '{"domain":"example.com"}',
  });
  const response = await handleQuickScanRequest(tooLarge);
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, 'BODY_TOO_LARGE');
});

test('certificate evidence deduplicates names and accurately labels source validity date', async () => {
  const response = await handleQuickScanRequest(request({ domain: 'example.com' }), {
    fetchImpl: async input => {
      const url = new URL(input);
      if (url.origin === 'https://crt.sh') return jsonResponse([
        { name_value: 'www.example.com', not_before: '2026-01-03T00:00:00Z' },
        { name_value: 'www.example.com', not_before: '2026-01-03T00:00:00Z' },
      ]);
      return jsonResponse({ Status: 0 });
    },
  });
  const certs = (await response.json()).checks.find(check => check.id === 'certificates');
  assert.deepEqual(certs.evidence, ['www.example.com · not_before=2026-01-03']);
});
