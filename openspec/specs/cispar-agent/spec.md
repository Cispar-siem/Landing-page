# CISPAR Agent

Estado: especificación activa para producción
Producto: agente de coding descargable de CISPAR

## Propósito

CISPAR Agent permite que una persona trabaje con un asistente de coding desde un cliente instalado. El usuario descarga una aplicación, inicia sesión desde el navegador y usa el servicio sin instalar Docker, Node, Python, modelos locales ni API keys.

## Límites del producto en producción

- No es el instalador del SIEM.
- No requiere Docker Desktop, Docker Engine o un gateway local para el flujo base.
- No reutiliza cookies, sesiones ni suscripciones de Claude, Cursor, Antigravity u otros productos.
- El número de proveedores se decide por costo, margen, contrato y soporte; cada proveedor habilitado debe tener integración, límites y observabilidad de producción.
- No obliga a iniciar sesión para leer el landing.

## Requisitos

### Landing público

- MUST permitir leer producto, requisitos, precios, privacidad e incidentes sin login.
- MUST mostrar un CTA principal de descarga o contratación, según la oferta aprobada.
- MUST mostrar una sección editorial de incidentes o noticias solo con fuente y fecha verificables.
- MUST explicar qué problema ocurrió, qué señal existía y cómo CISPAR ayuda; no atribuir causalidad falsa a una empresa real.
- MUST mostrar errores y estados de descarga sin activar enlaces para releases inválidas o no publicadas.

### Instalación

- MUST ofrecer un paquete por plataforma y arquitectura que corresponda a un artefacto real.
- MUST abrir el navegador del sistema cuando la aplicación necesita login.
- MUST completar la activación sin que el usuario copie API keys ni edite archivos `.env`.
- MUST informar requisitos reales y no presentar Docker como requisito del Agent.
- MUST guardar la sesión local en el almacén seguro disponible del sistema operativo.

### Device flow

- MUST usar el device flow definido en `docs/AUTH-DECISION.md` en producción.
- MUST usar secretos de dispositivo con entropía suficiente, expiración, intentos limitados y uso único.
- MUST mostrar qué instalación se está autorizando y pedir confirmación explícita.
- MUST devolver una sesión revocable para una instalación, no un JWT permanente de 30 días sin revocación.
- MUST invalidar el código después del canje o expiración.

### Suscripción y entitlement

- MUST mantener identidad en Supabase Auth y permisos comerciales en el backend.
- MUST activar o desactivar el entitlement desde eventos verificados del proveedor de pagos.
- MUST permitir login para administrar la cuenta aunque el entitlement esté vencido.
- MUST bloquear requests de Agent cuando no existe entitlement válido, crédito disponible o capacidad concurrente.
- MUST hacer idempotentes checkout, autorización, registro de instalación, revocación y procesamiento de webhooks.

### Requests al modelo

- MUST enviar las requests al proveedor desde el backend CISPAR.
- MUST mantener las claves de proveedores fuera del frontend y del binario.
- MUST verificar sesión, entitlement, plan, cuota y concurrencia antes de llamar al proveedor.
- MUST registrar uso final y costo estimado por request, sin guardar contenido sensible más tiempo del necesario.
- MUST devolver un error accionable cuando falta crédito, hay límite de concurrencia o el pago está pendiente.

### Planes y límites

El modelo recomendado es una suscripción con créditos mensuales y concurrencia máxima. El precio y los valores todavía son decisiones abiertas.

Un plan puede definir:

- `monthly_credits`
- `max_concurrent_requests`
- `allowed_models`
- `max_installations`
- `retention_days`

El sistema MUST reservar presupuesto antes de llamar al modelo y reconciliarlo con el consumo real después. No usar únicamente el número de mensajes como medida de costo.

## Criterios de aceptación para producción

- Una persona nueva puede entrar al landing sin login.
- Puede descargar un instalador real y abrirlo sin Docker ni API key.
- `cispar login` abre el navegador y autoriza solo esa instalación.
- Un usuario sin suscripción puede iniciar sesión, pero una request de Agent es rechazada con una explicación clara.
- Un usuario activo puede hacer requests hasta su límite.
- Dos requests concurrentes no pueden superar el límite del plan por una carrera de DB.
- Una suscripción cancelada deja de habilitar nuevas requests según la política aprobada.
- Un webhook repetido no duplica entitlement ni crédito.
- Una instalación revocada no puede continuar usando la API.
- Un visitante puede leer un incidente con fuente, fecha y CTA sin crear una cuenta.
- Hay staging separado de producción y una prueba end-to-end antes de cada release.
- Hay backups, restauración comprobada, alertas, logs correlacionados y runbook de incidentes.
- Las migraciones son versionadas y reversibles o tienen procedimiento de recuperación probado.
- Hay política publicada para pagos fallidos, reembolsos, cancelaciones, borrado de cuenta y soporte.
- Hay releases firmadas, rollback documentado y una instalación limpia verificada por plataforma.
- Las credenciales privilegiadas, claves de modelos y secretos de pagos están fuera del frontend, binario y repositorio.
