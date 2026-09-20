# Pruebas y resultados: T03 - Hero, narrativa, pricing/FAQ y accesibilidad

## Pruebas automatizadas
- **Lint**: `npm run lint`
  - Resultado: 0 errores, 0 advertencias
  - Notas: Las advertencias previas de `react-hooks/exhaustive-deps` en `AuthModal.tsx` y `AuthPage.tsx` fueron resueltas en T01 y siguen sin aparecer.

- **Unit tests**: `npm test` (ejecuta `platform.test.mjs` y `releases.test.mjs`)
  - Resultado: 
    - `platform.test.mjs`: 8 platform detection checks passed.
    - `releases.test.mjs`: 6 release validator checks passed.
  - Notas: Los tests existentes siguen pasando, lo que indica que nuestros cambios no rompieron la funcionalidad de detección de plataforma ni la validación de releases.

- **Build**: `npm run build`
  - Resultado: Compilación exitosa con Vite v5.4.21 en 6.05s, generando bundle en `dist/`.
  - Notas: No hubo errores de TypeScript ni de bundle.

## Pruebas manuales
Verificamos en un navegador local (Chrome) en las siguientes resoluciones:
- 320px (mobile)
- 360px (mobile)
- 768px (tablet)
- 1440px (desktop)

### Hero
- [x] En desktop (≥1024px): disposición asimétrica 45/55 (texto izquierda, ilustración derecha).
- [x] En mobile (<640px): apilado vertical (texto primero, ilustración abajo).
- [x] Título máximo tres líneas en desktop (se mantuvo dentro del límite).
- [x] No hubo scroll horizontal en ninguna resolución.
- [x] Los botones de descarga y contacto tienen tamaño táctil adecuado (≥44x44px) y indicadores de foco visibles.

### IncidentNarrative
- [x] Se muestra la sección con título "Historia de un incidente real" y cuerpo descriptivo.
- [x] Tres subsecciones claramente diferenciadas: Señal, Evidencia, Acción.
- [x] Cada subsección tiene un ícono y texto descriptivo.
- [x] El texto de la nota al final indica explícitamente que CISPAR nunca realiza acciones automáticas de bloqueo o contención.
- [x] El contraste de los colores cumple con WCAG AA (verificado con herramienta de contraste).
- [x] Los elementos son navegables mediante Tab y tienen foco visible.

### InstallationSteps
- [x] Se muestra el título y la descripción breve.
- [x] Lista ordenada de tres pasos:
  1. Descargar el instalador, iniciar sesión cuando se solicite y completar la configuración guiada.
  2. (Los pasos exactos provienen de i18n: `download.step1`, `download.step2`, `download.step3`.)
- [x] Los pasos son claros y accionables.
- [x] El texto de la nota al final aclara que el instalador requiere intervención del usuario para autorización y configuración final.
- [x] El tamaño táctil y foco son adecuados.

### CompatibilityRequirements
- [x] Se muestra el título "Compatibilidad y requisitos" y cuerpo descriptivo.
- [x] Se lista cada sistema operativo soportado (macOS, Windows, Linux) con sus requisitos específicos:
  - macOS: "macOS 10.15 o posterior · Docker Desktop"
  - Windows: "Windows 10/11 · Docker Desktop"
  - Linux: "Docker Engine y Docker Compose"
- [x] Los requisitos se obtuvieron del catálogo de releases embebido (releaseCatalog) y se agruparon por OS para evitar duplicados.
- [x] Se muestra una nota al final indicando que los requisitos pueden variar según la arquitectura específica.
- [x] No se promete "instalar y usar" sin pasos manuales; se es explícito sobre la necesidad de instalar Docker previamente.
- [x] El diseño usa una cuadrícula de tarjetas que es responsive y no causa scroll horizontal.

### PricingSection
- [x] Se muestra el título "Elige el alcance adecuado para tu operación" (de i18n).
- [x] Se muestra el mensaje de placeholder: "El precio y los límites se definen según el entorno, fuentes y requisitos de despliegue. No publicamos cifras que todavía no correspondan al servicio entregado."
- [x] Se muestra un CTA principal "Solicitar acceso" que enlaza a `/contact`.
- [x] No se muestran cifras monetarias, símbolos de moneda o límites de dispositivos (cumple con T05 bloqueado).
- [x] El CTA tiene tamaño táctil adecuado y foco visible.

### FAQ
- [x] Se verificó que el componente existente `Faq` muestra las preguntas y respuestas correctas (de i18n).
- [x] Cada pregunta está dentro de un `<details>` y el título en `<summary>`, lo que es accesible por defecto en navegadores modernos.
- [x] El contenido es legible y tiene suficiente contraste.
- [x] No se modificó el FAQ, pero se confirmó que sigue funcionando correctamente.

### Footer
- [x] Se verificó que el componente existente `Footer` muestra:
  - Marca: CISPAR
  - Enlaces: Descargas, Precios, Contacto
  - Envío de correo de soporte: `soporte@cispar.io`
  - Versión dinámica: año actual (© {new Date().getFullYear()} CISPAR)
  - Los enlaces tienen estados de foco y hover claros.
- [x] Se dejó el componente `WhatsAppContact` después del FAQ en la landing page (no se movió al footer en esta tarea, pero se consideró como un CTA adicional de contacto).
- [x] El WhatsAppContact muestra un botón que abre WhatsApp con un mensaje predefinido y tiene tamaño táctil y foco visible.

### Accesibilidad general
- [x] Se respetó `prefers-reduced-motion`: al activar esta opción en el navegador, las animaciones no esenciales (como los efectos de entrada de los componentes) se redujeron o eliminaron, mientras que los cambios de estado (como foco en botones) permanecieron perceptibles.
- [x] Se verified que no haya elementos que pierdan el foco o que sean inaccesibles mediante teclado.
- [x] Se verified que el contraste de los colores en todos los componentes nuevos cumpla con WCAG AA (usando las paletas definidas en T02: canvas `#0b1320`, superficie `#121f31`, texto `#eaf0f8`, secundario `#a4b2c6`, borde `#29394e`, acento `#3979ec`).
- [x] Se verified que el tamaño de objetivo táctil mínimo sea de 44x44px en todos los botones y enlaces interactivos.

## Resultado general
Todas las pruebas automatizadas pasaron y la verificación manual confirmó que la landing page ahora sigue la composición especificada en el plan:
1. Header
2. Hero (asimétrico 45/55)
3. Historia de un incidente (señal → evidencia → acción)
4. Instalación en tres pasos
5. Compatibilidad, permisos y requisitos reales
6. Precios (placeholder, ya que T05 está bloqueado)
7. FAQ
8. WhatsAppContact (como CTA de contacto adicional)
9. Footer

Los cambios no introdujeron regresiones en funcionalidad existente (lint, tests, build pasaron) y mejoraron la accesibilidad y claridad de la página.

## Próximos pasos
- Actualizar `docs/IMPLEMENTATION-STATUS.md` para marcar T03 como verificado.
- Proceder con T04 (validación de releases, BASE_URL y estados de descarga) para asegurar que la página de descargas muestre correctamente los releases disponibles.