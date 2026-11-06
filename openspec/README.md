# OpenSpec de CISPAR Security Landing

Este directorio contiene las reglas y requisitos que deben leer las IAs antes de implementar cambios. La especificación busca convertir decisiones de producto en requisitos comprobables, no reemplazar el código ni el seguimiento de tareas.

## Orden de lectura

- `../AGENTS.md`: reglas persistentes del repositorio.
- `specs/cispar-agent/spec.md`: comportamiento obligatorio del producto.
- `../docs/PROJECT-CONTEXT.md`: contexto actual y límites del alcance.
- `../docs/DECISIONS.md`: decisiones fijadas y decisiones abiertas.
- `../docs/IMPLEMENTATION-STATUS.md`: avance real, pruebas y bloqueos.
- `changes/README.md`: cómo proponer un cambio que todavía no está aprobado.

## Regla de implementación

Una tarea está terminada cuando tiene código, pruebas apropiadas, criterios de aceptación comprobados y actualización del estado. Un documento no demuestra que una integración esté funcionando.

## Alcance actual

El alcance actual es el landing público y CISPAR Security, una plataforma SaaS de operaciones de ciberseguridad/SOC. El agente y las capacidades de detección descritos en el plan son trabajo por construir; no asumir que hay instaladores o funciones publicados. La decisión vigente D-006 supersede descripciones históricas de coding agent.
