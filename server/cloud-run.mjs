import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleQuickScanRequest } from './quick-scan.mjs';

const DIST_DIR = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 30;

function send(response, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, {
    'content-type': contentType,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  });
  response.end(body);
}

function createQuickScanLimiter({ now = Date.now, limit = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS } = {}) {
  let windowStartedAt = now();
  let requests = 0;
  return () => {
    const timestamp = now();
    if (timestamp - windowStartedAt >= windowMs) {
      windowStartedAt = timestamp;
      requests = 0;
    }
    requests += 1;
    return requests <= limit;
  };
}

function toWebRequest(request) {
  const host = request.headers.host || 'localhost';
  const init = { method: request.method, headers: request.headers };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request;
    init.duplex = 'half';
  }
  return new Request(`http://${host}${request.url || '/'}`, init);
}

function createHandler({ distDir = DIST_DIR, quickScan = handleQuickScanRequest, limiter = createQuickScanLimiter() } = {}) {
  return async (request, response) => {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname;
    if (pathname === '/healthz') {
      send(response, 200, 'ok\n');
      return;
    }
    if (pathname === '/api/quick-scan') {
      if (request.method === 'POST' && !limiter()) {
        send(response, 429, JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Intenta de nuevo más tarde.' } }), 'application/json; charset=utf-8');
        return;
      }
      try {
        const result = await quickScan(toWebRequest(request));
        send(response, result.status, Buffer.from(await result.arrayBuffer()), result.headers.get('content-type') || 'application/json; charset=utf-8');
      } catch {
        send(response, 500, JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'No se pudo completar la consulta.' } }), 'application/json; charset=utf-8');
      }
      return;
    }

    let relativePath;
    try {
      relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
    } catch {
      send(response, 400, 'Bad request\n');
      return;
    }
    const requestedFile = resolve(distDir, relativePath || 'index.html');
    const safeFile = requestedFile === distDir || requestedFile.startsWith(`${distDir}${sep}`);
    if (!safeFile) {
      send(response, 404, 'Not found\n');
      return;
    }

    let filePath = requestedFile;
    try {
      if (!(await stat(filePath)).isFile()) filePath = resolve(distDir, 'index.html');
    } catch {
      filePath = resolve(distDir, 'index.html');
    }
    try {
      const body = await readFile(filePath);
      const contentType = MIME_TYPES.get(extname(filePath)) || 'application/octet-stream';
      response.writeHead(200, {
        'content-type': contentType,
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'cache-control': filePath === resolve(distDir, 'index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
      });
      response.end(body);
    } catch {
      send(response, 404, 'Not found\n');
    }
  };
}

export function createCloudRunServer(options) {
  const handler = createHandler(options);
  return createServer((request, response) => { void handler(request, response); });
}

export { createQuickScanLimiter };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080);
  createCloudRunServer().listen(port, '0.0.0.0', () => {
    console.log(`CISPAR Landing listening on port ${port}`);
  });
}
