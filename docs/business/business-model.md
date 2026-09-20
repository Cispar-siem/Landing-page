# Modelo de negocio — CISPAR Agent

## Modelo principal de producción

Suscripción recurrente con cuota de uso. El plan habilita el producto y define límites; no se concede acceso pagado por la apariencia de la UI ni por una descarga.

## Unidad de cobro propuesta

Créditos de IA mensuales más un límite de concurrencia. El valor de los créditos debe calcularse con costo real del proveedor, margen objetivo, soporte, infraestructura y reintentos.

## Estados comerciales

| Estado | Acceso al producto | Acción del usuario |
|---|---|---|
| trial | Solo si existe una regla publicada de duración, crédito y abuso | Convertir o esperar |
| activo | Sí, dentro de cuota | Usar y administrar |
| sin créditos | No puede iniciar request nueva | Esperar renovación o mejorar plan |
| past_due | Según gracia aprobada | Actualizar pago |
| cancelado al final de periodo | Hasta fecha efectiva | Reactivar si quiere |
| suspendido/revocado | No | Contactar soporte |

## Reglas de negocio

- Stripe/webhook o proveedor definitivo actualiza el entitlement.
- Cada request valida entitlement, crédito, concurrencia e instalación.
- La reserva de crédito es atómica y se reconcilia con tokens reales.
- Los reintentos del cliente no deben generar doble cargo ni doble reserva.
- Un refund, disputa o cancelación tiene una política explícita antes de automatizar el bloqueo.
- El soporte puede revisar y corregir un entitlement con audit log; no editar estados directamente sin registro.

## Costos que deben entrar al modelo antes de vender

- Modelo y tokens de entrada/salida.
- Reintentos, streaming interrumpido y herramientas.
- Servidor API y worker.
- Base de datos y almacenamiento.
- Emails y observabilidad.
- Comisiones de pago, conversión de moneda, impuestos y reembolsos.
- Soporte y mantenimiento de instaladores.

No publicar un plan sin saber su costo máximo de uso, su margen bruto objetivo y su comportamiento cuando el usuario exceda la cuota.

## Métricas

- Visita → descarga.
- Descarga → login.
- Login → primera request.
- Primera request → usuario activo al día 7.
- Costo promedio por usuario activo.
- Margen bruto por plan.
- Requests rechazadas por cuota/pago.
- Tiempo de resolución de soporte.
