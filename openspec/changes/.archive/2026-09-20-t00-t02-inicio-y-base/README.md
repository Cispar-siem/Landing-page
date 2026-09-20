# T00-T02: Inicio, reproducibilidad y tokens/CSS

**Status**: archived  
**Owner**: Team Lead (you)  
**Started**: 2026-09-19  
**Domains affected**: none (baseline setup and chores)

## What
Este cambio folder documenta el trabajo realizado en las tareas T00, T01 y T02 del plan CISPAR:
- T00: Inventario de repositorios y decisión de arquitectura de auth (Device Authorization Flow).
- T01: Reproducibilidad (scripts de package, lint, workflow y README).
- T02: Tokens visuales y componentes repetidos (consolidación de Tailwind y CSS).

No se modificaron los specs de comportamiento (los specs de landing, downloads y auth se establecieron como línea de base en T02).

## Why
Se necesitaba establecer la línea de base del proyecto, asegurar la reproducibilidad del build y consolidar el diseño visual antes de pasar a la implementación de características especificadas en el plan.

## How to verify
- Los specs de línea de base están en `openspec/specs/landing/spec.md`, `openspec/specs/downloads/spec.md` y `openspec/specs/auth/spec.md`.
- El inventario y la decisión de auth están documentados en `docs/AUTH-DECISION.md` y en la sección T00 de `docs/IMPLEMENTATION-STATUS.md`.
- La reproducibilidad está verificada en la sección T01 de `docs/IMPLEMENTATION-STATUS.md` (scripts alineados, lint limpio, tests integrados).
- La consolidación de tokens y CSS está verificada en la sección T02 de `docs/IMPLEMENTATION-STATUS.md` (tokens visuales consolidados, sin regresiones en todas las rutas).

## Files
- `README.md` — este archivo
- `proposal.md` — razonamiento y alcance
- `design.md` — decisiones técnicas y de arquitectura
- `tasks.md` — checklist de implementation (marcado como completado)
- `tests.md` — plan de pruebas y resultados
- `specs/` — directorio vacío (no hay cambios en los specs de comportamiento para T00-T02)

## Status of artifacts
- [x] proposal
- [x] design
- [x] tasks
- [x] tests
- [ ] specs (no hay cambios de comportamiento)