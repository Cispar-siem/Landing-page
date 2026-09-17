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

export function detectPlatform(): { os: OperatingSystem; arch: Architecture } | null {
  const ua = navigator.userAgent.toLowerCase();
  const arch: Architecture = /arm|aarch64/.test(ua) ? 'arm64' : 'x64';
  if (/mac/.test(ua)) return { os: 'macos', arch };
  if (/win/.test(ua)) return { os: 'windows', arch: 'x64' };
  if (/linux/.test(ua)) return { os: 'linux', arch };
  return null;
}
