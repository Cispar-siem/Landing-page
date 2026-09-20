# T03: Hero, narrativa, pricing/FAQ y accesibilidad

**Status**: in-progress  
**Owner**: Team Lead (you)  
**Started**: 2026-09-20  
**Domains affected**: landing, downloads, auth

## What
Implementar las secciones de landing page especificadas en la composición del plan:
- Hero asimétrico 45/55 con promesa concreta y captura ilustrativa
- Historia de un incidente: señal → evidencia → acción
- Instalación en tres pasos: descargar, acceder en navegador, configurar
- Compatibilidad, permisos y requisitos reales
- Sección de precios (placeholder, ya que T05 está bloqueado)
- FAQ y footer existentes (verificar accesibilidad)
- Mejoras de accesibilidad generales (teclado, foco, movimiento reducido, WCAG AA)

## Why
El plan CISPAR especifica una composición visual concreta para la landing page que debe seguir para transmitir el valor del producto y guiar al usuario hacia la descarga y la instalación. Actualmente, la landing page tiene componentes adicionales (TechnologyShowcase, ProductOverview) que no forman parte de la composición especificada y carece de algunas secciones clave como la narrativa de incidente y la instalación en tres pasos.

## How to verify
- Ejecutar `npm run lint && npm test && npm run build` y verificar que no haya errores.
- Verificar visualmente en resoluciones 320px, 360px, 768px y 1440px que no haya scroll horizontal y que la composición siga el orden especificado.
- Verificar que el hero tenga una disposición asimétrica 45/55 en desktop y apilado en mobile.
- Verificar que la narrativa de incidente siga el patrón señal → evidencia → acción con datos realistas.
- Verificar que la sección de instalación muestre claramente los tres pasos.
- Verificar que la sección de precios no muestre cifras concretas (placeholder) y tenga un CTA para contactar.
- Verificar que el FAQ y el footer sean accesibles y tengan los enlaces legales.
- Verificar que se respete `prefers-reduced-motion` para animaciones.
- Verificar que los elementos interactivos tengan un tamaño mínimo de 44x44px táctil.

## Files
- `proposal.md` — razonamiento y alcance
- `design.md` — decisiones técnicas y de arquitectura
- `tasks.md` — checklist de implementation
- `tests.md` — plan de pruebas y resultados
- `specs/landing/spec.md` — delta specs (ya creado en la fase de bootstrap)
- `specs/downloads/spec.md` — delta specs (ya creado)
- `specs/auth/spec.md` — delta specs (ya creado)

## Status of artifacts
- [x] proposal
- [x] design
- [ ] tasks (en progreso)
- [ ] tests
- [x] specs (landing, downloads, auth)