# CISPAR Landing — plan de trabajo

## Objetivo

Conservar la estética tecnológica de CISPAR y convertir la landing en una entrada funcional para entender el producto, elegir una descarga, pedir una propuesta y autorizar una instalación.

## Arquitectura acordada

- La landing se despliega como sitio estático.
- El wizard, instaladores y artefactos se originan en `cispar-siem-mono`.
- La landing consume un manifiesto de releases; no duplica ni fabrica binarios.
- El SIEM y su backend se ejecutan en el entorno del cliente.
- Usuarios y licencias continúan en Supabase; la API de licencias se define como despliegue independiente.

## Fases

### Fase 1 — base visual y navegación

- Rutas: inicio, descargas, pricing, contacto y auth.
- Conservar estética dark/tech, gradientes discretos, terminal y señalización de seguridad.
- Sustituir texto de plantilla o claims no verificables por mensajes de producto controlados.

### Fase 2 — experiencia comercial y wizard

- Selector de macOS, Windows y Linux.
- Detección de plataforma como sugerencia, nunca como única opción.
- Estados de release: disponible, versión, URL, SHA-256 y requisitos.
- Pricing con alcance comercial real y contacto para Enterprise.
- Formulario de contacto con demo, cotización e instalación.

### Fase 3 — localización y calidad

- Textos con claves semánticas TypeScript, por ejemplo `landing.hero.title`.
- ES y EN iniciales; se agrega un idioma creando otro diccionario TypeScript.
- Selector persistente de idioma.
- Manifest de releases configurable mediante `VITE_RELEASE_MANIFEST_URL`.
- Build y lint en cada cambio.

### Fase 4 — integración con monorepo

- CI de `cispar-siem-mono` genera instaladores reales por plataforma.
- CI calcula SHA-256 y publica `releases.json`.
- Solo los artefactos con checksum y URL válidos se marcan como disponibles.
- Pruebas reales en macOS Intel/Apple Silicon, Windows x64, Linux x64 y ARM64.

## Criterios antes de activar una descarga

- Binario real, firmado donde aplique y no un placeholder.
- URL pública de release estable.
- SHA-256 generado por CI.
- Requisitos de Docker específicos por plataforma.
- Prueba de instalación y health check de la versión publicada.

## Pendientes de negocio

- Precio, moneda y unidad de cobro.
- Qué incluye Starter y Enterprise.
- Dominio final de ventas y soporte.
- Política de privacidad, términos y soporte.
- Nombre definitivo del producto si cambia CISPAR SIEM / CISPAR SOC.
