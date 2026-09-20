# Landing Page Spec

## Requirement: Hero section communicates value proposition
The landing page MUST display an asymmetric hero section (45/55) with a concrete, verifiable promise and a real screenshot or illustrative visualization.

### Scenario: Hero composition on desktop
- GIVEN the user visits the landing page at viewport width ≥1024px
- THEN the hero section shows:
  - Left column (45% width): headline, subheadline, primary CTA (Download), secondary CTA (Contact)
  - Right column (55% width): illustrative product frame with simulated security dashboard
  - Headline maximum three lines of text
  - Visual hierarchy follows typography scale: H1 clamp(40px, 4.8vw, 68px), weight 650, line-height 1.05

### Scenario: Hero composition on mobile
- GIVEN the user visits the landing page at viewport width <640px
- THEN the hero section stacks vertically:
  - Top: copy column (headline, subheadline, CTAs)
  - Bottom: product frame illustration
  - Headline adapts to fluid type but remains legible

## Requirement: Incident narrative builds trustThe landing page MUST include a section that tells a real-world incident story using the signal → evidence → action pattern with anonymized data and explicit autonomy limits.

### Scenario: Incident section structure
- GIVEN the incident narrative section is rendered
- THEN it contains exactly three subsections in order:
  1. Signal: what triggered the alert (e.g., "Unusual login from new country")
  2. Evidence: what data was gathered to validate (e.g., "Geolocation, device fingerprint, timestamp")
  3. Action: what steps are recommended before acting (e.g., "Review active sessions, enforce MFA, contact user")
- AND each subsection uses real-world, anonymized examples (no fake timestamps like "2024-01-01 00:00:00")
- AND the section explicitly states autonomy limits (e.g., "CISPAR nunca realiza acciones automáticas de bloqueo")

## Requirement: Three-step installation guidanceThe landing page MUST describe installation in three clear steps: download, access in browser, configure.

### Scenario: Installation steps clarity
- GIVEN the installation guidance section is present
- THEN it enumerates:
  1. Descargar el instalador para su sistema operativo
  2. Iniciar sesión cuando CISPAR solicite autorización de dispositivo
  3. Completar la configuración guiada en el navegador
- AND avoid promising "install and use" if hidden manual steps exist (e.g., Docker Engine setup must be disclosed)

## Requirement: Honest compatibility and requirementsThe landing page MUST list real compatibility, permissions, and requirements without inventing capabilities.

### Scenario: Requirements transparency
- GIVEN the compatibility section is rendered
- THEN it shows:
  - Supported operating systems: macOS, Windows, Linux (as per published releases)
  - Architecture note: On macOS, user must check Apple vs Intel via “About This Mac”
  - Real requirements: e.g., "Requiere Docker Engine y Docker Compose" for Linux, "Requiere Docker Desktop" for macOS/Windows
  - No promise of offline mode or signed licenses until product behavior is verified

## Requirement: Pricing placeholder avoids inventing numbersThe landing page MUST NOT display specific prices, currency, or device limits when T05 is blocked by commercial decisions.

### Scenario: Pricing section when undefined
- GIVEN commercial pricing decisions are pending (T05 blocked)
- THEN the pricing section:
  - Does NOT display any monetary figures, currency symbols, or per-device limits
  - Shows generic messaging: "El precio y los límites se definen según el entorno, fuentes y requisitos de despliegue. No publicamos cifras que todavía no correspondan al servicio entregado."
  - Provides clear CTA: "Hablar con ventas" or "Solicitar propuesta a medida"
  - Links to /contact for commercial conversation

## Requirement: FAQ addresses core evaluation questionsThe landing page MUST include a FAQ section with questions that help visitors evaluate CISPAR and prepare installation.

### Scenario: FAQ content
- GIVEN the FAQ section is rendered
- THEN it includes at least these questions (localized):
  - ¿Dónde se ejecuta CISPAR? → Infraestructura que tu equipo controla mediante Docker
  - ¿Qué sistemas operativos son compatibles? → macOS, Windows, Linux (arquitecturas publicadas)
  - ¿Necesito un equipo de seguridad para instalarlo? → El instalador guía la configuración; para despliegues complejos, el equipo puede ayudar a definir alcance
  - ¿Cómo puedo hablar con CISPAR? → WhatsApp o formulario de contacto para demo, cotización o asistencia
- AND answers avoid exaggerating ease of use for complex deployments

## Requirement: Accessible footer with legal linksThe landing page MUST include a footer with privacy, terms, support, and version number.

### Scenario: Footer content
- GIVEN the footer section is present
- THEN it contains:
  - Brand name: CISPAR
  - Tagline: e.g., "Operaciones de seguridad instaladas en tu entorno."
  - Navigation links: Descargas, Precios, Contacto
  - Support mailto: soporte@cispar.io
  - Version number: dynamically generated from build year (© {new Date().getFullYear()} CISPAR)
  - No fake client logos, compliance badges, or endless writing effects

## Requirement: Responsive design avoids horizontal scrollThe landing page MUST NOT introduce horizontal scroll at 320px width.

### Scenario: Horizontal overflow prevention
- GIVEN the page is viewed at 320px width
- THEN there is no horizontal scrollbar
- AND all interactive elements remain tappable (minimum 44x44px touch target)
- AND text scales appropriately without breaking layout

## Requirement: Reduced motion respects user preferenceThe landing page MUST honor prefers-reduced-motion for all animated transitions.

### Scenario: Motion reduction
- GIVEN the user has set prefers-reduced-motion: reduce
- THEN all non-essential animations (floating elements, infinite marquees, typewriter effects) are disabled or reduced to 150-220ms fade transitions
- AND essential feedback (button presses, form validation) remains perceivable