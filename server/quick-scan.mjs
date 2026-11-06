const MAX_REQUEST_BYTES = 4_096;
const MAX_UPSTREAM_BYTES = 512 * 1_024;
const DNS_TIMEOUT_MS = 8_000;
const CT_TIMEOUT_MS = 10_000;
const DNS_ORIGIN = 'https://cloudflare-dns.com/dns-query';
const CT_ORIGIN = 'https://crt.sh/';

const CHECK_IDS = ['spf', 'dmarc', 'mx', 'caa', 'dnssec', 'certificates'];

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

function errorResponse(status, code, message) {
  return jsonResponse({ error: { code, message } }, status);
}

function isPublicDomain(value) {
  if (typeof value !== 'string' || value.length < 3 || value.length > 253) return false;
  if (value !== value.trim() || /[^a-zA-Z0-9.-]/.test(value)) return false;
  const domain = value.toLowerCase();
  if (domain.endsWith('.') || domain.startsWith('.') || domain.includes('..')) return false;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(domain) || domain === 'localhost') return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  if (labels.some((label) => label.length < 1 || label.length > 63 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return false;
  const tld = labels.at(-1);
  return Boolean(tld && (tld.length >= 2 || /^xn--[a-z0-9-]+$/.test(tld)));
}

async function readLimited(response, limit = MAX_UPSTREAM_BYTES) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > limit) throw new Error('UPSTREAM_TOO_LARGE');
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new Error('UPSTREAM_TOO_LARGE');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function withTimeout(ms, callback) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return Promise.resolve()
    .then(() => callback(controller.signal))
    .finally(() => clearTimeout(timer));
}

async function fetchJson(fetchImpl, url, { timeoutMs, accept }) {
  return withTimeout(timeoutMs, async (signal) => {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { accept },
      redirect: 'error',
      signal,
    });
    if (!response.ok) throw new Error(`UPSTREAM_HTTP_${response.status}`);
    const bytes = await readLimited(response);
    return JSON.parse(new TextDecoder().decode(bytes));
  });
}

function record(id, status, code, evidence) {
  return {
    id,
    status,
    evidence: evidence.slice(0, 5).map((item) => String(item)
      .replace(/mailto:[^\s;,]+/gi, 'mailto:[correo oculto]')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[correo oculto]')
      .slice(0, 240)),
    code,
  };
}

function unknown(id, code = 'UPSTREAM_UNAVAILABLE') {
  return record(id, 'unknown', code, ['No se pudo consultar una fuente pública.']);
}

function dnsUnknown(id, code) {
  const messages = {
    DNS_NAME_NOT_FOUND: 'La consulta DNS indicó que el nombre no existe; no se infiere una vulnerabilidad.',
    DNS_RESPONSE_TRUNCATED: 'La respuesta DNS llegó truncada y no se pudo evaluar completa.',
    DNSSEC_NOT_VALIDATED: 'Se observaron DNSKEY, pero el resolutor no indicó validación AD.',
  };
  return record(id, 'unknown', code, [messages[code] ?? 'La respuesta DNS no permitió evaluar este punto.']);
}

