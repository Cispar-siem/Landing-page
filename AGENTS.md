# Instrucciones persistentes para agentes

Antes de modificar este repositorio, leer en este orden:

1. `openspec/README.md`
2. `openspec/specs/cispar-agent/spec.md`
3. `docs/PROJECT-CONTEXT.md`
4. `docs/IMPLEMENTATION-STATUS.md`
5. `docs/AUTH-DECISION.md` cuando la tarea toque login, dispositivo o sesión.
6. El documento específico dentro de `docs/business/` cuando la tarea toque pricing, pagos, marketing o ventas.

## Reglas del proyecto

- Preservar cambios existentes y revisar `git status` antes de editar.
- CISPAR Agent y CISPAR SIEM son productos relacionados, pero no deben mezclarse en el landing ni en el instalador del agente.
- El flujo del usuario debe ser: descargar, abrir, login en navegador y usar. El usuario final no instala Docker, Node, Python, modelos ni configura API keys para el flujo base.
- El landing es público. El login solo aparece para activar una instalación, usar el agente, comprar o administrar la cuenta.
- El backend es la autoridad para suscripción, entitlement, límites, dispositivos y consumo. El frontend y el binario no autorizan por sí mismos.
- No inventar clientes, incidentes, métricas, certificaciones, precios, integraciones ni fuentes de noticias.
- No integrar credenciales, cookies o suscripciones de Claude, Cursor, Antigravity u otros productos de terceros como mecanismo comercial de CISPAR. Usar APIs/OAuth oficiales y aprobados si en el futuro se añade un conector.
- Ejecutar las validaciones que correspondan a la tarea y actualizar `docs/IMPLEMENTATION-STATUS.md` con evidencia real.
- Si hay una decisión comercial pendiente, documentarla como pendiente y avanzar con tareas independientes; no sustituirla por una suposición silenciosa.

## Fuente de verdad

Cuando dos documentos difieran, la prioridad es:

1. Decisión explícita más reciente en `docs/DECISIONS.md`.
2. `openspec/specs/cispar-agent/spec.md`.
3. `docs/PROJECT-CONTEXT.md`.
4. El plan operativo y documentos históricos.

Toda decisión nueva debe entrar primero en `docs/DECISIONS.md` o en la spec correspondiente.
