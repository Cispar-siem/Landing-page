# Propuesta: T03 - Hero, narrativa, pricing/FAQ y accesibilidad

## ¿Por qué este cambio?
La composición de la landing page definida en el plan CISPAR (Sección 3) requiere secciones específicas que actualmente no están presentes o están implementadas parcialmente. Este cambio busca alinear la landing page con la composición especificada para mejorar la comunicación del valor del producto, guiar al usuario hacia la instalación y cumplir con estándares de accesibilidad.

## Alcance
- Modificar el componente `LandingPage` en `src/App.tsx` para seguir el orden de composición especificado:
  1. Header (existente)
  2. Hero (existente, pero verificar ajustes)
  3. Nueva sección: Historia de un incidente (señal → evidencia → acción)
  4. Nueva sección: Instalación en tres pasos
  5. Nueva sección: Compatibilidad, permisos y requisitos reales
  6. Nueva sección: Precios (placeholder, ya que T05 está bloqueado por decisiones comerciales)
  7. FAQ (existente, verificar accesibilidad)
  8. Footer (existente, verificar enlaces legales y versión)
- Crear nuevos componentes React para cada una de las nuevas secciones.
- Asegurar que el Hero cumpla con la disposición asimétrica 45/55 y el titular máximo tres líneas.
- Asegurar que se respeten los tokens visuales y de espaciamiento definidos en T02.
- Verificar y mejorar la accesibilidad de toda la landing page (teclado, foco visible, anuncios de error, movimiento reducido).
- No modificar el comportamiento de autenticación o descarga (esos corresponden a T07, T08, T09, T10, T11).

## No está incluido (non-goals)
- Implementación de precios reales (T05 bloqueado por decisiones comerciales).
- Cambios en el flujo de autenticación web o de dispositivo (T07 y T08).
- Cambios en la validación de releases o estados de descarga (T04, ya implementado parcialmente pero será verificado en T04).
- Cambios en el backend o en el cliente de escritorio.
- Añadir nuevas dependencias externas.