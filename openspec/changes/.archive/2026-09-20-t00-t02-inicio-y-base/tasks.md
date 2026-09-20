# Tareas de implementación: T00-T02 - Inicio, reproducibilidad y tokens/CSS

## T00: Inventario de landing, backend y desktop; auth, instalación, billing existente
- [x] Leer las instrucciones del repositorio y revisar git status.
- [x] Confirmar existencia de repositorios reales:
  - [x] Frontend / Landing: `/home/axel/Landing-page` (React 18 + Vite + Tailwind + Supabase JS).
  - [x] Backend / License Server: `/home/axel/cispar-ia-backend/cispar-license-server` (Hono + TypeScript + Supabase + JWT).
  - [x] Cliente CLI / Terminal: `/home/axel/cispar-ia-backend/src/cli` y `/home/axel/cispar-terminal`.
  - [x] SIEM Monorepo / Installer: `/home/axel/cispar-siem-mono` (con `cispar-installer` en Go y wizard).
- [x] Fijar decisión única de autenticación: Device Authorization Flow (RFC 8628-like) ya implementado entre CLI, servidor de licencias y web.
- [x] Documentar decisión en `docs/AUTH-DECISION.md`.
- [x] Auditar faltantes:
  - [x] En Landing: 2 advertencias en lint (`approveDevice` en `useEffect`), workflow despliega por artifacts pero README cita rama `gh-pages`.
  - [x] En Backend: faltan endpoints de billing (`/v1/checkout/session`, `/v1/billing/portal`), webhooks (`/v1/webhooks/stripe`), y tablas de suscripciones/entitlements/idempotencia.
  - [x] En Desktop/Binarios: binarios en `cispar-siem-mono/client/binaries` son placeholders (.bat/.sh de 120 bytes), no ejecutables compilados reales.
- [x] Actualizar `docs/IMPLEMENTATION-STATUS.md` con los hallazgos y la decisión de auth.

## T01: Reproducibilidad: package scripts, lint, workflow y README
- [x] Agregar el script `"test": "node tests/platform.test.mjs"` en `package.json`.
- [x] Resolver las 2 advertencias de ESLint (`react-hooks/excessive-deps`) en `src/components/auth/AuthModal.tsx` y `src/pages/AuthPage.tsx` mediante `useCallback`.
- [x] Actualizar `.github/workflows/deploy.yml` para incluir explícitamente los pasos de `npm run lint` y `npm test` previos al build.
- [x] Agregar las variables de entorno de producción (`VITE_RELEASE_MANIFEST_URL`, `VITE_WHATSAPP_NUMBER`) al workflow y a `.env.example`.
- [x] Corregir `README.md` para describir con precisión el despliegue moderno de GitHub Pages mediante artifacts de GitHub Actions.
- [x] Verificar que el pipeline `npm run lint && npm test && npm run build` finalice con éxito.

## T02: Tokens/CSS y componentes repetidos
- [x] Alinear los tokens visuales en `tailwind.config.js`, `src/index.css`, `src/marketing.css` y `src/pages.css` conforme a la especificación de diseño de la Sección 3:
  - [x] Canvas / superficie / texto: `#0b1320` / `#121f31` / `#eaf0f8`.
  - [x] Texto secundario / borde / línea: `#a4b2c6` / `#29394e`.
  - [x] Acento: `#3979ec` (con hover `#2869db`).
  - [x] Sección clara: `#f6f8fb` con texto `#15243a`.
  - [x] Radios: 8px para controles e inputs, 12px para superficies y tarjetas.
  - [x] Tipografía: `Inter` para interfaz general y `JetBrains Mono` reservado para datos técnicos, checksums, timestamps y terminales.
  - [x] Transición de estados interactivos: 180ms con soporte a `prefers-reduced-motion`.
  - [x] Ancho contenedor: 1120px (`max-w-container` / `.section-container`), ancho de lectura de texto máximo 65ch (`max-w-prose`).
- [x] Verificar visualmente que no existiera regresión ni scroll horizontal a 320px en ninguna ruta.
- [x] Ejecutar el script de captura de screenshots (`scripts/capture-screenshots.sh`) y generar capturas en 360px, 768px y 1440px.
- [x] Verificar a 320px que no haya desbordamiento horizontal.

## Pruebas locales
- [x] Ejecutar `npm run lint` y verificar que no haya errores o advertencias.
- [x] Ejecutar `npm test` (que incluye `platform.test.mjs`) y verificar que pasen.
- [x] Ejecutar `npm run build` y asegurarse de que no haya errores de producción.
- [x] Verificar manualmente en el navegador en resoluciones 320px, 360px, 768px y 1440px:
  - [x] No haya scroll horizontal.
  - [x] Los tokens visuales se aplican correctamente (colores, tipografía, espaciado).
  - [x] El lint y los tests pasan.
  - [x] El build es exitoso.

## Actualización de documentación
- [x] Actualizar `docs/IMPLEMENTATION-STATUS.md` con los resultados de T00, T01 y T02.
- [x] Actualizar este `tasks.md` marcando las tareas como completadas a medida que avanzamos.
- [ ] No generar documentos paralelos extensos; mantener el plan como referencia.

## Dependencias
- T00 no tiene dependencias.
- T01 depende de T00 (solo para contexto de inventario).
- T02 depende de T01 (para contar con un entorno reproducible).

## Próximos pasos después de T02
- T03: Hero, narrativa, pricing/FAQ y accesibilidad.