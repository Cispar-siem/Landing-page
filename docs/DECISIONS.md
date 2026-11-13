# Registro de decisiones de CISPAR

Este archivo contiene decisiones que deben mantenerse entre sesiones. Las decisiones nuevas se agregan arriba de las anteriores con fecha y motivo.

## D-013 — 2026-11-13 — Flujo de ramas y objetivo de hosting

El flujo de promoción de frontend y backend es `feature/* → app → stage → main`. Los PR hacia `stage` solo pueden venir de `app`; los PR hacia `main` solo pueden venir de `stage`. Los hallazgos de seguridad bloqueantes deben resolverse antes de promover. No crear vulnerabilidades reales en una rama que pueda desplegarse; los fixtures para validar scanners se aíslan y nunca se publican.

El objetivo solicitado para la landing estática es Firebase Hosting en GCP. AWS queda como candidato para el backend del piloto, sujeto a confirmar la elegibilidad de la cuenta, el costo dentro/fuera de créditos y una arquitectura mTLS que el código soporte. El proveedor actual del backend y la publicación actual de la landing no se consideran migrados por esta decisión; no se despliega nada hasta validar sus contratos, configuración y presupuesto.

Motivo: el fundador pidió explícitamente una promoción `app → stage → main`, priorizar cuotas gratuitas y trabajar los pipelines de Landing-page y Cispar-ISOC. Esta decisión sustituye la promoción directa a `main` de D-011 para los siguientes cambios y fija el destino objetivo sin afirmar que los servicios cloud ya estén configurados.

## D-012 — 2026-11-13 — CISPAR se presenta como producto SaaS autogestionado

CISPAR ofrece software de ciberseguridad SaaS para que cada cliente gestione desde su propia plataforma los equipos inscritos, las alertas, las investigaciones y las acciones autorizadas. CISPAR opera el SaaS; el equipo del cliente usa el producto para administrar su seguridad. La propuesta no es consultoría 1:1 ni un servicio humano de monitoreo o respuesta.

La plataforma y sus capacidades están en preparación; no se debe dar a entender que el SaaS o sus agentes ya están disponibles. Por ahora, el único flujo público operativo es el Quick Scan de fuentes públicas del dominio. Las acciones de marketing invitan a conocer o solicitar información del piloto SaaS; no prometen que CISPAR revise manualmente los hallazgos o gestione la seguridad del cliente.

Motivo: el fundador aclaró que CISPAR busca vender un SaaS autogestionado, no ayudar a cada cliente de forma individual. Esta decisión ajusta la voz y el recorrido comercial descritos en D-006 y D-009 sin alterar la disponibilidad real.

## D-011 — 2026-11-05 — Validación local y paquetes Ubuntu, Arch, macOS y Windows

El fundador solicita preparar PRs hacia main y terminar paquetes reales para Ubuntu y Arch Linux, macOS y Windows. Primero se validará todo el recorrido en un laboratorio local sin aprovisionar servicios cloud de pago. El cliente final debe descargar, abrir, autorizar y quedar conectado sin instalar Docker, Node o Python. Docker/Moto y las máquinas virtuales son herramientas del laboratorio del desarrollador.

Se amplía el backlog de empaquetado a macOS y Arch; esto no acredita soporte o binarios disponibles hoy. El plan ejecutable y las puertas de aceptación están en `docs/NATIVE-PACKAGES-PLAN.md`. La firma de desarrollo local se distingue de la firma y notarización de distribución pública.

## D-010 — 2026-10-30 — Hero editorial e ilustración de negocio

A petición del fundador y con crítica explícita de Astra, se retira la consola conceptual de alertas del hero. Se sustituye por ilustración propia de equipos, cuentas y dominio, con selector accesible y transiciones finitas, sin eventos falsos ni monitoreo simulado. Se mantiene la marca Centinela, grafito y marfil.

El hero distingue alcance previsto de equipos/cuentas del chequeo público de dominio disponible. La acción principal dice revisar dominio y el Quick Scan sucede al hero. Las estadísticas verificadas se conservan más abajo por instrucción previa del fundador, después de la prueba tangible.

Referencias visuales revisadas en navegador: páginas oficiales Sublime y runZero. Se toma claridad de categoría y acción, no sus colores, video, partículas o estética. No se agrega video que aparente ser una grabación del producto.

