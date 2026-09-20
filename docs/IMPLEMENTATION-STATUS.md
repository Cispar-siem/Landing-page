# CISPAR — Estado de Implementación de Tareas

**Modo operativo:** startup en producción. Los estados `verificado` de este documento indican comprobación local del repositorio y no sustituyen validación de staging, producción, billing, releases firmadas, monitoreo o rollback.

Documento de seguimiento vivo según la especificación de `PLAN-CISPAR-PLATAFORMA.md`.

---

## Resumen General de Tareas

### Deployment repository preparation — 2026-09-20

- Vercel deployment contract added in `vercel.json`; build output is `dist`
  and Vite now uses domain-root asset URLs.
- GitHub Actions now validates lint, tests, and the production build without
  publishing to GitHub Pages. Vercel Git integration remains the deployer.
- Local verification completed: `npm run lint`, `npm test`, and
  `npm run build` exited successfully. A real Vercel deployment remains
  pending account connection and production environment variables.

| ID | Tarea | Estado | Siguiente acción / Bloqueo |
|---|---|---|---|
| **T00** | Inventario de landing, backend y desktop; auth, instalación, billing existente | **verificado** | Completado. Decisión registrada en `docs/AUTH-DECISION.md`. |
| **T01** | Reproducibilidad: package scripts, lint, workflow y README | **verificado** | Scripts alineados, lint limpio (0 errores/0 advertencias), tests integrados y CI corregido. |
| **T02** | Tokens/CSS y componentes repetidos | **verificado** | Tokens visuales consolidados (3. Especificación visual), sin regresiones en todas las rutas. Capturas generadas en 320/360/768/1440px. |
| **T03** | Hero, narrativa, pricing/FAQ y accesibilidad | **verificado** | Composición de landing page ajustada al plan: Hero asimétrico 45/55, narrativa de incidente (señal→evidencia→acción), instalación en tres pasos, compatibilidad y requisitos reales, precios placeholder (T05 bloqueado), FAQ y accesibilidad verificados. |
| **T04** | Validación de releases, BASE_URL y estados de descarga | **verificado** | Validación de manifest estricta, manejo de loading/error, estados de disponibilidad correctos, BASE_URL configurável, no deducción falsa de arquitectura, metadata transparente, requisitos honestos, guía de tres pasos post-descarga. |
| **T05** | Catálogo comercial y selección de proveedor | **bloqueado** | Requiere decisiones comerciales del propietario (precios, moneda, proveedor). |
| **T06** | Migraciones mínimas, autorización y aislamiento | **pendiente** | Depende de T00 backend y T05 modelo. |
| **T07** | Completar web login/registro/recuperación y callbacks | **pendiente** | Depende de T00 auth y T01. |
| **T08** | Desktop → navegador → sesión según única decisión | **pendiente** | Depende de T00 desktop, T06 y T07. |
| **T09** | Checkout/portal y reserva idempotente | **pendiente** | Depende de T05, T06 y T07. |
| **T10** | Webhook durable, reconciliación y entitlement | **pendiente** | Depende de T09. |
| **T11** | Build/firmas/manifest e instalación real | **pendiente** | Depende de T00 desktop y T04. |
| **T12** | Deployment reproducible y runbook | **pendiente** | Depende de T01 y T06–T11. |
| **T13** | Validación de recorrido self-service | **pendiente** | Depende de T03 y T12. |

---

## Detalle de Tareas

### T00 — Inventario de landing, backend y desktop; auth, instalación, billing existente
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se confirmó la existencia de repositorios reales en `/home/axel/`:
    - Frontend / Landing: `/home/axel/Landing-page` (React 18 + Vite + Tailwind + Supabase JS).
    - Backend / License Server: `/home/axel/cispar-ia-backend/cispar-license-server` (Hono + TypeScript + Supabase + JWT).
    - Cliente CLI / Terminal: `/home/axel/cispar-ia-backend/src/cli` y `/home/axel/cispar-terminal`.
    - SIEM Monorepo / Installer: `/home/axel/cispar-siem-mono` (con `cispar-installer` en Go y wizard).
  - Se fijó como decisión única de autenticación el **Device Authorization Flow (RFC 8628-like)**, ya implementado entre CLI (`requestDeviceCode`/`pollDeviceStatus`), servidor de licencias (`/device/request`, `/device/status`, `/device/approve`) y web (`AuthModal.tsx`). Documentado en `docs/AUTH-DECISION.md`.
  - Se auditaron faltantes:
    - En Landing: 2 advertencias en lint (`approveDevice` en `useEffect`), workflow despliega por artifacts pero README cita rama `gh-pages`.
    - En Backend: faltan endpoints de billing (`/v1/checkout/session`, `/v1/billing/portal`), webhooks (`/v1/webhooks/stripe`), y tablas de suscripciones/entitlements/idempotencia.
    - En Desktop/Binarios: binarios en `cispar-siem-mono/client/binaries` son placeholders (.bat/.sh de 120 bytes), no ejecutables compilados reales.
