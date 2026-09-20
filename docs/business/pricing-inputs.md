# Datos necesarios para fijar precios

No fijar cifras en el código hasta responder estas preguntas:

- ¿El precio es por persona, instalación, equipo o cuenta?
- ¿Qué proveedor y modelo se incluyen en el plan inicial?
- ¿Cuántos créditos mensuales recibe cada plan?
- ¿Cuántas requests simultáneas permite?
- ¿Qué pasa cuando se termina la cuota?
- ¿Hay trial? ¿Cuántos días y con qué límite?
- ¿Qué moneda y países se atienden primero?
- ¿Se requiere factura fiscal o plan empresarial?
- ¿Cuál es el margen bruto mínimo aceptable?
- ¿Se permite BYOK y cómo cambia el precio?

## Fórmula de referencia

```text
precio mínimo mensual =
  costo esperado de modelo
  + infraestructura
  + pagos/impuestos/reembolsos
  + soporte
  + margen objetivo
```

La cuota del plan debe tener un límite técnico que el backend pueda aplicar y un lenguaje que el usuario pueda entender.
