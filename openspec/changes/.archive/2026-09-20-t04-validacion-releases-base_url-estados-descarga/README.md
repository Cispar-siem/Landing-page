# T04: Validación de releases, BASE_URL y estados de descarga

**Status**: in-progress  
**Owner**: Team Lead (you)  
**Started**: 2026-09-20  
**Domains affected**: downloads

## What
Verificar y asegurar que la validación de releases, la configuración de BASE_URL y los estados de descarga (loading, error, no disponible) estén correctamente implementados según la especificación del plan. Esto incluye:
- Validación estricta del manifest JSON (estructura, hosts permitidos, SHA-256, versión)
- Manejo correcto de loading y error al cargar el manifest
- Estados de descarga disponibles/no disponibles con placeholder apropiados
- Configuración de BASE_URL y VITE_RELEASE_MANIFEST_URL
- No deducción falsa de arquitectura desde user-agent
- Metadatos transparentes del instalador (versión, SHA-256)
- Requisitos honestos sin prometer pasos manuales ocultos
- Guía de tres pasos post-descarga

## Why
El plan CISPAR requiere que la página de descargas muestre únicamente releases genuinos y verificables, y que maneje adecuadamente los estados de carga, error y no disponibilidad. Actualmente, la validación de releases y la lógica de estados ya está implementada en `src/lib/releases.ts` y en la página de descargas (`src/pages/DownloadPage.tsx`). Este cambio tiene como objetivo documentar dicha implementación en el formato OpenSpec y marcarla como verificada.

## How to verify
- Ejecutar `npm run lint && npm test && npm run build` y verificar que no haya errores.
- Verificar manualmente que la página de descargas muestre correctamente:
  - Estado de carga mientras se obtiene el manifest
  - Estado de error si la fetch falla (y cae al catálogo embebido)
  - Releases no disponibles como deshabilitados
  - Releases disponibles con versión y SHA-256 visibles
  - Botón de descarga habilitado solo para releases genuinos (HTTPS, host permitido, SHA-256 válido, versión presente)
  - No hay scroll horizontal en ninguna resolución
  - La página respeta `prefers-reduced-motion`
  - Los elementos interactivos tienen tamaño táctil mínimo y foco visible
- Verificar que la función `detectPlatform` no devuelva una arquitectura falsa en macOS (devuelve `arch: null` y el UI no auto-selekta una arquitectura).
- Verificar que el manifest URL se compute correctamente usando `VITE_RELEASE_MANIFEST_URL` o `BASE_URL/releases.json`.

## Files
- `proposal.md` — razonamiento y alcance
- `design.md` — decisiones técnicas y de arquitectura
- `tasks.md` — checklist de implementation
- `tests.md` — plan de pruebas y resultados
- `specs/downloads/spec.md` — delta specs (ya creado en la fase de bootstrap)
- `src/lib/releases.ts` — implementación de validación y carga
- `src/pages/DownloadPage.tsx` — UI de descarga y manejo de estados
- `tests/releases.test.mjs` — tests de validación

## Status of artifacts
- [x] proposal
- [x] design
- [ ] tasks (en progreso)
- [ ] tests
- [x] specs (downloads)