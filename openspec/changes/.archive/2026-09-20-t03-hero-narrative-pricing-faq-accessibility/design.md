# Diseño: T03 - Hero, narrativa, pricing/FAQ y accesibilidad

## Enfoque técnico
Crearemos nuevos componentes funcionales de React para cada sección requerida y los komponemos en `src/App.tsx` dentro del componente `LandingPage`. Cada nuevo componente será aislado, reutilizable y seguirá los mismos patrones que los componentes existentes (uso de `useI18n`, clases de Tailwind para estilo, etc.).

### 1. Historia de un incidente (IncidentNarrative)
- **Ubicación**: `src/components/sections/IncidentNarrative.tsx`
- **Estructura**:
  - Contenedor con clase de sección estándar.
  - Tres subsecciones: Señal, Evidencia, Acción.
  - Cada subsección tendrá un ícono (opcional) y texto descriptivo.
  - Los tomaremos de las claves de i18n existentes o crearíamos nuevas si es necesario.
  - Usaremos los colores de acento y texto secundario para destacar.
  - No prometemos acciones automáticas; el texto será explícito sobre los límites de autonomía.

### 2. Instalación en tres pasos (InstallationSteps)
- **Ubicación**: `src/components/sections/InstallationSteps.tsx`
- **Estructura**:
  - Contenedor con título y descripción breve.
  - Lista ordenada de tres pasos.
  - Cada paso será un `<li>` con texto de i18n.
  - Usaremos iconos numéricos (1., 2., 3.) o círculos numerados para claridad.
  - El texto será obtenido de las claves de i18n que ya existen en el DownloadPage (pasos 1, 2, 3) o definiremos nuevas si es necesario para reutilizar.

### 3. Compatibilidad, permisos y requisitos reales (CompatibilityRequirements)
- **Ubicación**: `src/components/sections/CompatibilityRequirements.tsx`
- **Estructura**:
  - Contenedor con título.
  - Lista de elementos (sistemas operativos, arquitecturas, requisitos).
  - Cada elemento tendrá un ícono y texto.
  - Para sistemas operativos: mostraremos los logos de macOS, Windows, Linux (o texto).
  - Para arquitectura: aclararemos que en Mac el usuario debe verificar si es Apple o Intel.
  - Para requisitos: mostraremos las cadenas exactas de `requirements` del manifest (o las versiones embebidas si no hay manifest).
  - Evitaremos prometer "instalar y usar" si hay pasos manuales ocultos (como instalar Docker). Seremos explícitos sobre lo que se requiere.

### 4. Precios (PricingSection)
- **Ubicación**: `src/components/sections/PricingSection.tsx`
- **Estructura**:
  - Contenedor con título y mensaje de placeholder (ya que T05 está bloqueado).
  - El mensaje será: "El precio y los límites se definen según el entorno, fuentes y requisitos de despliegue. No publicamos cifras que todavía no correspondan al servicio entregado."
  - Un CTA principal que enlace a la página de contacto (`/contact`) o que abra el modal de contacto.
  - Usaremos el mismo estilo de los cards de precios existentes pero sin mostrar cifras.

### 5. FAQ y Footer
- Ya existen los componentes `Faq` y `Footer`. Los verificaremos para:
  - Asegurar que el FAQ tenga las preguntas y respuestas correctas (usaremos las claves de i18n existentes).
  - Asegurar que el footer tenga los enlaces legales (privacidad, términos), soporte, y versión dinámica.
  - Añadir el botón de WhatsApp al footer si se decide (opcional, pero lo incluiremos en el diseño para no romper la experiencia actual).

### 6. Accesibilidad general
- **Teclado**: asegurarnos de que todos los elementos interactivos sean navegables mediante Tab y que tengan indicadores de foco visibles.
- **Foco visible**: usaremos `outline-none` y luego `focus-visible` o `focus:ring-2` de Tailwind para un foco claro.
- **Anuncios de error**: en formularios (como el de contacto o auth) usaremos `aria-live="polite"` o `role="alert"` para mensajes de validación.
- **Movement reduction**: respetaremos `prefers-reduced-motion` utilizando la media query en CSS o en JavaScript para desactivar animaciones no esenciales.
- **WCAG AA de contraste**: ya hemos definido los colores en T02 que cumplen con contraste AA (verificaremos con herramientas).
- **Tamaño táctil mínimo**: aseguraremos que los botones y enlaces tengan al menos 44x44px de área táctil (usaremos `px-6 py-3` mínimos o equivalente).

### Archivos de estilo
- No se necesitan nuevos archivos de CSS; usaremos las clases de Tailwind ya definidas en `tailwind.config.js` y los archivos CSS globales (`index.css`, `marketing.css`, `pages.css`).
- Si se requiere un ajuste específico para un componente, lo haremos en línea o en el propio componente usando `className` de Tailwind.

## Decisiones de arquitectura
- **Reutilización de i18n**: aprovecharemos las claves existentes en `src/i18n/landing.ts` y `src/i18n/I18nContext.tsx` para evitar duplicar texto.
- **Componentes aislados**: cada nueva sección será un componente funcional independiente que recibirá ninguna propiedad (o solo las necesarias para i18n) y será fácil de testear unitariamente (aunque no escribiremos tests unitarios en esta tarea, sí documentaremos en `tests.md` cómo se podrían testear).
- **Sin estado global**: estas secciones son estáticas y no requieren estado de React (excepto posiblemente para manejar el estado de carga de releases en la sección de compatibilidad, pero optaremos por usar la versión embebida para simplificar y evitar dependencias de datos asíncronos en la landing page principal).
- **Mantenibilidad**: los componentes estarán en `src/components/sections/` para mantener la estructura existente.

## Diagramas (en ASCII)
No se requieren diagramas complejos para este cambio, pero podemos mostrar la composición de la landing page:

```
LandingPage
├── Header (existente)
├── Hero (existente, con posible ajuste de layout)
├── IncidentNarrative (nuevo)
├── InstallationSteps (nuevo)
├── CompatibilityRequirements (nuevo)
├── PricingSection (nuevo)
├── Faq (existente)
├── WhatsAppContact (existente, se mantiene después del FAQ o se mueve al footer)
└── Footer (existente, con posible adición de WhatsApp)
```

## Contraplan
Si se descubre que alguna sección requiere datos asíncronos (por ejemplo, para mostrar las versiones reales de las releases en la sección de compatibilidad), podemos:
- Usar el hook `useEffect` para cargar el catálogo de releases y almacenarlo en estado local.
- Mostrar un esqueleto de carga mientras se obtienen los datos.
- Tener en cuenta que esto podría afectar el rendimiento de la landing page y considerar si es aceptable mostrar datos estáticos (las versiones embebidas) y dejar la validación dinámica para la página de descargas.

## Conclusión
Este diseño cumple con la composición especificada en el plan, mantiene la reutilización de código y patrones existentes, y mejora la accesibilidad sin introducir complejidad innecesaria.