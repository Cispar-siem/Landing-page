import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleQuickScanRequest, quickScanLimits } from './server/quick-scan.mjs';

async function collectNodeBody(request: import('node:http').IncomingMessage): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of request) {
    const bytes = typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk);
    total += bytes.byteLength;
    if (total > quickScanLimits.MAX_REQUEST_BYTES) throw new Error('BODY_TOO_LARGE');
    chunks.push(bytes);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function quickScanMiddleware() {
  return async (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse, next: (error?: unknown) => void) => {
    let pathname: string;
    try {
      pathname = new URL(request.url ?? '/', 'http://vite.local').pathname;
    } catch {
      next();
      return;
    }
    if (pathname !== '/api/quick-scan') {
      next();
      return;
    }

    try {
      const method = request.method ?? 'GET';
      const headers = new Headers();
      for (const [name, value] of Object.entries(request.headers)) {
        if (typeof value === 'string') headers.set(name, value);
        else if (Array.isArray(value)) headers.set(name, value.join(', '));
      }
      const body = method === 'GET' || method === 'HEAD' ? undefined : await collectNodeBody(request);
      const webRequest = new Request(`http://vite.local${request.url ?? '/api/quick-scan'}`, {
        method,
        headers,
        ...(body ? { body } : {}),
      });
      const result = await handleQuickScanRequest(webRequest);
      response.statusCode = result.status;
      result.headers.forEach((value, name) => response.setHeader(name, value));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch (error) {
      const status = error instanceof Error && error.message === 'BODY_TOO_LARGE' ? 413 : 500;
      const message = status === 413 ? 'La solicitud excede el límite permitido.' : 'No se pudo completar la consulta.';
      response.statusCode = status;
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.setHeader('cache-control', 'no-store');
      response.end(JSON.stringify({ error: { code: status === 413 ? 'BODY_TOO_LARGE' : 'INTERNAL_ERROR', message } }));
    }
  };
}

function quickScanPlugin() {
  return {
    name: 'cispar-public-quick-scan',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use(quickScanMiddleware());
    },
    configurePreviewServer(server: import('vite').PreviewServer) {
      server.middlewares.use(quickScanMiddleware());
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), quickScanPlugin()],
  // Vercel serves the application from the domain root. Keep this explicit so
  // asset URLs do not retain the old GitHub Pages repository prefix.
  base: '/',
});
