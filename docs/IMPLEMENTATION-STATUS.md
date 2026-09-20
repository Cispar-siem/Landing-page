# CISPAR — Estado de Implementación de Tareas

**Modo operativo:** startup en producción. Los estados `verificado` de este documento indican comprobación local del repositorio y no sustituyen validación de staging, producción, billing, releases firmadas, monitoreo o rollback.

Documento de seguimiento vivo según la especificación de `PLAN-CISPAR-PLATAFORMA.md`.

---

## Resumen General de Tareas

| ID | Tarea | Estado | Siguiente acción / Bloqueo |
|---|---|---|---|
| **T00** | Inventario de landing, backend y desktop; auth, instalación, billing existente | **verificado** | Completado. Decisión registrada en `docs/AUTH-DECISION.md`. |
| **T01** | Reproducibilidad: package scripts, lint, workflow y README | **verificado** | Scripts alineados, lint limpio (0 errores/0 advertencias), tests integrados y CI corregido. |
| **T02** | Tokens/CSS y componentes repetidos | **verificado** | Tokens visuales consolidados (3. Especificación visual), sin regresiones en todas las rutas. Capturas generadas en 320/360/768/1440px. |
| **T03** | Hero, narrativa, pricing/FAQ y accesibilidad | **pendiente** | Próxima tarea a ejecutar. |
| **T04** | Validación de releases, BASE_URL y estados de descarga | **pendiente** | Depende de T01. |
| **T05** | Catálogo comercial y selección de proveedor | **bloqueado** | Requiere decisiones comerciales del propietario (precios, moneda, proveedor). |
| **T06** | Migraciones mínimas, autorización y aislamiento | **pendiente** | Depende de T00 backend y T05 modelo. |
| **T07** | Completar login web/registro/recuperación y callbacks | **pendiente** | Depende de T00 auth y T01. |
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
  - Se corrigió `README.md` para describir con precisión el despliegue moderno de GitHub Pages mediante artifacts de GitHub Actions (en lugar de la descripción obsoleta de la rama `gh-pages`), documentando los comandos reproducibles de desarrollo local.
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
