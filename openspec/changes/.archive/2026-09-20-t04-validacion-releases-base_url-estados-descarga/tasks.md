# Tareas de implementación: T04 - Validación de releases, BASE_URL y estados de descarga

## Preparación
- [x] Leer la especificación de T04 en `openspec/specs/downloads/spec.md`.
- [x] Revisar la implementación existente en `src/lib/releases.ts` y `src/pages/DownloadPage.tsx`.
- [x] Revisar las pruebas existentes en `tests/releases.test.mjs`.

## Verificación de la validación de releases (`validateRelease`)
- [x] Verificar que verifica los campos requeridos (`id`, `os`, `arch`, `label`, `requirements`).
- [x] Verificar que valida que `os` sea uno de 'macos', 'windows', 'linux'.
- [x] Verificar que valida que `arch` sea uno de 'arm64', 'x64'.
- [x] Verificar que procesa campos opcionales: `version`, `sha256`, `sizeBytes`, `publishedAt`, `channel`.
- [x] Verificar que para releases marcadas como `available: true` verifica adicionalmente:
  - [x] Que `url` esté definido y sea una cadena.
  - [x] Que `url` use protocolo HTTPS.
  - [x] Que el hostname de `url` esté en la lista de hosts permitidos (`ALLOWED_DOWNLOAD_HOSTS`).
  - [x] Que `sha256` esté definido y coincida con la expresión regular `/^[a-fA-F0-9]{64}$/`.
  - [x] Que `version` esté definido y no esté vacío después de trim.
- [x] Verificar que si alguna de las verificaciones falla para una release marcada como disponible, se marca como `available: false` y se limpian `url`, `sha256` y `version` según corresponda.
- [x] Verificar que descarta entradas no objeto o con campos faltantes devolviendo `null`.

## Verificación de la carga de releases (`loadReleaseCatalog`)
- [x] Verificar que construye la URL del manifest usando `VITE_RELEASE_MANIFEST_URL` si está definido, o en su defecto `${BASE_URL}/releases.json`.
- [x] Verificar que realiza una petición `fetch` con encabezado `Accept: application/json`.
- [x] Verificar que si la petición falla (red, no 200, JSON inválido) o el manifest no tiene una propiedad `releases` que sea un arreglo, devuelve el `releaseCatalog` embebido.
- [x] Verificar que si la petición tiene éxito, valida cada entrada del arreglo `releases` usando `validateRelease` y filtra aquellas que no son `null`.
- [x] Verificar que devuelve el arrange válido si hay alguno; de lo contrario, devuelve el catálogo embebido.

## Verificación de la UI de descargas (`DownloadPage`)
- [x] Verificar que usa `useState` y `useEffect` para cargar el catálogo al montar el componente.
- [x] Verificar que mientras se carga, establece `loading: true` y el UI muestra un estado de carga (actualmente se muestra un mensaje de "Cargando..." o similar basado en el estado).
- [x] Verificar que si ocurre un error al cargar, establece `loadError: true` y el UI muestra un mensaje de error.
- [x] Verificar que filtra las releases por el sistema operativo seleccionado (o muestra todas si se selecciona 'all').
- [x] Verificar que para cada release, determina si está disponible y tiene URL (`available && Boolean(release.url)`).
- [x] Verificar que muestra una tarjeta por release con:
  - [x] Etiqueta de "RECOMENDADO PARA ESTE EQUIPO" si el release coincide con el sistema operativo y arquitectura detectados.
  - [x] Información del sistema operativo y etiqueta.
  - [x] Requisitos tal como vienen en el campo `requirements` (sin modificaciones).
  - [x] Meta información: versión (o "pendiente" si no disponible) e indicador de SHA-256 (o "pendiente" si no disponible).
  - [x] Botón de descarga habilitado solo si el release está disponible y tiene URL; de lo contrario, muestra un botón deshabilitado con texto como "Instalador en preparación".
  - [x] Si el release tiene SHA-256, lo muestra en un bloque de código monoespaciado.
- [x] Verificar que después de la lista de releases, muestra una sección de "DESPUÉS DE DESCARGAR" con tres pasos claros (obtenidos de i18n: `download.step1`, `download.step2`, `download.step3`).
- [x] Verificar que el botón de descarga en el encabezado (`DownloadButton`) también verifica si hay un release disponible para la arquitectura y sistema operativo detectados y enlaza a la URL correspondiente o a la página de descargas si no hay release disponible.
- [x] Verificar que el componente no hace suposiciones sobre la arquitectura a partir del user-agent en macOS: la función `detectPlatform` devuelve `{ os: 'macos', arch: null }` cuando se detecta macOS, y el UI no auto-selecciona una arquitectura específica (requiere selección manual mediante las pestañas de sistema operativo).
- [x] Verificar que el UI utiliza clases de Tailwind que son responsivas y evitan el scroll horizontal en anchos estrechos (se verificó en 320px).
- [x] Verificar que el UI respeta `prefers-reduced-motion` (no hay animaciones en la página de descargas, por lo que se cumple trivialmente).

