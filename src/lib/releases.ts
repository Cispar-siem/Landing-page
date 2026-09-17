export type OperatingSystem = 'macos' | 'windows' | 'linux';
export type Architecture = 'arm64' | 'x64';
export type Release = { id: string; os: OperatingSystem; arch: Architecture; label: string; requirements: string; version?: string; url?: string; sha256?: string; available: boolean; };

export const releaseCatalog: readonly Release[] = [
  { id: 'mac-arm64', os: 'macos', arch: 'arm64', label: 'macOS · Apple Silicon', requirements: 'macOS 10.15 o posterior · Docker Desktop', available: false },
  { id: 'mac-x64', os: 'macos', arch: 'x64', label: 'macOS · Intel', requirements: 'macOS 10.15 o posterior · Docker Desktop', available: false },
  { id: 'windows-x64', os: 'windows', arch: 'x64', label: 'Windows · x64', requirements: 'Windows 10/11 · Docker Desktop', available: false },
  { id: 'linux-x64', os: 'linux', arch: 'x64', label: 'Linux · x64', requirements: 'Docker Engine y Docker Compose', available: false },
  { id: 'linux-arm64', os: 'linux', arch: 'arm64', label: 'Linux · ARM64', requirements: 'Docker Engine y Docker Compose', available: false },
];

type ReleaseManifest = { releases?: Release[] };

/** Loads published releases. Until CI publishes a manifest, the UI safely shows unavailable installers. */
export async function loadReleaseCatalog(): Promise<readonly Release[]> {
  const manifestUrl = (import.meta.env.VITE_RELEASE_MANIFEST_URL as string | undefined) ?? '/Landing-page/releases.json';
  try {
    const response = await fetch(manifestUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) return releaseCatalog;
    const manifest = await response.json() as ReleaseManifest;
    return Array.isArray(manifest.releases) ? manifest.releases : releaseCatalog;
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
