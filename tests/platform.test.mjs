import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/releases.ts', import.meta.url), 'utf8');
const detection = source.slice(source.indexOf('export function detectPlatform')).replace('export function', 'function');
const js = ts.transpile(detection);
const detect = (userAgent, maxTouchPoints = 0) => runInNewContext(`${js}\ndetectPlatform()`, { navigator: { userAgent, maxTouchPoints } });
const cases = [
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0, { os: 'windows', arch: 'x64' }],
  ['Mozilla/5.0 (X11; Linux x86_64)', 0, { os: 'linux', arch: 'x64' }],
  ['Mozilla/5.0 (X11; Linux aarch64)', 0, { os: 'linux', arch: 'arm64' }],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0, { os: 'macos', arch: null }],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5, null],
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 18)', 5, null],
  ['Mozilla/5.0 (Linux; Android 14)', 5, null],
  ['unknown', 0, null],
];
for (const [ua, touch, expected] of cases) assert.deepEqual(JSON.parse(JSON.stringify(detect(ua, touch))), expected);
console.log(`${cases.length} platform detection checks passed.`);
