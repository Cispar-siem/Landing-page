# CISPAR Security

Estado: especificación activa de producto
Producto: plataforma SaaS de operaciones de ciberseguridad

## Propósito

CISPAR Security busca ayudar a equipos de TI con recursos limitados a tener visibilidad de sus endpoints, identificar señales de riesgo, revisar detecciones con evidencia y organizar respuestas controladas. El MVP propuesto prioriza Windows 11 y Ubuntu Server LTS. El PDF de negocio y el plan técnico de CISPAR Security son la referencia de alcance; el plan describe trabajo futuro, no funciones ya publicadas.

CISPAR no es un agente de programación. Las descripciones de coding agent que aparecen en documentación histórica quedan sustituidas por la decisión D-006 de `docs/DECISIONS.md`.

## Estado y límites

- El producto y el piloto están en desarrollo.
- El landing debe distinguir capacidades propuestas de capacidades disponibles.
- No afirmar servicio SOC 24/7, cobertura equivalente a un EDR maduro, capacidad de respuesta no validada ni disponibilidad de agentes/instaladores sin evidencia real.
- Las respuestas de alto impacto requieren aprobación humana en el alcance propuesto.
- Precios, alcance comercial, SLA, servicio administrado y compatibilidad se mantienen pendientes hasta validación.
- No mezclar binarios placeholder ni instaladores de otros productos con CISPAR Security.

## Landing público

- Debe explicar en lenguaje directo quién usa CISPAR, qué riesgos ayuda a investigar y cómo pasa de una señal a evidencia y decisión.
- El CTA principal debe llevar a una acción funcional, como contacto para piloto.
- Las vistas ilustrativas deben identificarse como conceptuales y no usar datos o métricas que aparenten provenir de clientes.
- Los enlaces a escaneo público solo se ofrecen cuando su API está configurada y disponible para el entorno desplegado.
- Las noticias o incidentes editoriales necesitan fuente y fecha verificables.
- El visitante puede leer el landing sin login.

## Agente, detección e investigación

- El alcance inicial propuesto es telemetría seleccionada de Windows 11 y Ubuntu Server LTS.
- Las detecciones deben ser reproducibles, explicables y vinculadas con evidencia.
- Alertas e incidentes deben permitir entender qué ocurrió, en qué endpoint y por qué se generaron.
- El diseño de respuesta debe limitar las acciones permitidas, dejar auditoría y exigir aprobación humana para impactos mayores.
- Cada sistema operativo y capacidad requiere validación técnica antes de anunciarse como disponible.

## Distribución

- Solo publicar descargas para artefactos reales, validados, firmados y con checksum verificable.
- Si no hay instaladores, mostrarlo con claridad y ofrecer contacto para el piloto; no simular un flujo de instalación.