function txtRecords(payload) {
  if (!Array.isArray(payload?.Answer)) return [];
  return payload.Answer
    .filter((answer) => Number(answer.type) === 16 && typeof answer.data === 'string')
    .map((answer) => answer.data.replace(/"\s+"/g, '').replace(/^"|"$/g, '').replace(/\\"/g, '"'));
}

function dnsQueryUrl(name, type) {
  const url = new URL(DNS_ORIGIN);
  url.searchParams.set('name', name);
  url.searchParams.set('type', type);
  return url;
}

function dnsFailure(payload) {
  if (payload?.TC === true) return 'DNS_RESPONSE_TRUNCATED';
  const status = Number(payload?.Status);
  if (status === 0) return null;
  return status === 3 ? 'DNS_NAME_NOT_FOUND' : 'DNS_RESPONSE_ERROR';
}

async function dnsJson(fetchImpl, name, type) {
  return fetchJson(fetchImpl, dnsQueryUrl(name, type), {
    timeoutMs: DNS_TIMEOUT_MS,
    accept: 'application/dns-json',
  });
}

async function checkSpf(fetchImpl, domain) {
  try {
    const records = await dnsJson(fetchImpl, domain, 'TXT');
    const failure = dnsFailure(records);
    if (failure) return dnsUnknown('spf', failure);
    const policies = txtRecords(records).filter((entry) => /^v=spf1(?:\s|$)/i.test(entry));
    if (policies.length === 1) return record('spf', 'observed', 'SPF_SINGLE_POLICY', [policies[0]]);
    if (policies.length > 1) return record('spf', 'review', 'SPF_MULTIPLE_POLICIES', policies);
    return record('spf', 'review', 'SPF_NOT_FOUND', ['No se observó un registro SPF en la respuesta DNS.']);
  } catch {
    return unknown('spf');
  }
}

async function checkDmarc(fetchImpl, domain) {
  try {
    const payload = await dnsJson(fetchImpl, `_dmarc.${domain}`, 'TXT');
    const failure = dnsFailure(payload);
    if (failure) return dnsUnknown('dmarc', failure);
    const policies = txtRecords(payload).filter((entry) => /^v=DMARC1(?:\s|;|$)/i.test(entry));
    if (policies.length === 0) return record('dmarc', 'review', 'DMARC_NOT_FOUND', ['No se observó un registro DMARC en la respuesta DNS.']);
    if (policies.length > 1) return record('dmarc', 'review', 'DMARC_MULTIPLE_POLICIES', policies);
    const policy = policies[0].match(/(?:^|;)\s*p\s*=\s*([a-z]+)/i)?.[1]?.toLowerCase();
    if (!policy) return record('dmarc', 'review', 'DMARC_POLICY_UNSPECIFIED', [policies[0]]);
    if (!['none', 'quarantine', 'reject'].includes(policy)) {
      return record('dmarc', 'review', 'DMARC_POLICY_INVALID', [policies[0]]);
    }
    const status = policy === 'none' ? 'review' : 'observed';
    const code = policy === 'none' ? 'DMARC_MONITORING_POLICY' : 'DMARC_POLICY_PUBLISHED';
    return record('dmarc', status, code, [policies[0]]);
  } catch {
    return unknown('dmarc');
  }
}

async function checkMx(fetchImpl, domain) {
  try {
    const payload = await dnsJson(fetchImpl, domain, 'MX');
    const failure = dnsFailure(payload);
    if (failure) return dnsUnknown('mx', failure);
    const answers = (payload?.Answer ?? []).filter((answer) => Number(answer.type) === 15 && typeof answer.data === 'string');
    if (answers.some((answer) => /^0\s+\.$/.test(answer.data.trim()))) {
      return record('mx', 'observed', 'MX_NULL_PUBLISHED', ['El dominio publica el registro Null MX (0 .) y declara que no recibe correo.']);
    }
    const hosts = answers
      .map((answer) => answer.data.replace(/^\d+\s+/, '').replace(/\.$/, '').slice(0, 200));
    if (hosts.length) return record('mx', 'observed', 'MX_RECORDS_PUBLISHED', hosts);
    return record('mx', 'review', 'MX_NOT_PUBLISHED', ['No se observó un registro MX; algunos dominios no reciben correo.']);
  } catch {
    return unknown('mx');
  }
}

async function checkCaa(fetchImpl, domain) {
  try {
    const payload = await dnsJson(fetchImpl, domain, 'CAA');
    const failure = dnsFailure(payload);
    if (failure) return dnsUnknown('caa', failure);
    const entries = (payload?.Answer ?? [])
      .filter((answer) => Number(answer.type) === 257 && typeof answer.data === 'string')
      .map((answer) => answer.data.slice(0, 200));
    if (entries.length) return record('caa', 'observed', 'CAA_RECORDS_PUBLISHED', entries);
    return record('caa', 'observed', 'CAA_NOT_PUBLISHED', ['No se observó una política CAA; esto es informativo y no indica por sí solo un problema.']);
  } catch {
    return unknown('caa');
  }
}

async function checkDnssec(fetchImpl, domain) {
  try {
    const payload = await dnsJson(fetchImpl, domain, 'DNSKEY');
    const failure = dnsFailure(payload);
    if (failure) return dnsUnknown('dnssec', failure);
    const keys = (payload?.Answer ?? []).filter((answer) => Number(answer.type) === 48);
    if (keys.length && payload.AD === true) {
      return record('dnssec', 'observed', 'DNSSEC_VALIDATED', ['La respuesta DNS incluye DNSKEY y el indicador AD del resolutor.']);
    }
    if (!keys.length) return record('dnssec', 'observed', 'DNSSEC_NOT_OBSERVED', ['No se observaron registros DNSKEY; la ausencia no confirma un compromiso.']);
    return dnsUnknown('dnssec', 'DNSSEC_NOT_VALIDATED');
  } catch {
    return unknown('dnssec');
  }
}

async function checkCertificates(fetchImpl, domain) {
  try {
    const url = new URL(CT_ORIGIN);
    url.searchParams.set('q', `%.${domain}`);
    url.searchParams.set('output', 'json');
    const payload = await fetchJson(fetchImpl, url, {
      timeoutMs: CT_TIMEOUT_MS,
      accept: 'application/json',
    });
    if (!Array.isArray(payload)) throw new Error('INVALID_CT_RESPONSE');
    const evidence = [...new Set(payload.map((entry) => {
      const names = typeof entry?.name_value === 'string' ? entry.name_value.split('\n').slice(0, 3).join(', ') : 'nombre no disponible';
      const date = typeof entry?.not_before === 'string' ? entry.not_before.slice(0, 10) : 'fecha no disponible';
      return `${names} · not_before=${date}`;
    }))].slice(0, 5);
    if (evidence.length) return record('certificates', 'observed', 'CT_CERTIFICATES_FOUND', evidence);
    return record('certificates', 'observed', 'CT_NO_CERTIFICATES_FOUND', ['No se encontraron entradas en la consulta pública de Certificate Transparency; esto no valida ni invalida TLS en vivo.']);
  } catch {
    return unknown('certificates');
  }
}

async function readRequestBody(request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) return { error: 'BODY_TOO_LARGE' };
  if (!request.body) return { error: 'INVALID_REQUEST' };
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { error: 'BODY_TOO_LARGE' };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(bytes) };
}