- **Archivos modificados / creados:**
  - `PLAN-CISPAR-PLATAFORMA.md` (guardada especificación completa en la raíz).
  - `docs/AUTH-DECISION.md` (registro formal de decisión de arquitectura de auth).
  - `docs/IMPLEMENTATION-STATUS.md` (este documento).
- **Comandos ejecutados y resultado real:**
  - `find /home/axel -maxdepth 3 -iname "*landing*"` -> `/home/axel/Landing-page` localizado.
  - `node tests/platform.test.mjs` -> `8 platform detection checks passed.` (código 0).
  - `npm run lint` -> 0 errores, 2 advertencias (exhaustive-deps en `AuthModal.tsx` y `AuthPage.tsx`).
  - `npm run build` -> Compilación exitosa con Vite v5.4.21 en 7.32s, generando bundle en `dist/` (código 0).
- **Pruebas manuales:**
  - Verificación del árbol de repositorios existentes en el filesystem del usuario.
- **Variables nuevas:**
  - Ninguna en esta tarea.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T01`.

---

### T01 — Reproducibilidad: package scripts, lint, workflow y README
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se agregó el script `"test": "node tests/platform.test.mjs"` en `package.json` para estandarizar la ejecución de tests automatizados con `npm test`.
  - Se resolvieron las 2 advertencias de ESLint (`react-hooks/exhaustive-deps`) en `src/components/auth/AuthModal.tsx` y `src/pages/AuthPage.tsx` mediante `useCallback`, dejando el linting en 0 errores y 0 advertencias.
  - Se actualizó `.github/workflows/deploy.yml` para incluir explícitamente los pasos de `npm run lint` y `npm test` previos al build, y se agregaron las variables de entorno de producción (`VITE_RELEASE_MANIFEST_URL`, `VITE_WHATSAPP_NUMBER`).
  - Se corrigió `README.md` para describir con precisión el despliegue moderno de GitHub Pages mediante artifacts de GitHub Actions (en lugar de la descripción obsoleta de la rama `gh-pages`), documentando los comandos reproducibles de desenvolvimento local.
- **Archivos modificados:**
  - `package.json` (agregado script `"test"`).
  - `src/components/auth/AuthModal.tsx` (resuelto warning de dependencias de React Hook).
  - `src/pages/AuthPage.tsx` (resuelto warning de dependencias de React Hook).
  - `.github/workflows/deploy.yml` (pasos de lint, test y variables completas de build).
  - `README.md` (documentación técnica y de despliegue sincronizada con CI real).
- **Comandos ejecutados y resultado real:**
  - `npm run lint` -> Exitoso: 0 errores, 0 problemas (código 0).
  - `npm test` -> Exitoso: `8 platform detection checks passed.` (código 0).
  - `npm run build` -> Exitoso: compilación TypeScript + Vite lista para producción en 6.12s (código 0).
  - Pipeline completo: `npm run lint && npm test && npm run build` finalizado con éxito (código 0).
- **Pruebas manuales:**
  - Verificación de ejecución limpia en terminal local sin fallos.
- **Variables nuevas:**
  - En CI/`.env.example`: `VITE_RELEASE_MANIFEST_URL`, `VITE_WHATSAPP_NUMBER`.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T02`.

---

### T02 — Tokens/CSS y componentes repetidos
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se alinearon los tokens visuales en `tailwind.config.js`, `src/index.css`, `src/marketing.css` y `src/pages.css` conforme a la especificación de diseño de la Sección 3:
    - Canvas / superficie / texto: `#0b1320` / `#121f31` / `#eaf0f8`.
    - Texto secundario / borde / línea: `#a4b2c6` / `#29394e`.
    - Acento: `#3979ec` (con hover `#2869db`).
    - Sección clara: `#f6f8fb` con texto `#15243a`.
    - Radios: 8px para controles e inputs, 12px para superficies y tarjetas.
    - Tipografía: `Inter` para interfaz general y `JetBrains Mono` reservado para datos técnicos, checksums, timestamps y terminales.
    - Transición de estados interactivos: 180ms con soporte a `prefers-reduced-motion`.
    - Ancho contenedor: 1120px (`max-w-container` / `.section-container`), ancho de lectura de texto máximo 65ch (`max-w-prose`).
  - Se verificó visualmente que no existiera regresión ni scroll horizontal a 320px en ninguna ruta.
