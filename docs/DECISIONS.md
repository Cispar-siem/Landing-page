# Registro de decisiones de CISPAR

Este archivo contiene decisiones que deben mantenerse entre sesiones. Las decisiones nuevas se agregan arriba de las anteriores con fecha y motivo.

## D-004 — 2026-09-20 — Landing sin login obligatorio

Estado: aceptada

El visitante puede leer el landing, incidentes, precios y requisitos sin iniciar sesión. El login se muestra al activar/usar Agent, comprar o administrar la cuenta.

Motivo: reducir fricción y reservar la identidad para operaciones que realmente necesitan autorización.

## D-003 — 2026-09-20 — Agent separado del SIEM

Estado: aceptada

El flujo simple de CISPAR Agent no reutiliza Docker, Docker Desktop, el wizard del SIEM ni sus requisitos. Son productos relacionados, pero tienen instalación y propuesta de valor diferentes.

Motivo: cumplir la promesa “descargar y usar” sin pedir infraestructura local.

## D-002 — 2026-09-20 — Requests de modelos detrás de CISPAR

Estado: aceptada para producción

El cliente no recibe ni usa directamente las API keys de Anthropic, OpenAI, Gemini u otros proveedores. El backend CISPAR autoriza la request, aplica suscripción/crédito/concurrencia y llama al proveedor.

Motivo: poder cobrar, medir costo y revocar acceso.

## D-001 — 2026-09-19 — Device flow para clientes

Estado: aceptada para producción

La producción conserva el flujo de autorización por dispositivo documentado en `docs/AUTH-DECISION.md`. Antes de habilitar clientes debe tener secreto largo, expiración, uso único, sesión revocable y confirmación explícita.

## Decisiones abiertas que bloquean producción

- Precio, moneda, créditos y concurrencia de cada plan.
- Proveedor de pagos definitivo y requisitos fiscales.
- Proveedor/modelo inicial servido por backend.
- Repositorio canónico para backend y cliente empaquetado.
- Política de gracia cuando una suscripción entra en `past_due`.
- Plataformas que tendrán instalador real en la primera release.
