# Contexto persistente del proyecto

Actualizado: 20 de septiembre de 2026
Modo operativo: startup en producción

## Qué es este repositorio

Este repositorio contiene el landing React/Vite de CISPAR. Presenta el producto, permite conocer incidentes de seguridad, muestra precios y distribuye enlaces a instaladores publicados.

## Productos relacionados

### CISPAR Agent

Agente de coding descargable, inspirado en el flujo de herramientas como Claude Code. Es un producto comercial de producción que debe seguir el flujo “descargar, abrir, iniciar sesión en navegador y usar”. Su consumo se controla desde el backend CISPAR.

### CISPAR SIEM

Producto distinto, con gateway, Docker y requisitos operativos más pesados. Sus documentos o instaladores no deben mezclarse con el flujo simple del Agent sin una decisión explícita.

## Arquitectura de trabajo

```text
Landing público: React/Vite
Auth e identidad: Supabase Auth
Datos de cuenta: Supabase Postgres
API de licencia, suscripción y requests: backend CISPAR
Proveedor de modelos: llamado desde backend con credenciales privadas
Instaladores: releases por plataforma
Pagos: Stripe candidato inicial, pendiente de configuración comercial
```

## Reglas de acceso

- El landing público no exige login.
- Login se solicita para activar una instalación, usar Agent, comprar o administrar la cuenta.
- La suscripción no se valida solo en la UI; cada request protegida pasa por backend.
- El archivo descargado no contiene claves de proveedores.
- El usuario final no debe instalar Docker, Node, Python ni editar configuración para usar el flujo base.

## Estado técnico confirmado

- Landing: `/home/axel/Landing-page`.
- License server: `/home/axel/cispar-ia-backend/cispar-license-server`.
- Cliente terminal: `/home/axel/cispar-terminal` y `/home/axel/cispar-terminal-claude`.
- El license server actual tiene device flow, customers, JWT y Supabase, pero todavía necesita entitlement, Stripe, metering, revocación robusta y conexión con el cliente Agent.
- Los clientes terminal revisados todavía usan API keys del usuario y no están sujetos a la suscripción CISPAR.

## Prioridad actual de producción

1. Separar claramente Agent de SIEM.
2. Definir el repo canónico de backend y cliente.
3. Endurecer device flow y sesión antes de dar acceso a clientes.
4. Conectar el cliente a la API CISPAR con observabilidad y límites.
5. Activar entitlement, créditos, concurrencia y billing reales.
6. Publicar releases firmadas y soporte de actualización/rollback.
7. Mantener el landing y la sección editorial con contenido verificable.

## Estándar de producción

“Listo” significa desplegado en staging y producción, probado con credenciales reales o sandbox documentado, con rollback, backups, monitoreo, soporte y responsables definidos. Una tarea no se considera lista porque compile localmente.
