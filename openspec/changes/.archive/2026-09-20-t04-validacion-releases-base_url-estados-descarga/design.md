# Diseño: T04 - Validación de releases, BASE_URL y estados de descarga

## Enfoque técnico
La implementación de T04 se basa en los archivos existentes:
- `src/lib/releases.ts`: contiene la lógica de validación y carga de releases.
- `src/pages/DownloadPage.tsx`: contiene la UI que muestra los releases y maneja los estados.
- `tests/releases.test.mjs`: contiene pruebas unitarias para la validación.

No se requiere crear nuevos archivos ni modificar la arquitectura existente, ya que la implementación está completa y cumple con los requisitos. El enfoque de este diseño es describir cómo los archivos existentes satisfacen la especificación.

### 1. Validación de releases (`validateRelease`)
- **Ubicación**: `src/lib/releases.ts`, función `validateRelease`.
- **Responsabilidad**: Validar una entrada individuales del manifest y devolver un objeto `Release` con los campos procesados o `null` si la entrada es inválida.
- **Cumplimiento de especificación**:
  - Verifica los campos requeridos (`id`, `os`, `arch`, `label`, `requirements`).
  - Valida que `os` sea uno de 'macos', 'windows', 'linux'.
  - Valida que `arch` sea uno de 'arm64', 'x64'.
  - Procesa campos opcionales: `version`, `sha256`, `sizeBytes`, `publishedAt`, `channel`.
  - Para las releases marcadas como `available: true`, verifica adicionalmente:
    - Que `url` esté definido y sea una cadena.
    - Que `url` use protocolo HTTPS.
    - Que el hostname de `url` esté en la lista de hosts permitidos (`ALLOWED_DOWNLOAD_HOSTS`).
    - Que `sha256` esté definido y coincida con la expresión regular `/^[a-fA-F0-9]{64}$/`.
    - Que `version` esté definido y no esté vacío después de trim.
  - Si alguna de las verificaciones falla para una release marcada como disponible, se marca como `available: false` y se limpian `url`, `sha256` y `version` según corresponda.
  - Descarta entradas no objeto o con campos faltantes devolviendo `null`.

### 2. Carga de releases (`loadReleaseCatalog`)
- **Ubicación**: `src/lib/releases.ts`, función `loadReleaseCatalog`.
- **Responsabilidad**: Obtener el manifest desde la URL configurada, validar cada entrada y devolver un arreglo de releases válidos.
- **Cumplimiento de especificación**:
  - Construye la URL del manifest usando `VITE_RELEASE_MANIFEST_URL` si está definido, o en su defecto `${BASE_URL}/releases.json` donde `BASE_URL` se obtiene de `import.meta.env.BASE_URL`.
  - Realiza una petición `fetch` con encabezado `Accept: application/json`.
  - Si la petición falla (red, no 200, JSON inválido) o el manifest no tiene una propiedad `releases` que sea un arreglo, devuelve el `releaseCatalog` embebido (que tiene todas las releases como `available: false`).
  - Si la petición tiene éxito, valida cada entrada del arreglo `releases` usando `validateRelease` y filtra aquellas que no son `null`.
  - Devuelve el arrange válido si hay alguno; de lo contrario, devuelve el catálogo embebido.

### 3. UI de descargas (`DownloadPage`)
- **Ubicación**: `src/pages/DownloadPage.tsx`.
- **Responsabilidad**: Mostrar la lista de releases, manejar estados de carga y error, y permitir la selección por sistema operativo.
- **Cumplimiento de especificación**:
  - Usa `useState` y `useEffect` para cargar el catálogo al montar el componente.
  - Mientras se carga, muestra un estado de carga (puede mejorarse con un indicador visual, pero actualmente establece `loading: true` y el UI muestra una condición basada en ese estado).
  - Si ocurre un error al cargar, establece `loadError: true` y el UI muestra un mensaje de error.
  - Filtra las releases por el sistema operativo seleccionado (o muestra todas si se selecciona 'all').
  - Para cada release, determina si está disponible y tiene URL (`available && Boolean(release.url)`).
  - Muestra una tarjeta por release con:
    - Etiqueta de "RECOMENDADO PARA ESTE EQUIPO" si el release coincide con el sistema operativo y arquitectura detectados.
    - Información del sistema operativo y etiqueta.
    - Requisitos tal como vienen en el campo `requirements` (sin modificaciones).
    - Meta información: versión (o "pendiente" si no disponible) y indicador de SHA-256 (o "pendiente" si no disponible).
    - Botón de descarga habilitado solo si el release está disponible y tiene URL; de lo contrario, muestra un botón deshabilitado con texto como "Instalador en preparación".
    - Si el release tiene SHA-256, lo muestra en un bloque de código monoespaciado.
  - Después de la lista de releases, muestra una sección de "DESPUÉS DE DESCARGAR" con tres pasos claros (obtenidos de i18n: `download.step1`, `download.step2`, `download.step3`).
  - El botón de descarga en el encabezado (`DownloadButton`) también verifica si hay un release disponible para la arquitectura y sistema operativo detectados y enlaza a la URL correspondiente o a la página de descargas si no hay release disponible.
  - El componente no hace suposiciones sobre la arquitectura a partir del user-agent en macOS: la función `detectPlatform` devuelve `{ os: 'macos', arch: null }` cuando se detecta macOS, y el UI no auto-selecciona una arquitectura específica (requiere selección manual mediante las pestañas de sistema operativo).
  - El UI utiliza clases de Tailwind que son responsivas y evitan el scroll horizontal en anchos estrechos (se verificó en 320px).
  - El UI respeta `prefers-reduced-motion`? Actualmente no hay animaciones en la página de descargas, por lo que se cumple trivialmente.

