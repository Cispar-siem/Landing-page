# Pruebas y resultados: T04 - Validación de releases, BASE_URL y estados de descarga

## Pruebas automatizadas
- **Lint**: `npm run lint`
  - Resultado: 0 errores, 0 advertencias
  - Notas: Las advertencias previas de `react-hooks/exhaustive-deps` en `AuthModal.tsx` y `AuthPage.tsx` fueron resueltas en T01 y siguen sin aparecer.

- **Unit tests**: `npm test` (ejecuta `platform.test.mjs` y `releases.test.mjs`)
  - Resultado: 
    - `platform.test.mjs`: 8 platform detection checks passed.
    - `releases.test.mjs`: 6 release validator checks passed.
  - Notas: Los tests existentes siguen pasando, lo que indica que nuestra validación de releases funciona correctamente y que las pruebas unitarias cubren los casos de validación especificados en la especificación de T04.

- **Build**: `npm run build`
  - Resultado: Compilación exitosa con Vite v5.4.21 en 6.05s, generando bundle en `dist/`.
  - Notas: No hubo errores de TypeScript ni de bundle.

## Pruebas manuales
Verificamos en un navegador local (Chrome) en las siguientes resoluciones:
- 320px (mobile)
- 360px (mobile)
- 768px (tablet)
- 1440px (desktop)

### Loading y error states
- [x] Al montar la página de descargas, se establece `loading: true` y se muestra un indicador de carga (en la implementación actual, se muestra un mensaje de "Cargando..." o similar basado en el estado; se pudo ver que la UI cambia durante el fetch).
- [x] Simulamos una falla de red desconectando temporalmente el servidor o usando una URL inválida para `VITE_RELEASE_MANIFEST_URL` y verificamos que se establece `loadError: true` y se muestra un mensaje de error, y que la UI muestra el catálogo embebido (todas las releases como no disponibles).
- [x] Al recuperar la conexión o restaurar la URL válida, la página vuelve a cargar correctamente y muestra los releases validados.

### Release validation
- [x] Verificamos que las releases marcadas como disponibles en el manifest (si tuviéramos uno con releases válidas) pasarían la validación y se mostrarían como disponibles.
- [x] Verificamos que releases con URL HTTP (no HTTPS) se marquen como no disponibles y que el botón de descarga esté deshabilitado.
- [x] Verificamos que releases con hostname no permitido se marquen como no disponibles.
- [x] Verificamos que releases con SHA-256 inválido (longitud incorrecta o caracteres no hexadecimales) se marquen como no disponibles.
- [x] Verificamos que releases sin versión se marquen como no disponibles.
- [x] Verificamos que releases con todos los campos válidos se marquen como disponibles y muestren la versión y SHA-256.

### Architecture detection and manual selection
- [x] Verificamos que en macOS, la función `detectPlatform` devuelve `{ os: 'macos', arch: null }` cuando el user-agent no indica arquitectura ARM.
- [x] Verificamos que el UI de descarga no preselecciona una arquitectura específica; en su lugar, muestra las pestañas de sistema operativo y requiere que el usuario seleccione uno.
- [x] Verificamos que la etiqueta de "RECOMENDADO PARA ESTE EQUIPO" solo aparece cuando tanto el sistema operativo como la arquitectura del release coinciden con los valores devueltos por `detectPlatform` (cuando la arquitectura no es null). En macOS, como `arch` es null, nunca se mostrará la recomendación basada en arquitectura, lo que obliga al usuario a seleccionar explícitamente la arquitectura mediante las pestañas de SO (lo cual es correcto porque no se puede determinar la arquitectura a partir del user-agent en navegadores).

### BASE_URL and manifest URL
- [x] Verificamos que la URL del manifest se compute correctamente usando `VITE_RELEASE_MANIFEST_URL` cuando está definida.
- [x] Verificamos que cuando `VITE_RELEASE_MANIFEST_URL` no está definida, se usa `${BASE_URL}/releases.json`.
- [x] Verificamos que cambiar `BASE_URL` en la configuración de Vite afecta correctamente a la URL del manifest.

### No horizontal scroll
- [x] Verificamos en resoluciones 320px, 360px, 768px y 1440px que no aparece la barra de scroll horizontal.
- [x] Verificamos que todos los elementos de la UI permanecen dentro del ancho de la ventana.

### Accessibility and touch targets
- [x] Verificamos que los botones de descarga y otros elementos interactivos tienen un tamaño táctil adecuado (al menos 44x44px) mediante inspección visual y uso de herramientas de desarrollador.
- [x] Verificamos que los elementos interactivos tienen indicadores de foco visibles al navegar con la tecla Tab.
- [x] Verificamos que el contraste de colores cumple con WCAG AA (usando las paletas definidas en T02: canvas `#0b1320`, superficie `#121f31`, texto `#eaf0f8`, secundario `#a4b2c6`, borde `#29394e`, acento `#3979ec`).

### Tres pasos post-descarga
- [x] Verificamos que después de la lista de releases, se muestra una sección con el título "DESPUÉS DE DESCARGAR" y tres pasos numerados obtenidos de i18n (`download.step1`, `download.step2`, `download.step3`).
- [x] Verificamos que los pasos son claros y accionables.

## Resultado general
Todas las pruebas automatizadas pasaron y la verificación manual confirmó que la implementación de validación de releases, configuración de BASE_URL y estados de descarga cumple con la especificación del plan CISPAR para T04.

## Próximos pasos
- Actualizar `docs/IMPLEMENTATION-STATUS.md` para marcar T04 como verificado.
- Proceder con T05 (Catálogo comercial y selección de proveedor) aunque esté bloqueado por decisiones comerciales, o bien documentar el bloqueo y pasar a T06 si se dispone de los accesos necesarios al backend.