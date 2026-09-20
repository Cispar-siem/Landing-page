# Tareas de implementación: T03 - Hero, narrativa, pricing/FAQ y accesibilidad

## Preparación
- [x] Leer specs existentes (landing, downloads, auth) para entender el comportamiento esperado.
- [x] Revisar los componentes existentes: Hero, TechnologyShowcase, ProductOverview, Faq, Footer, DownloadButton, etc.
- [x] Verificar los tokens visuales y de espaciado en tailwind.config.js y CSS globales.

## Creación de nuevos componentes
### IncidentNarrative
- [x] Crear archivo `src/components/sections/IncidentNarrative.tsx`
- [x] Implementar estructura con tres subsecciones: Señal, Evidencia, Acción.
- [x] Usar claves de i18n existentes o agregar nuevas en `src/i18n/landing.ts` y `src/i18n/I18nContext.tsx` si es necesario.
- [x] Aplicar estilos de Tailwind conforme al diseño (colores, espaciado, tipografía).
- [x] Verificar que el texto sea claro y no prometa acciones automáticas.

### InstallationSteps
- [x] Crear archivo `src/components/sections/InstallationSteps.tsx`
- [x] Implementar título y lista ordenada de tres pasos.
- [x] Reutilizar las claves de i18n de los pasos de descarga (`download.step1`, `download.step2`, `download.step3`) o crear nuevas si se prefiere.
- [x] Aplicar estilos de Tailwind (lista con numeración clara, espaciado).
- [x] Verificar que los pasos sean accionables y claros.

### CompatibilityRequirements
- [x] Crear archivo `src/components/sections/CompatibilityRequirements.tsx`
- [x] Mostrar sistemas operativos soportados (macOS, Windows, Linux) con texto o íconos.
- [x] Aclarar que en macOS el usuario debe verificar la arquitectura (Apple vs Intel).
- [x] Mostrar requisitos reales (extraer de `requirements` del release o usar los embebidos si no hay manifest).
- [x] Evitar frases como "instalar y usar" si hay pasos manuales ocultos; ser explícito sobre lo que se requiere (ej. "Requiere instalación previa de Docker").
- [x] Aplicar estilos de Tailwind (lista de íconos y texto, o tarjetas).
- [x] Usar el catálogo de releases embebido para mostrar los requisitos específicos por OS.

### PricingSection
- [x] Crear archivo `src/components/sections/PricingSection.tsx`
- [x] Mostrar mensaje de placeholder (ya que T05 está bloqueado): "El precio y los límites se definen según el entorno, fuentes y requisitos de despliegue. No publicamos cifras que todavía no correspondan al servicio entregado."
- [x] Añadir CTA principal que enlazé a `/contact` o abra el modal de contacto.
- [x] Aplicar estilos similares a los cards de precios existentes pero sin mostrar precios.
- [x] Verificar que no haya cifras monetarias, símbolos de moneda o límites de dispositivos.

## Modificación de App.tsx (LandingPage)
- [x] Actualizar el componente `LandingPage` en `src/App.tsx` para seguir el orden de composición:
  1. Header (mantener)
  2. Hero (mantener, pero verificar ajustes)
  3. IncidentNarrative (nuevo)
  4. InstallationSteps (nuevo)
  5. CompatibilityRequirements (nuevo)
  6. PricingSection (nuevo)
  7. Faq (existente)
  8. WhatsAppContact (existente, dejarlo después del FAQ)
  9. Footer (mantener)
- [x] Eliminar los componentes `TechnologyShowcase` y `ProductOverview` del `LandingPage` (se pueden reutilizar en otras páginas si se desea, pero no en la landing page principal según la composición).
- [x] Verificar que el Hero siga teniendo la disposición asimétrica 45/55 (usando clases de flexbox o grid de Tailwind).
- [x] Verificar que el título del Hero no exceda tres líneas en desktop (usaremos clases de Tailwind para limitar líneas o confiar en el diseño).
- [x] Asegurarse de que no haya scroll horizontal en ninguna resolución.