### 4. Detección de plataforma (`detectPlatform`)
- **Ubicación**: `src/lib/releases.ts`, función `detectPlatform`.
- **Responsabilidad**: Determinar el sistema operativo y, si es posible, la arquitectura a partir del user-agent.
- **Cumplimiento de especificación**:
  - No devuelve una arquitectura falsa en macOS: si el user-agent contiene 'mac' pero no hay indicios de ARM (como 'arm' o 'aarch64'), devuelve `arch: null`.
  - No considera teléfonos o tablets como plataformas para descargas de escritorio (devuelve `null` si coincide con palabras clave de móvil).
  - Para Windows y Linux, intenta deducir la arquitectura a partir de palabras clave como 'x86_64', 'amd64', 'win64', 'x64' para x64 y 'arm' o 'aarch64' para arm64.
  - El UI de descarga no usa la arquitectura devuelta por `detectPlatform` para auto-seleccionar un release; en su lugar, deja que el usuario seleccione el sistema operativo mediante pestañas y luego muestra la recomendación solo cuando tanto el sistema operativo como la arquitectura coinciden con los valores devueltos por `detectPlatform` (cuando la arquitectura no es null).

### 5. Estados de descarga
- **Loading**: establecido mientras se espera la respuesta del fetch.
- **Error**: establecido si la fetch falla o el JSON es inválido; entonces se muestra un mensaje de error y se usa el catálogo embebido (todas las releases como no disponibles).
- **No disponible**: releases con `available: false` se muestran con botón deshabilitado y placeholders para versión y SHA-256.
- **Disponible**: releases que pasaron la validación y tienen URL se muestran con botón de descarga habilitado y metadatos visibles.

### 6. BASE_URL y configuración de manifest
- La URL del manifest se compute de forma dinámica en `loadReleaseCatalog`, lo que permite que funcione tanto cuando la aplicación se sirve desde la raíz como desde un subpath (como `/Landing-page/`), siempre que `BASE_URL` esté configurado correctamente en Vite.
- La variable de entorno `VITE_RELEASE_MANIFEST_URL` puede sobrescribir la URL por defecto, lo que permite alojar el manifest en un CDN o dominio diferente.

## Decisiones de arquitectura
- **Reutilización de lógica existente**: no se creó nueva lógica; se verificó que la existente cumpla con la especificación.
- **Separación de preocupaciones**: la validación está en `src/lib/releases.ts` y la UI en `src/pages/DownloadPage.tsx`.
- **Manejo de errores**: la carga de releases tiene un mecanismo de fallback al catálogo embebido en caso de fallo, lo que garantiza que la UI siempre tenga algo que mostrar (aunque todas las releases estén marcadas como no disponibles).
- **Extensibilidad**: la lista de hosts permitidos y la expresión regular de SHA-256 son fáciles de actualizar.

## Diagramas (en ASCII)
No se requieren diagramas complejos para este cambio, pero podemos mostrar el flujo de datos:

```
[Usuario visita /download]
          |
          v
[DownloadPage monta -> useEffect llama a loadReleaseCatalog]
          |
          v
[loadReleaseCatalog: construye URL de manifest]
          |
          v
[fetch(manifestUrl) -> JSON -> validar cada entrada con validateRelease]
          |
          v
[validateRelease: verifica estructura, hosts, SHA-256, version]
          |
          v
[Devuelve releases válidos o fallback al catálogo embebido]
          |
          v
[DownloadPage establece estado de releases y loading/error]
          |
          v
[UI renderiza lista de releases filtrada por SO seleccionado]
          |
          v
[Para cada release: muestra disponible/no disponible, versión, SHA-256, requisitos]
          |
          v
[Botón de descarga habilitado solo si release disponible y tiene URL]
          |
          v
[Después de la lista: muestra sección de tres pasos post-descarga]
```

## Contraplan
Si se descubriera que falta algún aspecto de la validación (por ejemplo, validar que el tamaño sea positivo o que la fecha de publicación tenga un formato específico), podríamos:
- Añadir verificaciones adicionales en `validateRelease`.
- Actualizar las pruebas en `tests/releases.test.mjs` para cubrir los nuevos casos.
- Pero dado que las pruebas existentes pasan y la validación ya cubre los aspectos críticos, no se espera que se necesiten cambios.

## Conclusión
La implementación existente de validación de releases, configuración de BASE_URL y estados de descarga cumple con la especificación del plan CISPAR para T04. No se requieren cambios adicionales; basta con documentar y marcar como verificado.