export async function handleQuickScanRequest(request, { fetchImpl = globalThis.fetch } = {}) {
  if (request.method !== 'POST') return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Usa POST para consultar un dominio.');
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return errorResponse(400, 'INVALID_REQUEST', 'Envía el dominio en formato JSON.');
  }
  const body = await readRequestBody(request);
  if (body.error === 'BODY_TOO_LARGE') return errorResponse(413, 'BODY_TOO_LARGE', 'La solicitud excede el límite permitido.');
  if (body.error) return errorResponse(400, 'INVALID_REQUEST', 'La solicitud debe incluir un dominio.');
  let input;
  try {
    input = JSON.parse(body.text);
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', 'La solicitud JSON no es válida.');
  }
  if (!input || typeof input !== 'object' || Array.isArray(input) || !isPublicDomain(input.domain)) {
    return errorResponse(400, 'INVALID_DOMAIN', 'Escribe un dominio público válido, sin URL, correo ni dirección IP.');
  }
  const domain = input.domain.toLowerCase();
  const checks = await Promise.all([
    checkSpf(fetchImpl, domain),
    checkDmarc(fetchImpl, domain),
    checkMx(fetchImpl, domain),
    checkCaa(fetchImpl, domain),
    checkDnssec(fetchImpl, domain),
    checkCertificates(fetchImpl, domain),
  ]);
  if (checks.some((check) => !CHECK_IDS.includes(check.id))) throw new Error('Unexpected quick scan check');
  return jsonResponse({ domain, checkedAt: new Date().toISOString(), checks }, 200);
}

export const quickScanLimits = Object.freeze({ MAX_REQUEST_BYTES, MAX_UPSTREAM_BYTES, DNS_TIMEOUT_MS, CT_TIMEOUT_MS });