## Verificación de la detección de plataforma (`detectPlatform`)
- [x] Verificar que no devuelve una arquitectura falsa en macOS: si el user-agent contiene 'mac' pero no hay indicios de ARM (como 'arm' o 'aarch64'), devuelve `arch: null`.
- [x] Verificar que no considera teléfonos o tablets como plataformas para descargas de escritorio (devuelve `null` si coincide con palabras clave de móvil).
- [x] Verificar que para Windows y Linux, intenta deducir la arquitectura a partir de palabras clave como 'x86_64', 'amd64', 'win64', 'x64' para x64 y 'arm' or 'aarch64' para arm64.
- [x] Verificar que el UI de descarga no usa la arquitectura devuelta por `detectPlatform` para auto-seleccionar un release; en su lugar, deja que el usuario seleccione el sistema operativo mediante pestañas y luego muestra la recomendación solo cuando tanto el sistema operativo como la arquitectura coinciden con los valores devueltos por `detectPlatform` (cuando la arquitectura no es null).

## Verificación de los estados de descarga
- [x] Verificar que el estado de loading se establece mientras se espera la respuesta del fetch.
- [x] Verificar que el estado de error se establece si la fetch falla o el JSON es inválido; entonces se muestra un mensaje de error y se usa el catálogo embebido (todas las releases como no disponibles).
- [x] Verificar que releases con `available: false` se muestran con botón deshabilitado y placeholders para versión y SHA-256.
- [x] Verificar que releases que pasaron la validación y tienen URL se muestran con botón de descarga habilitado y metadatos visibles.

## Verificación de BASE_URL y configuración de manifest
- [x] Verificar que la URL del manifest se compute de forma dinámica en `loadReleaseCatalog`, lo que permite que funcione tanto cuando la aplicación se sirve desde la raíz como desde un subpath (como `/Landing-page/`), siempre que `BASE_URL` esté configurado correctamente en Vite.
- [x] Verificar que la variable de entorno `VITE_RELEASE_MANIFEST_URL` puede sobrescribir la URL por defecto, lo que permite alojar el manifest en un CDN o dominio diferente.

## Pruebas locales
- [x] Ejecutar `npm run lint` y verificar que no haya errores o advertencias.
- [x] Ejecutar `npm test` (que incluye `platform.test.mjs` y `releases.test.mjs`) y verificar que pasen.
- [x] Ejecutar `npm run build` y asegurarse de que no haya errores de producción.
- [x] Verificar manualmente en el navegador en resoluciones 320px, 360px, 768px y 1440px:
  - [x] No haya scroll horizontal.
  - [x] La página de descargas muestre correctamente el estado de carga mientras se obtiene el manifest.
  - [x] La página de descargas muestre correctamente el estado de error si se simula una falla de red (opcional, pero se puede verificar que el fallback funciona).
  - [x] Las releases no disponibles se muestren como deshabilitadas.
  - [x] Las releases disponibles se muestren con versión y SHA-256 visibles cuando correspondan.
  - [x] El botón de descarga esté habilitado solo para releases genuinos (HTTPS, host permitido, SHA-256 válido, versión presente).
  - [x] No haya caja de sugerencia de arquitectura falsa en macOS (el usuario debe seleccionar explícitamente la arquitectura mediante las pestañas de SO o ver que no haya preselección).
  - [x] Los elementos interactivos tengan tamaño táctil mínimo y foco visible.
  - [x] La sección de tres pasos post-descarga sea visible y clara.
- [x] Verificar que al activar `prefers-reduced-motion` en el navegador, no haya animaciones que deban reducirse (la página de descargas no tiene animaciones).

## Actualización de documentación
- [x] Actualizar `docs/IMPLEMENTATION-STATUS.md` al completar la tarea (marcar como verificado).
- [x] Actualizar este `tasks.md` marcando las tareas como completadas a medida que avanzamos.
- [ ] No generar documentos paralelos extensos; mantener el plan como referencia.

## Dependencias
- Esta tarea depende de T01 (reproducibilidad) y T02 (tokens/CSS) ya verificadas.
- No depende de T03, pero sí afecta a la página de descargas que se linké desde el header y desde la landing page.
- T05 permanece bloqueado por decisiones comerciales, por lo que la sección de precios en la landing page es un placeholder.

## Próximos pasos después de T04
- T05: Catálogo comercial y selección de proveedor (bloqueado, esperando decisiones del propietario).
- T06: Migraciones mínimas, autorización y aislamiento (backend).
- Etc.