export type OperatingSystem = 'macos' | 'windows' | 'linux';
export type Architecture = 'arm64' | 'x64';
export type Release = {
  id: string;
  os: OperatingSystem;
  arch: Architecture;
  label: string;
  requirements: string;
  version?: string;
  url?: string;
  sha256?: string;
  sizeBytes?: number;
  publishedAt?: string;
  channel?: 'stable' | 'beta';
  available: boolean;
};

export const releaseCatalog: readonly Release[] = [
  { id: 'mac-arm64', os: 'macos', arch: 'arm64', label: 'macOS · Apple Silicon', requirements: 'macOS 12 o posterior · conexión a internet', available: false },
  { id: 'mac-x64', os: 'macos', arch: 'x64', label: 'macOS · Intel', requirements: 'macOS 12 o posterior · conexión a internet', available: false },
  { id: 'windows-x64', os: 'windows', arch: 'x64', label: 'Windows · x64', requirements: 'Windows 10 o posterior · conexión a internet', available: false },
  { id: 'linux-x64', os: 'linux', arch: 'x64', label: 'Linux · x64', requirements: 'Distribución Linux compatible · conexión a internet', available: false },
  { id: 'linux-arm64', os: 'linux', arch: 'arm64', label: 'Linux · ARM64', requirements: 'Distribución Linux compatible · conexión a internet', available: false },
];

const ALLOWED_DOWNLOAD_HOSTS = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'releases.cispar.io',
  'dl.cispar.io',
  'cispar-siem.github.io',
]);

const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;

/**
 * Validates a single release entry at runtime.
 * Guarantees that if available is true, it strictly has HTTPS URL on an allowed host and valid 64-char sha256.
 */
export function validateRelease(raw: unknown): Release | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.id !== 'string' || !r.id) return null;
  if (r.os !== 'macos' && r.os !== 'windows' && r.os !== 'linux') return null;
  if (r.arch !== 'arm64' && r.arch !== 'x64') return null;
  if (typeof r.label !== 'string' || typeof r.requirements !== 'string') return null;

  let available = r.available === true;
  let url: string | undefined = undefined;
  const version: string | undefined = typeof r.version === 'string' && r.version.trim() ? r.version.trim() : undefined;
  const sha256: string | undefined = typeof r.sha256 === 'string' && SHA256_REGEX.test(r.sha256.trim()) ? r.sha256.trim().toLowerCase() : undefined;
  const sizeBytes = typeof r.sizeBytes === 'number' && r.sizeBytes > 0 ? r.sizeBytes : undefined;
  const publishedAt = typeof r.publishedAt === 'string' ? r.publishedAt : undefined;
  const channel = r.channel === 'stable' || r.channel === 'beta' ? r.channel : undefined;

  if (available) {
    if (typeof r.url !== 'string' || !r.url) {
      available = false;
    } else {
      try {
        const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://cispar.io';
        const parsedUrl = new URL(r.url, baseOrigin);
        if (parsedUrl.protocol !== 'https:' || !ALLOWED_DOWNLOAD_HOSTS.has(parsedUrl.hostname)) {
          available = false;
        } else {
          url = parsedUrl.toString();
        }
      } catch {
        available = false;
      }
    }

    if (!version || !sha256 || !url) {
      available = false;
      url = undefined;
    }
  }

  return {
    id: r.id,
    os: r.os,
    arch: r.arch,
    label: r.label,
    requirements: r.requirements,
    version,
    url,
    sha256,
    sizeBytes,
    publishedAt,
    channel,
    available,
  };
}

/** Loads published releases. Validates structure, allowed hosts, and checksums at runtime. */
export async function loadReleaseCatalog(): Promise<readonly Release[]> {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : '/').replace(/\/$/, '');
  const defaultManifestUrl = `${base}/releases.json`;
  const manifestUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_RELEASE_MANIFEST_URL as string | undefined) ?? defaultManifestUrl) as string;

  try {
    const response = await fetch(manifestUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) return releaseCatalog;
    const manifest = (await response.json()) as { releases?: unknown[] };
    if (!Array.isArray(manifest.releases)) return releaseCatalog;

    const validated = manifest.releases
      .map(validateRelease)
      .filter((r): r is Release => r !== null);

    return validated.length > 0 ? validated : releaseCatalog;
  } catch {
    return releaseCatalog;
  }
}

export function detectPlatform(): { os: OperatingSystem; arch: Architecture | null } | null {
  const ua = navigator.userAgent.toLowerCase();
  // Phones/tablets must not be offered a desktop installer. Apple Silicon
  // browsers often report Intel: OS detection is not architecture detection.
  if (/android|iphone|ipad|ipod/.test(ua) || (/mac/.test(ua) && navigator.maxTouchPoints > 1)) return null;
  const arch: Architecture | null = /arm|aarch64/.test(ua) ? 'arm64' : /x86_64|amd64|win64|x64/.test(ua) ? 'x64' : null;
  if (/mac/.test(ua)) return { os: 'macos', arch: null };
  if (/win/.test(ua)) return { os: 'windows', arch };
  if (/linux/.test(ua)) return { os: 'linux', arch };
  return null;
}
