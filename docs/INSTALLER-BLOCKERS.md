# Bloqueos del recorrido de instalación — 2026-11-05

## Revisión remota

Se ejecutó fetch autenticado con las credenciales existentes de GitHub. No se mezclaron ramas ni se modificó el checkout del producto.

| Repositorio | Resultado |
|---|---|
| Landing-page | `main` y `origin/main` coinciden en `f73309d`; hay cambios locales sin commit. |
| Cispar-ISOC | Rama principal remota `epic/E01-saas-foundations` avanzó a `486770e`: un commit de documentación respecto al checkout local `3f1289d`. |
| Cispar-ISOC | Nueva rama `fix/UIserverErrors`, `7b3c83a`: cinco commits respecto al checkout local, incluyendo el anterior de documentación. Añade rutas LiveView/API, redirección raíz y cambios de sesión/arranque. |
| cispar-siem-mono | `main` y `origin/main` coinciden en `97146e9`. |

La API de GitHub devolvió cero releases en los tres repositorios. Esto describe GitHub Releases; no descarta artefactos en otros servicios no inspeccionados.

## Evidencia de bloqueos

1. **El instalador real no está publicado.** `public/releases.json:3` mantiene ambos targets no disponibles. En `Cispar-ISOC/apps/backend/lib/cispar_web/live/customer_portal/enrollment.ex:481`, MSI/DEB/RPM se muestran con botones deshabilitados. Sus comandos usan por defecto `https://api.cispar.example` y rutas `/install.sh`, `/install.ps1`, `/install.bat` (`:546`); esas rutas no aparecen en el router remoto revisado.
2. **Faltan fuentes del wizard en la rama remota.** En `Cispar-ISOC` remoto `7b3c83a`, `apps/backend/lib/cispar_web/router.ex:187` referencia `EnrollmentWizard.Index`. `git ls-tree` y `git grep` no encuentran su módulo entre las fuentes de esa rama. El único archivo bajo `apps/backend/lib/cispar_web/live` es el portal de enrolamiento. Incorporar solo las rutas no proporciona el wizard.
3. **La primera conexión tiene una dependencia circular aparente.** El router coloca `/api/v1/agent/enroll` bajo `:agent_mtls` tanto localmente como en la rama remota. `RequireMTLS.call/2` rechaza conexiones sin certificado (`apps/backend/lib/cispar_web/plugs/require_mtls.ex:79`), mientras `agent/internal/agent/identity/manager.go:89` describe la obtención de certificados durante el enrolamiento. Inferencia de revisión estática: un agente limpio no puede completar ese recorrido sin un mecanismo de bootstrap adicional. Requiere reproducción y corrección con pruebas de seguridad.
4. **El agente necesita configuración y servicios reales.** `agent/internal/config/config.go:134` usa `https://api.cispar.local`, con certificados y directorios de sistema. Existe código Go del agente; su existencia no acredita instalación automática, conexión a un backend desplegado ni funcionamiento en una máquina limpia.
5. **La evidencia de pruebas todavía es parcial.** `docs/TESTING.md` remoto `486770e` informa 398 pruebas con 38 fallos como baseline. Es un reporte del repositorio, no una ejecución nueva de esta auditoría. `docs/DEPLOYMENT.md` describe arquitectura cloud, pero sus afirmaciones de disponibilidad no reemplazan la evidencia del código y del recorrido completo.

## Recorrido que falta cerrar

Paquete nativo real → abrir wizard → autenticar/asociar organización → enrolar dispositivo de forma segura → instalar servicio → enviar primer evento → mostrar equipo y estado en la consola → desinstalar y actualizar correctamente.

Primero deben recuperarse las fuentes faltantes y resolverse el bootstrap del agente. Después se puede empaquetar un primer target Linux, conectar el catálogo al artefacto real y recorrer una instalación limpia. La publicación para Windows necesita su propio empaquetado y validación.

## Qué aporta la simulación actual

Moto S3 ya valida el transporte del manifiesto y un fixture de texto desde el frontend. No ejecuta el backend Phoenix ni el agente. Para la prueba completa local hacen falta procesos reales de Phoenix y PostgreSQL, el agente real y su configuración de laboratorio; Moto sirve como almacenamiento simulado de artefactos. Esa prueba local no necesita desplegar AWS ni obliga al cliente final a instalar Docker.