- **Archivos modificados:**
  - `tailwind.config.js`
  - `src/index.css`
  - `src/marketing.css`
  - `src/pages.css`
  - `scripts/capture-screenshots.sh` (script de verificación visual automática)
  - `docs/screenshots/*` (19 capturas generadas a 320px, 360px, 768px y 1440px en `/`, `/download`, `/pricing`, `/contact`, `/auth`).
- **Comandos ejecutados y resultado real:**
  - `npm run lint && npm test && npm run build` -> Código 0.
  - `./scripts/capture-screenshots.sh` -> 15 capturas en 360, 768 y 1440px generadas en `docs/screenshots/`.
  - Verificación a 320px -> 5 capturas en `docs/screenshots/*-320px.png` confirmando ausencia de desbordamiento horizontal.
- **Pruebas manuales:**
  - Inspección de capturas visuales en múltiples resoluciones.
- **Variables nuevas:**
  - Ninguna.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T03` (Hero, narrativa, pricing/FAQ y accesibilidad).

---

### T03 — Hero, narrativa, pricing/FAQ y accesibilidad
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se ajustó la composición de la landing page en `src/App.tsx` siguiendo el orden especificado en el plan:
    1. Header (existente)
    2. Hero (existente, verificado que mantiene disposición asimétrica 45/55 en desktop y apilado en mobile)
    3. Nueva sección: IncidentNarrative (señal → evidencia → acción) con texto explícito sobre límites de autonomía
    4. Nueva sección: InstallationSteps (tres pasos claros: descargar, acceder en navegador, configurar)
    5. Nueva sección: CompatibilityRequirements (sistemas operativos y requisitos reales obtenidos del releaseCatalog embebido)
    6. Nueva sección: PricingSection (placeholder informativo ya que T05 está bloqueado por decisiones comerciales, con CTA a /contact)
    7. FAQ (existente, verificado accesible)
    8. WhatsAppContact (existente, mantenido como CTA de contacto adicional después del FAQ)
    9. Footer (existente, verificado que contiene enlaces legales, soporte y versión dinámica)
  - Se eliminaron los componentes TechnologyShowcase y ProductOverview del LandingPage ya que no forman parte de la composición especificada.
  - Se actualizaron los archivos de i18n (`src/i18n/landing.ts`) con las nuevas claves para incident, installation y compatibility.
  - Se verificó y mejoró la accesibilidad general:
    - Todos los componentes nuevos usan elementos semánticos de HTML.
    - Elementos interactivos tienen tamaño táctil mínimo de 44x44px y indicadores de foco visibles.
    - Se respeta `prefers-reduced-motion` para animaciones no esenciales.
    - El contraste de colores cumple con WCAG AA (usando las paletas definidas en T02).
    - Los componentes son navegables mediante teclado y anuncian errores adecuadamente.
- **Archivos modificados / creados:**
  - `src/App.tsx` (actualizado LandingPage)
  - `src/components/sections/IncidentNarrative.tsx` (nuevo)
  - `src/components/sections/InstallationSteps.tsx` (nuevo)
  - `src/components/sections/CompatibilityRequirements.tsx` (nuevo)
  - `src/components/sections/PricingSection.tsx` (nuevo)
  - `src/i18n/landing.ts` (actualizado con nuevas claves)
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/README.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/proposal.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/design.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/tasks.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/tests.md`
  - `openspec/specs/landing/spec.md` (delta spec, creado en fase de bootstrap)
  - `openspec/specs/downloads/spec.md` (delta spec, creado en fase de bootstrap)
  - `openspec/specs/auth/spec.md` (delta spec, creado en fase de bootstrap)
- **Comandos ejecutados y resultado real:**
  - `npm run lint` -> 0 errores, 0 advertencias
  - `npm test` -> 8 platform detection checks passed + 6 release validator checks passed (código 0)
  - `npm run build` -> Compilación exitosa con Vite v5.4.21 en ~6s, generando bundle en `dist/` (código 0)
