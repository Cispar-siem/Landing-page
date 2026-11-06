import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/releases.ts', import.meta.url), 'utf8');
const validatorCode = source.slice(
  source.indexOf('const ALLOWED_DOWNLOAD_HOSTS'),
  source.indexOf('export async function loadReleaseCatalog')
).replace('export function', 'function');

const js = ts.transpile(validatorCode);
const validate = (raw, allowLocalMoto = false) => runInNewContext(`${js}\nvalidateRelease(raw, allowLocalMoto)`, { raw, allowLocalMoto, URL });

// 1. Non-object
assert.equal(validate(null), null);
assert.equal(validate("string"), null);

// 2. Missing required base fields
assert.equal(validate({ id: 'win' }), null);

// 3. Insecure HTTP URL must NOT produce available download
const httpRelease = validate({
  id: 'win-x64',
  os: 'windows',
  arch: 'x64',
  label: 'Windows',
  requirements: 'Windows 11',
  available: true,
  version: '1.0.0',
  url: 'http://github.com/Cispar-siem/release.exe',
  sha256: 'a'.repeat(64),
});
assert.equal(httpRelease.available, false);
assert.equal(httpRelease.url, undefined);

// 4. Disallowed Host must NOT produce available download
const maliciousHost = validate({
  id: 'win-x64',
  os: 'windows',
  arch: 'x64',
  label: 'Windows',
  requirements: 'Windows 11',
  available: true,
  version: '1.0.0',
  url: 'https://evil-site.com/installer.exe',
  sha256: 'a'.repeat(64),
});
assert.equal(maliciousHost.available, false);
assert.equal(maliciousHost.url, undefined);

// 5. Invalid SHA256 (wrong length or chars)
const badSha = validate({
  id: 'win-x64',
  os: 'windows',
  arch: 'x64',
  label: 'Windows',
  requirements: 'Windows 11',
  available: true,
  version: '1.0.0',
  url: 'https://github.com/Cispar-siem/release.exe',
  sha256: 'not-a-valid-sha',
});
assert.equal(badSha.available, false);

// 6. Valid release on allowed host with valid sha256
const validRelease = validate({
  id: 'win-x64',
  os: 'windows',
  arch: 'x64',
  label: 'Windows',
  requirements: 'Windows 11',
  available: true,
  version: '1.0.0',
  url: 'https://github.com/Cispar-siem/release.exe',
  sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
});
assert.equal(validRelease.available, true);
assert.equal(validRelease.url, 'https://github.com/Cispar-siem/release.exe');
assert.equal(validRelease.sha256, '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');

// Local Moto URLs are denied by default and accepted only with the explicit dev flag.
const localMotoRelease = {
  id: 'ubuntu-local-moto',
  os: 'linux',
  arch: 'x64',
  label: 'Ubuntu test fixture',
  requirements: 'Test only',
  available: true,
  version: '0.0.0-local-moto',
  url: 'http://localhost:5000/cispar-local-releases/fixture.txt?signature=mock',
  sha256: 'a'.repeat(64),
};
assert.equal(validate(localMotoRelease).available, false);
assert.equal(validate(localMotoRelease, true).available, true);
assert.equal(validate({ ...localMotoRelease, url: 'http://localhost:8000/fixture.txt' }, true).available, false);

console.log('9 release validator checks passed.');
