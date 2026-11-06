# Contexto persistente del proyecto

Actualizado: 29 de octubre de 2026
Modo operativo: producto en desarrollo; piloto en preparación

## Qué es este repositorio

Este repositorio contiene el landing React/Vite de CISPAR Security. Presenta el producto, el estado de disponibilidad y el acceso de contacto para el piloto. Solo enlazará instaladores cuando existan paquetes publicados y validados.

## Producto

CISPAR Security es una plataforma SaaS de operaciones de ciberseguridad para visibilidad de endpoints, detecciones verificables, investigación centralizada y respuesta controlada. El MVP propuesto prioriza Windows 11 y Ubuntu Server LTS. El plan técnico describe cómo construir el producto; no significa que las capacidades o los instaladores ya estén disponibles. La decisión vigente D-006 supersede descripciones históricas de coding agent.

## Arquitectura de trabajo

```text
Landing público: React/Vite
Producto objetivo: plataforma SaaS de operaciones de ciberseguridad
Agente endpoint propuesto: Windows 11 y Ubuntu Server LTS
Flujo objetivo: telemetría → detección explicable → investigación → respuesta autorizada
Distribución: instaladores firmados solo después de validación y publicación
```

El plan en `/home/axel/Downloads/plan.md` y el documento técnico `/home/axel/Downloads/claude.md` son planes de implementación de CISPAR Security. No convierten el producto en un agente de programación. La definición vigente del producto está registrada en `docs/DECISIONS.md` (D-006).

## Reglas de comunicación

- Presentar Windows 11 y Ubuntu Server LTS como alcance inicial propuesto, no como disponibilidad descargable.
- No afirmar SOC 24/7, cobertura EDR madura, resultados en vivo o precios publicados sin evidencia y decisión aprobada.
- Mantener el landing público y sin login obligatorio.
- No ofrecer instaladores placeholder ni paquetes de otros repositorios.

## Estado técnico confirmado

- Landing: `/home/axel/Landing-page`.
- Los repositorios de licencias y coding existentes no acreditan capacidades del producto CISPAR Security.
- Cliente terminal: `/home/axel/cispar-terminal` y `/home/axel/cispar-terminal-claude`; estos repositorios de coding no definen CISPAR Security.

## Prioridad actual de producto

1. Validar alcance de arquitectura y detección por sistema operativo.
2. Construir identidad, telemetría, ingesta y aislamiento entre clientes.
3. Probar reglas, alertas, evidencia e investigación con escenarios reproducibles.
4. Implementar respuestas autorizadas, límites y auditoría.
5. Preparar piloto y releases firmadas solo después de validar la operación.
6. Definir modelo comercial y cualquier servicio SOC administrado.
7. Mantener la web alineada con capacidades verificadas.

## Estándar de producción

“Listo” significa desplegado en staging y producción, probado con credenciales reales o sandbox documentado, con rollback, backups, monitoreo, soporte y responsables definidos. Una tarea no se considera lista porque compile localmente.
