# Diseño: T00-T02 - Inicio, reproducibilidad y tokens/CSS

## Enfoque técnico
Las tareas T00, T01 y T02 son principalmente de configuración, inventario y consolidación de código existente. No se introdujo nueva lógica de negocio, sino que se estableció la base para el desarrollo futuro.

### T00: Inventario y decisión de auth
- **Inventario**: se realizó una búsqueda en el filesystem para localizar los repositorios relacionados con CISPAR (frontend, backend, desktop, instalador). Se confirmó su existencia y se documentó en `docs/IMPLEMENTATION-STATUS.md`.
- **Decisión de auth**: se revisó la implementación existente del Device Authorization Flow (RFC 8628) entre el CLI, el servidor de licencias y el web frontend. Se decidió mantener este flujo como único y descartar alternativas (como Authorization Code con PKCE loopback) para evitar duplicidad y complejidad. La decisión se documentó en `docs/AUTH-DECISION.md`.

### T01: Reproducibilidad
- **Scripts de package**: se agregó el script `"test": "node tests/platform.test.mjs"` a `package.json` para estandarizar la ejecución de tests automatizados.
- **Lint**: se resolvieron las advertencias de ESLint (`react-hooks/exhaustive-deps`) en `src/components/auth/AuthModal.tsx` y `src/pages/AuthPage.tsx` mediante el uso de `useCallback` para estabilizar las dependencias de los hooks.
- **Workflow de CI**: se actualizó `.github/workflows/deploy.yml` para incluir explícitamente los pasos de `npm run lint` y `npm test` antes del build, y se agregaron las variables de entorno de producción (`VITE_RELEASE_MANIFEST_URL`, `VITE_WHATSAPP_NUMBER`).
- **README**: se corrigió `README.md` para describir con precisión el despliegue moderno de GitHub Pages mediante artifacts de GitHub Actions (en lugar de la descripción obsoleta de la rama `gh-pages`), y se documentaron los comandos reproducibles de desarrollo local (`npm run dev`, `npm run lint`, `npm test`, `npm run build`).

### T02: Tokens/CSS y componentes repetidos
- **Tokens visuales**: se alinearon los valores de color, tipografía, espaciado y radios en `tailwind.config.js` y en los archivos CSS globales (`src/index.css`, `src/marketing.css`, `src/pages.css`) conforme a la especificación de diseño de la Sección 3 del plan:
  - Canvas / superficie / texto: `#0b1320` / `#121f31` / `#eaf0f8`.
  - Texto secundario / borde / línea: `#a4b2c6` / `#29394e`.
  - Acento: `#3979ec` (con hover `#2869db`).
  - Sección clara: `#f6f8fb` con texto `#15243a`.
  - Radios: 8px para controles e inputs, 12px para superficies y tarjetas.
  - Tipografía: `Inter` para interfaz general y `JetBrains Mono` reservado para datos técnicos, checksums, timestamps y terminales.
  - Transición de estados interactivos: 180ms con soporte a `prefers-reduced-motion`.
  - Ancho contenedor: 1120px (`max-w-container` / `.section-container`), ancho de lectura de texto máximo 65ch (`max-w-prose`).
- **Verificación**: se verificó visualmente que no existiera regresión ni scroll horizontal a 320px en ninguna ruta. Se generaron capturas de pantalla en resoluciones 320px, 360px, 768px y 1440px para documentar el estado visual.

## Decisiones de arquitectura
- **Baseline de specs**: se estableció la línea de base de los specs de comportamiento en `openspec/specs/` para los dominios landing, downloads y auth. Estos specs describen el comportamiento actual y servirán como fuente de verdad para futuros cambios.
- **Separación de preocupaciones**: las tareas de inventario y reproducibilidad no afectan al código de producción, sino que establecen las condiciones para un desarrollo sano.
- **Consolidación de diseño**: alinear los tokens visuales evita la duplicación y facilita mantenimiento futuro.

## Diagramas (en ASCII)
No se requieren diagramas complejos para este cambio, pero podemos mostrar el flujo de trabajo de T01:

```
[Desarrollador] -> npm run lint -> [ESLint] -> [Advertencias resueltas]
[Desarrollador] -> npm test -> [Vitest/Jest] -> [Tests pasan]
[Desarrollador] -> npm run build -> [Vite + tsc] -> [Build exitoso]
[CI] -> workflow ejecuta lint, test y build -> [Despliegue exitoso]
```

## Conclusión
Las tareas T00, T01 y T02 establecieron la línea de base del proyecto, aseguraron la reproducibilidad y consolidaron el diseño visual. No se requieren cambios adicionales; el trabajo está completo y listo para pasar a la implementación de características (T03 en adelante).