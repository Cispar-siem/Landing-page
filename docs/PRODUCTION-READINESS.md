# Disponibilidad comprobada — 29 octubre 2026

## Web y Quick Scan

Landing React con marca Centinela, ejemplos interactivos y Quick Scan real de exposición pública. Se solicitan nombre, correo y teléfono para preparar una consulta comercial; empresa es opcional. Solo se transmite el dominio al endpoint propio `/api/quick-scan`, que consulta orígenes fijos de Cloudflare DNS y crt.sh. Los datos de contacto permanecen en la sesión local y se trasladan a contacto mediante estado de navegación, no en la URL ni al scanner.

Comprobaciones: SPF, DMARC, MX, CAA, DNSKEY/validación del resolutor y nombres históricos de Certificate Transparency. Sin score ni búsquedas simuladas de filtraciones. Cada resultado muestra observación, evidencia, posible impacto y siguiente paso. Errores, NXDOMAIN o respuestas truncadas no se convierten en vulnerabilidades; CAA ausente y falta de entradas CT son informativos. Hay cancelación, filtros y descarga TXT. El formulario de contacto prepara un correo que el visitante revisa/envía; no hay entrega automática ni captura de leads por servidor.

Adaptador nativo Vercel en `api/quick-scan.mjs`; middleware Vite dev y preview comparten `server/quick-scan.mjs`. Cuerpos limitados a 4 KiB, respuestas upstream a 512 KiB, cinco evidencias acotadas por check, consultas DNS de hasta 8 s y CT de hasta 10 s. Solo se hacen requests a proveedores fijos, nunca al host introducido. No se ha desplegado en esta tarea. Antes de lanzamiento público: validar endpoint desplegado y protección frente a abuso/rate limiting en el hosting; las fuentes públicas pueden fallar o limitar consultas.

Referencias técnicas consultadas: https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/ y https://vercel.com/docs/functions/runtimes/node-js (handler fetch y extensión .mjs).

## Instalación — bloqueo real

El manifiesto `public/releases.json` no contiene artefactos disponibles. El instalador localizado en `/home/axel/cispar-siem-mono/cispar-installer/main.go` ejecuta ensureDocker, genera secretos y docker-compose, descarga imágenes y arranca servicios SIEM. No es un agente endpoint independiente ni cumple la instalación simple definida en la spec. No se modificó ni publicó ese instalador como si fuera CISPAR Security.

Para habilitar descarga faltan: repositorio canónico del agente Security, endpoint de enrolamiento autorizado, binario real Windows/Ubuntu con instalación/desinstalación y actualizaciones verificadas, paquetes firmados y checksum, publicación HTTPS y prueba completa descargar→abrir→autorizar→telemetría. Los paquetes y credenciales de coding no acreditan esas capacidades.

## Escáner legado

Existe código `/home/axel/cispar-ia-backend/cispar-license-server/src/routes/scan.ts` y `/services/vuln-scan.ts`. Se comprobó respuesta HTTP 200 de localhost:3000/health. Esto no prueba disponibilidad pública. El servicio contiene brechas simuladas y almacenamiento en memoria; el componente antiguo también declara envío de informe sin evidencia. Se conserva sin montar; el nuevo chequeo acotado no depende de él.

## Lanzamiento pendiente

Validar dominio desplegado, contactos comerciales, alcance y soporte, privacidad/retención para cualquier captura de datos y funciones de producto reales. Las pruebas locales no acreditan disponibilidad del SOC ni de instaladores.
