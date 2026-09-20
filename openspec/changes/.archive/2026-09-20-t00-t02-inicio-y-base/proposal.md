# Propuesta: T00-T02 - Inicio, reproducibilidad y tokens/CSS

## ¿Por qué este cambio?
Se necesitaba establecer la línea de base del proyecto, asegurar la reproducibilidad del build y consolidar el diseño visual antes de pasar a la implementación de características especificadas en el plan CISPAR.

## Alcance
- T00: Inventario de repositorios existentes (frontend, backend, desktop, instalador) y fijar la decisión única de arquitectura de auth (Device Authorization Flow - RFC 8628).
- T01: Asegurar la reproducibilidad mediante:
  - Agregar el script `"test": "node tests/platform.test.mjs"` a package.json.
  - Resolver advertencias de ESLint (react-hooks/exhaustive-deps) en AuthModal.tsx y AuthPage.tsx.
  - Actualizar el workflow de GitHub Actions para incluir lint y test antes del build.
  - Corregir el README para describir con precisión el despliegue mediante artifacts de GitHub Actions.
- T02: Consolidar los tokens visuales y los componentes repetidos:
  - Alinear los colores, tipografía, espaciado y radios en tailwind.config.js y los archivos CSS globales (index.css, marketing.css, pages.css) conforme a la especificación de diseño de la Sección 3 del plan.
  - Verificar que no haya regresiones ni scroll horizontal en resoluciones 320px, 360px, 768px y 1440px.
  - Generar capturas de verificación visual.

## No está incluido (non-goals)
- Implementación de características de landing page (Hero, narrativa, etc.) – corresponde a T03.
- Validación de releases y estados de descarga – corresponde a T04.
- Cambios en el backend o en el cliente de escritorio.