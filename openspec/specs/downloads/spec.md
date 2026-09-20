# Downloads and Releases Spec

## Requirement: Release manifest validation at runtimeThe frontend MUST validate the structure and integrity of the releases manifest before enabling any download button.

### Scenario: Manifest structure validation
- GIVEN the releases.json manifest is fetched from VITE_RELEASE_MANIFEST_URL or BASE_URL/releases.json
- THEN each entry is validated against the Release type definition:
  - id: non-empty string
  - os: one of 'macos', 'windows', 'linux'
  - arch: one of 'arm64', 'x64'
  - label: non-empty string
  - requirements: non-empty string
  - version: optional string (if present, must be non-empty trimmed)
  - url: optional string (if present and available=true, must be valid HTTPS on allowed host)
  - sha256: optional string (if present and available=true, must be 64 hex lowercase characters)
  - sizeBytes: optional positive number
  - publishedAt: optional string (ISO timestamp)
  - channel: optional 'stable' or 'beta'
  - available: boolean
- AND invalid entries are discarded (treated as if not present)

### Scenario: Host allowlist enforcement
- GIVEN a release entry has available=true
- THEN the url MUST:
  - Use HTTPS protocol
  - Have hostname in ALLOWED_DOWNLOAD_HOSTS (github.com, objects.githubusercontent.com, releases.cispar.io, dl.cispar.io, cispar-siem.github.io)
- AND if either condition fails, available is set to false and url is cleared

### Scenario: SHA-256 format validation
- GIVEN a release entry has available=true
- THEN sha256 MUST match regex /^[a-fA-F0-9]{64}$/
- AND if validation fails, available is set to false and sha256/url are cleared

### Scenario: Version presence requirement for available releases
- GIVEN a release entry has available=true
- THEN version MUST be defined and non-empty after trim
- AND if missing, available is set to false

## Requirement: Honest availability statesThe frontend MUST NOT enable download buttons for releases that are not genuinely available and verifiable.

### Scenario: Disabled state for unavailable releases
- GIVEN a release entry has available=false OR missing required HTTPS URL/sha256/version
- THEN the UI:
  - Shows the release card as unavailable
  - Renders disabled button with localized text like "Instalador en preparación"
  - Does NOT render a functional href or onClick that initiates download
  - Optionally shows localized placeholder like "Próxima release" or "SHA-256 pendiente de publicación"

### Scenario: Loading and error states
- GIVEN the manifest fetch is in progress
- THEN the UI shows a loading indicator (spinner or skeleton) and disables interaction
- GIVEN the manifest fetch fails (network error, non-200, invalid JSON)
- THEN the UI shows an error state with localized message and falls back to the embedded releaseCatalog (hardcoded array in releases.ts)
- AND in error state, no release is marked as available (since embedded catalog has all available:false)

## Requirement: BASE_URL and manifest URL configurabilityThe frontend MUST compute the manifest URL correctly regardless of deployment subpath.

### Scenario: Manifest URL resolution
- GIVEN the app is deployed at a subpath (e.g., /Landing-page/) via HashRouter
- AND BASE_URL is set correctly in Vite config (e.g., /Landing-page/)
- THEN the default manifest URL is ${BASE_URL}/releases.json
- GIVEN VITE_RELEASE_MANIFEST_URL is defined as an absolute URL (e.g., https://dl.cispar.io/releases.json)
- THEN that URL takes precedence over the default
- AND changing the deployment domain does NOT break the manifest fetch as long as VITE_RELEASE_MANIFEST_URL or BASE_URL are updated accordingly

## Requirement: No false architecture deduction from user-agentThe frontend MUST NOT assume Apple Silicon architecture from a user-agent that reports Intel on macOS.

### Scenario: Platform detection honesty
- GIVEN the user is on macOS with Apple Silicon but user-agent reports Intel (common in browsers)
- THEN detectPlatform() returns { os: 'macos', arch: null }
- AND the UI does NOT auto-select an architecture-specific release
- AND the platform selector defaults to 'all' or forces manual selection
- GIVEN the user is on macOS with Intel processor
- THEN detectPlatform() also returns { os: 'macos', arch: null }
- AND the UI treats both cases identically: requires manual architecture selection

### Scenario: Platform selector persistence
- GIVEN the user selects a platform (e.g., 'windows') from the dropdown
- THEN that selection is persisted in component state (not in URL or localStorage unless explicitly implemented)
- AND the grid filters to show only releases matching that OS
- AND the "Recommended for this device" badge appears only when both OS and arch match the detected platform (when arch is known)

## Requirement: Transparent installer metadataThe frontend MUST display version and SHA-256 checkbox when available to aid user verification.

### Scenario: Metadata display for available releases
- GIVEN a release entry has available=true AND version AND sha256 are defined
- THEN the release card shows:
  - Version number (e.g., "1.0.0")
  - Label "SHA-256" (or localized equivalent)
  - The actual SHA-256 hash in a monospaced code block
- AND the checksum is visually scannable (e.g., grouped in 4-char chunks if desired, but not required)
- AND the UI does NOT claim verification is performed in the browser; verification belongs to the native updater/client

## Requirement: Honest requirements disclosureThe frontend MUST display real installation requirements without hiding manual steps.

### Scenario: Requirements transparency
- GIVEN a release entry has a requirements string (e.g., "macOS 10.15 o posterior · Docker Desktop")
- THEN that string is rendered verbatim in the UI
- AND the UI does NOT append or precondition phrases like "install and use" if the requirements hide manual steps (e.g., Docker Desktop installation, daemon start, login)
- AND if Docker is required, the UI makes it explicit that the user must install and run Docker separately

## Requirement: Three-step post-download guidanceThe frontend MUST describe post-download steps clearly: execute installer, sign in when prompted, complete guided setup.

### Scenario: Installer guidance clarity
- GIVEN the "Después de descargar" section is present
- THEN it shows:
  - Title: "El instalador prepara Docker y abre la configuración local."
  - Ordered list:
    1. Ejecute el instalador correspondiente a su sistema.
    2. Inicie sesión cuando CISPAR solicite autorización.
    3. Complete la configuración guiada en el navegador.
- AND does not promise that the installer alone starts the service; requires user interaction for auth and config