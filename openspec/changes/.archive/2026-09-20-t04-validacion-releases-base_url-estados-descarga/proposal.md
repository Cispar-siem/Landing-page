# Propuesta: T04 - Validación de releases, BASE_URL y estados de descarga

## ¿Por qué este cambio?
La plan CISPAR especifica que la página de descargas debe mostrar únicamente releases genuinos y verificables, y que debe manejar adecuadamente los estados de carga, error y no disponibilidad. Actualmente, la validación de releases y la lógica de estados ya está implementada en `src/lib/releases.ts` y en la página de descargas (`src/pages/DownloadPage.tsx`). Este cambio tiene como objetivo documentar dicha implementación en el formato OpenSpec y marcarla como verificada.

## Alcance
- Validar que la función `validateRelease` en `src/lib/releases.ts` cumpla con los requisitos de validación de manifest (estructura, hosts permitidos, SHA-256, versión).
- Validar que la función `loadReleaseCatalog` en `src/lib/releases.ts` maneje correctamente la configuración de BASE_URL y VITE_RELEASE_MANIFEST_URL.
- Validar que la página de descargas (`src/pages/DownloadPage.tsx`) muestre correctamente los estados de carga, error y no disponible.
- Validar que la página de descargas muestre únicamente como disponibles los releases que pasan la validación.
- Validar que la página de descargas muestre los metadatos del instalador (versión, SHA-256) cuando estén disponibles.
- Validar que la página de descargas muestre los requisitos tal como están sin añadir frases que prometan pasos manuales ocultos.
- Validar que la página de descargas muestre la guía de tres pasos post-descarga.
- Validar que la función `detectPlatform` en `src/lib/releases.ts` no devuelva una arquitectura falsa en macOS.
- Validar que el UI de descarga no haga scroll horizontal en ninguna resolución y que respete `prefers-reduced-motion`.

## No está incluido (non-goals)
- Cambios en el backend de licencias o en el servidor de releases.
- Cambios en el cliente de escritorio o en el instalador nativo.
- Cambios en la página de precios o en la página de contacto.
- Cambios en la lógica de autenticación.