## D-009 — 2026-10-29 — Riesgo explicado con evidencia

El Quick Scan comunica consecuencias de negocio y facilita pedir revisión a CISPAR. Distingue errores de configuración sustentados por la respuesta, riesgos que requieren validación, mejoras de protección y exposición histórica. No convierte ausencia CAA/DNSSEC en vulnerabilidad confirmada ni afirma que no contratar CISPAR cause un incidente. La urgencia se fundamenta en la configuración encontrada, no en cifras infladas.

El informe descargable debe conservar esta clasificación y el posible impacto. Las fechas CT `not_before` representan inicio de validez y se conservan como campo de evidencia; no se denominan fecha de registro. Los resultados equivalentes se deduplican.

## D-008 — 2026-10-29 — Quick Scan de exposición pública

Por confirmación explícita del fundador, el Quick Scan solicita nombre, correo, teléfono y dominio antes de evaluar fuentes públicas. La empresa se solicita como contexto opcional. Los datos personales preparan una solicitud comercial revisable; no se consultan ni se transmiten a fuentes de riesgo. No se afirma que un teléfono, nombre o buzón esté filtrado sin fuente verificable.

Se amplía D-007: seis comprobaciones públicas mediante DNS y Certificate Transparency; endpoint propio `/api/quick-scan` con proveedores de destino fijos, límites y timeouts. No se ejecutan puertos, HTTP arbitrario, inspección interna ni búsquedas de brechas simuladas. Los resultados separan observación, revisión y fuente no comprobable; cada uno muestra evidencia, posible impacto y siguiente paso. No se publica un score ni se inflan cifras o hallazgos. Los certificados CT son historia pública, no una prueba del TLS actual.

El visitante autoriza consultar su dominio, ve alcance y proveedores antes de ejecutar y puede descargar un informe real. No se anuncia envío automático o captura de leads por servidor mientras no exista una integración validada.

## D-007 — 2026-10-29 — Chequeo público acotado y demostración identificada

El landing ofrece una consulta real de registros públicos SPF y DMARC mediante Cloudflare DNS over HTTPS, iniciada por el visitante con divulgación del proveedor. No solicita correo, guarda resultados ni calcula un score. La presencia de registros no valida su configuración; ausencia o error no demuestra intrusión. El chequeo no evalúa dispositivos o cuentas internas.

Los casos interactivos son ejemplos explícitos con observación, impacto posible y próximo paso. No se presentan como detecciones del visitante. Se evita jerga de MVP en marketing y se mantiene información veraz de disponibilidad en descargas.

El servicio `/scan` localizado en el license-server mezcla consultas reales con brechas simuladas y no está habilitado en este landing. No usarlo para informes comerciales antes de corregir y validar su alcance.

## D-006 — 2026-10-29 — CISPAR Security es una plataforma SaaS de ciberseguridad

Estado: aceptada por corrección explícita del fundador; sustituye la descripción de producto de coding agent usada en documentos anteriores.

CISPAR es CISPAR Security: una plataforma de operaciones de ciberseguridad enfocada en visibilidad de endpoints, detecciones verificables, investigación centralizada y respuesta controlada. El MVP propuesto prioriza Windows 11 y Ubuntu Server LTS. No es un agente de programación. El plan técnico es un backlog para construir el producto, no una definición de CISPAR como coding agent.

El landing puede describir objetivos del MVP, pero debe distinguirlos de funciones disponibles. No afirmar cobertura SOC 24/7, paridad con un EDR maduro, mitigación automatizada ni disponibilidad de instaladores hasta validación y publicación reales. Precios e hipótesis comerciales no están aprobados. La marca visual vigente para el landing usa el símbolo Centinela y la paleta grafito, marfil, salvia y arcilla recibida del fundador.

Motivo: el fundador corrigió que CISPAR es seguridad/SOC, detección de riesgos y vulnerabilidades; el material de negocio CISPAR adjunto confirma el contexto de ciberseguridad y el plan es de implementación.

## D-005 — 2026-09-20 — Landing desplegado en Vercel

Estado: aceptada

El landing público se despliega desde `Cispar-siem/Landing-page` mediante la
integración Git de Vercel. GitHub Actions conserva lint, test y build como
validación independiente; no publica artefactos en GitHub Pages.

Motivo: Vercel administra previews y el dominio público sin mezclar el
marketing con el plano de control de GCP.

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