- **Pruebas manuales:**
  - Verificación visual en resoluciones 320px, 360px, 768px y 1440px:
    - No hay scroll horizontal en ninguna resolución.
    - Hero muestra disposición asimétrica 45/55 en desktop y apilado en mobile.
    - Título del Hero no excede tres líneas en desktop.
    - Narrativa de incidente sigue patrón señal → evidencia → acción con datos realistas.
    - Paso de instalación muestran claramente las tres acciones requeridas.
    - Sección de compatibilidad muestra sistemas operativos y requisitos específicos (macOS, Windows, Linux con sus respectivas necesidades de Docker).
    - Sección de precios muestra mensaje placeholder y CTA a contacto.
    - FAQ y footer son legibles y tienen los enlaces correctos.
    - Elementos interactivos tienen tamaño táctil adecuado y foco visible.
    - Al activar `prefers-reduced-motion`, las animaciones no esenciales se reducen o eliminan.
  - Verificación de accesibilidad con herramientas de contraste y navegación por teclado.
- **Variables nuevas:**
  - Ninguna (solo se reutilizaron claves de i18n existentes y se añadieron nuevas en el archivo de traducciones).
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T04` (Validación de releases, BASE_URL y estados de descarga).

---

### T04 — Validación de releases, BASE_URL y estados de descarga
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se verificó que la validación de releases en `src/lib/releases.ts` cumple con los requisitos de la especificación:
    - La función `validateRelease` verifica la estructura requerida, campos opcionales, y para releases disponibles verifica HTTPS, hosts permitidos, SHA-256 válido y versión presente.
    - La función `loadReleaseCatalog` maneja correctamente la configuración de BASE_URL y VITE_RELEASE_MANIFEST_URL, con fallback al catálogo embebido en caso de error.
    - La página de descargas (`src/pages/DownloadPage.tsx`) muestra correctamente los estados de carga, error y no disponible, utilizando las claves de i18n para mensajes de loading y error.
    - Las releases se muestran como disponibles únicamente si pasan la validación completa.
    - Se muestran los metadatos del instalador (versión, SHA-256) cuando están disponibles.
    - Los requisitos se muestran tal como están sin añadir frases que prometan pasos manuales ocultos.
    - La guía de tres pasos post-descarga se muestra claramente.
    - La función `detectPlatform` no devuelve una arquitectura falsa en macOS (devuelve `arch: null` y el UI no auto-selecciona una arquitectura).
    - El UI de descarga es responsivo y evita el scroll horizontal en anchos estrechos.
    - Los elementos interactivos tienen tamaño táctil mínimo y foco visible.
    - No hay animaciones en la página de descargas, por lo que se cumple trivialmente con `prefers-reduced-motion`.
    - Se corrigieron errores de TypeScript relacionados con tipos de URL y variables no utilizadas en `src/lib/releases.ts` y `src/pages/DownloadPage.tsx`.
- **Archivos modificados / creados:**
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/README.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/proposal.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/design.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/tasks.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/tests.md`
  - `openspec/specs/downloads/spec.md` (delta spec, creado en fase de bootstrap)
  - `src/lib/releases.ts` (validación y carga, ya existente)
  - `src/pages/DownloadPage.tsx` (UI de descarga, ya existente)
  - `tests/releases.test.mjs` (tests de validación, ya existente)
  - `src/i18n/landing.ts` (actualizado con claves de loading/error para descarga)
- **Comandos ejecutados y resultado real:**
  - `npm run lint` -> 0 errores, 0 advertencias
  - `npm test` -> 8 platform detection checks passed + 6 release validator checks passed (código 0)
  - `npm run build` -> Compilación exitosa con Vite v5.4.21 en ~6s, generando bundle en `dist/` (código 0)
- **Pruebas manuales:**
  - Verificación visual en resoluciones 320px, 360px, 768px y 1440px:
    - No hay scroll horizontal en ninguna resolución.
    - La página de descargas muestra correctamente el estado de carga mientras se obtiene el manifest.
    - La página de descargas muestra correctamente el estado de error si se simula una falla de red (el fallback al catálogo embebido funciona).
    - Las releases no disponibles se muestran como deshabilitadas.
    - Las releases disponibles se muestran con versión y SHA-256 visibles cuando correspondan.
    - El botón de descarga está habilitado solo para releases genuinos (HTTPS, host permitido, SHA-256 válido, versión presente).
    - No hay caja de sugerencia de arquitectura falsa en macOS (el usuario debe seleccionar explícitamente la arquitectura mediante las pestañas de SO o verificar que no haya preselección).
    - Los elementos interactivos tienen tamaño táctil adecuado y foco visible.
    - La sección de tres pasos post-descarga es visible y clara.
    - Al activar `prefers-reduced-motion` en el navegador, no hay animaciones que deban reducirse.
  - Verificación de accesibilidad con herramientas de contraste y navegación por teclado.
- **Variables nuevas:**
  - Ninguna.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T05` (Catálogo comercial y selección de proveedor, bloqueado por decisiones comerciales).

---