## Accesibilidad
### General
- [x] Verificar que todos los componentes nuevos usen elementos semánticos de HTML (section, header, h1-h3, p, ul/ol, li, button, a).
- [x] Asegurarse de que los elementos interactivos (botones, enlaces) tengan un tamaño mínimo de 44x44px táctil (usaremos padding adecuado).
- [x] Añadir indicadores de foco visibles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-current focus-visible:ring-accent` o similar).
- [x] Respetar `prefers-reduced-motion`: para animaciones no esenciales, usar clases de Tailwind como `motion-reduce:animate-none` or equivalentemente, usar una clase personalizada que desactive animaciones cuando la media query esté activa.
- [x] Verificar contraste de colores usando las definiciones de T02 (ya verificadas en T02, pero confirmar en el contexto de los nuevos componentes).

### FAQ
- [x] Verificar que el componente `Faq` ya existente tenga:
  - Cada pregunta en un `<details>` y respuesta en `<summary>` y `<p>`.
  - Los íconos de expansión (actualmente usamos un `<span>+</span>`) sean accesibles o considerar usar el símbolo predeterminado.
  - Asegurarse de que el contenido sea legible y tenga suficiente contraste.

### Footer
- [x] Verificar que el componente `Footer` ya existente tenga:
  - Enlaces legales (privacidad, términos) si existen o añadirlos si faltan.
  - Envío de correo de soporte (`soporte@cispar.io`).
  - Versión dinámica basada en el año actual.
  - Opcional: añadir el botón de WhatsApp al footer para ofrecer múltiples vías de contacto.
  - Asegurarse de que los enlaces tengan estados de foco y hover claros.
  - [ ] Añadir el botón de WhatsApp al footer (opcional, lo dejamos en la landing page por ahora).

### Otros componentes existentes (Hero, DownloadButton, etc.)
- [x] Verificar que el `Hero` tenga:
  - El título marcado con `id="hero-title"` y etiquetado con `aria-labelledby`.
  - La ilustración del producto tenga `role="img"` y una `aria-label` descriptiva.
  - Los botones de descarga y contacto tengan texto claro y tamaño táctil adecuado.
- [x] Verificar que el `DownloadButton` y otros botones tengan indicadores de foco y tamaño táctil.

## Pruebas locales
- [x] Ejecutar `npm run lint` y corregir cualquier error o advertencia.
- [x] Ejecutar `npm test` (que incluye `platform.test.mjs` y `releases.test.mjs`) y verificar que pasen.
- [x] Ejecutar `npm run build` y asegurarse de que no haya errores de producción.
- [x] Verificar manualmente en el navegador en resoluciones 320px, 360px, 768px y 1440px:
  - [x] No haya scroll horizontal.
  - [x] El Hero se vea asimétrico 45/55 en desktop y apilado en mobile.
  - [x] La narrativa de incidente siga el patrón señal → evidencia → acción.
  - [x] Los pasos de instalación sean claros y en orden.
  - [x] La sección de compatibilidad muestre los sistemas y requisitos reales.
  - [x] La sección de precios muestre el placeholder y el CTA.
  - [x] El FAQ y footer sean legibles y tengas los enlaces correctos.
  - [x] Los elementos interactivos tengan tamaño táctil mínimo y foco visible.
  - [x] Al activar `prefers-reduced-motion` en el navegador, las animaciones no esenciales se reduzcan o eliminen.

## Actualización de documentación
- [ ] Actualizar `docs/IMPLEMENTATION-STATUS.md` al completar la tarea (marcar como verificado).
- [x] Actualizar este `tasks.md` marcando las tareas como completadas a medida que avanzamos.
- [ ] No generar documentos paralelos extensos; mantener el plan como referencia.

## Dependencias
- Esta tarea depende de T01 (reproducibilidad) y T02 (tokens/CSS) ya verificadas.
- No depende de T04 o T05, pero sí afecta a la landing page que usará los manifests de releases (que serán validados en T04).
- T05 permanece bloqueado por decisiones comerciales, por lo que la sección de precios será un placeholder.

## Próximos pasos después de T03
- T04: Validación de releases, BASE_URL y estados de descarga (ya parcialmente implementado, pero se verificará y completará).
- T05: Catálogo comercial y selección de proveedor (bloqueado, esperando decisiones del propietario).
- T06: Migraciones mínimas, autorización y aislamiento (backend).
- Etc.