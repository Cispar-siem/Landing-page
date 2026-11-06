# Paquetes reales y laboratorio local

Fecha: 2026-11-05. Solicitado por el fundador. Estado: plan de ejecución; no acredita paquetes terminados.

## Resultado obligatorio

Descargar el paquete del sistema → abrir → autorizar instalación → iniciar sesión/asociar organización en el wizard → instalar y arrancar el agente → mostrar dispositivo conectado y primer evento en la consola. Reiniciar, actualizar y desinstalar deben funcionar sin terminal para el usuario final. Docker, Node, Python y certificados manuales no son requisitos del cliente.

## Repositorios y responsabilidades

| Repositorio | Responsabilidad | Mejoras necesarias |
|---|---|---|
| Landing-page | Marketing, catálogo validado y enlaces a artefactos | Conservar manifiesto público sin artefactos ficticios; verificar PRs; conectar releases reales al terminar cada plataforma. |
| Cispar-ISOC | Backend Phoenix, identidad/enrolamiento, agente Go, wizard embebido y empaquetado | Recuperar fuentes faltantes; corregir builds; unificar contrato de autenticación; sacar `deps`/`_build` del seguimiento en un cambio dedicado; agregar pipeline reproducible. |
| cispar-siem-mono | Appliance SIEM legado | Conservar separado; su instalador Docker no sustituye al agente Security. |

No crear más repositorios para estos paquetes. Mantener empaquetado junto al agente y versiones compatibles entre agente/API/wizard. La nueva rama remota `fix/UIserverErrors` necesita revisión: referencia módulos LiveView que no están versionados. No se debe aprobar por el mero hecho de añadir rutas.

## Laboratorio sin aprovisionamiento cloud

| Componente | Ejecución local | Qué demuestra |
|---|---|---|
| Landing/wizard React | Vite y bundle embebido en el launcher Go | Formularios, estados y recorrido de usuario. |
| API Phoenix | Proceso real, puerto 4001 | Contratos, autenticación, enrolamiento, recepción y consulta de eventos. |
| PostgreSQL | Contenedor dedicado, puerto 55432 | Migraciones, persistencia y aislamiento entre organizaciones. |
| Distribución de artefactos | Moto S3, puerto 5000 | Upload, manifiesto, descarga y checksums. No demuestra IAM/TLS/CDN reales. |
| TLS del laboratorio | CA efímera local y certificados por dispositivo | Bootstrap y mTLS sin certificados cloud. No deshabilitar validación TLS. |
| Identidad | Accounts/Guardian real de ISOC o Supabase local tras fijar el contrato | Evitar mezclar el Supabase del landing con JWT Guardian sin compatibilidad explícita. No usar tokens ficticios para declarar enrolamiento real. |
| Ubuntu y Arch | Máquinas virtuales KVM separadas | Instalación gráfica, systemd, permisos, reinicio, colectores y desinstalación. |
| Windows | Máquina virtual Windows local con licencia adecuada | MSI, UAC, servicio Windows, eventos y desinstalación. |
| macOS | Mac local con cuentas de prueba y entornos limpios | Instalación, launchd, permisos, Keychain y comportamiento de Gatekeeper. |
| LLM, correo y fuentes públicas | Deshabilitados o fixtures identificados durante pruebas deterministas | Sin llamadas a APIs de pago. Una respuesta simulada no acredita análisis real. |

Moto simula APIs AWS; no arranca Phoenix en una EC2 real ni ejecuta Windows/macOS. Docker proporciona procesos de laboratorio y KVM prueba los sistemas operativos. Un cross-build desde Arch no equivale a haber probado instalación en macOS o Windows. No se habilitarán servicios AWS, recursos cloud, runners pagados ni APIs LLM para este plan local.

## Formatos y contenido

| Plataforma | Artefacto previsto | Integración |
|---|---|---|
| Ubuntu LTS x64/arm64 según build validado | `.deb` | Dependencias explícitas, launcher `.desktop`, servicio systemd, logs y desinstalador. |
| Arch x64 | `PKGBUILD` reproducible y `.pkg.tar.zst` | `pacman`, launcher `.desktop`, servicio systemd y hooks mínimos. Probar en Arch limpio. |
| Windows 11 x64 | `.msi` con launcher `.exe` | UAC durante instalación, Windows Service, recuperación, logs y Add/Remove Programs. Evaluar MSI con WiX para el servicio; no asumir compatibilidad MSIX con el agente. |
| macOS arm64/x64 | `.pkg` y launcher `.app` | launchd, almacenamiento en Keychain, permisos mínimos y desinstalación documentada. Diseñar colector Darwin antes de anunciar paridad. |

El launcher Go puede servir assets del wizard compilados y embebidos mediante `go:embed` y abrir el navegador en loopback. Requiere puerto dinámico, sesión local con nonce/CSRF y expiración, separación entre UI sin privilegios y servicio, y secretos en el almacén del SO. El empaquetado debe usar un binario real versionado; no el fixture Moto. Esta es la propuesta de implementación y requiere revisión de seguridad antes del código de privilegios/acceso.

## Orden de ejecución y puertas de aceptación

| Fase | Entregable / propietario técnico | Aceptación |
|---|---|---|
| P0 — Base reproducible | Backend/agente: recuperar fuentes faltantes, limpiar artefactos versionados y fijar herramientas/dependencias | Checkout limpio compila con `mix compile` y `go build ./...`; builds de cada target y baseline documentados. |
| P1 — Servicios reales locales | Backend: arranque reproducible, PG aislado, migraciones y health | API y DB saludables; reinicio conserva datos; ninguna dependencia de una cuenta cloud. |
| P2 — Bootstrap e identidad | Backend + agente: resolver certificado requerido antes de enrolar, contrato login/token/CA | Agente limpio recibe identidad/certificado, token expira y se consume con límites atómicos; revocación y separación de tenants verificadas. Cambio de control de acceso requiere revisión explícita antes de aplicarlo. |
| P3 — Wizard real | Agente/UI: recuperar o implementar fuentes completas y launcher local | Estados instalar→autorizar→conectar→listo, error recuperable y cancelación; primer evento visible, sin YAML manual. |
| P4 — Ubuntu y Arch | Agente/packaging Linux | `.deb` y `.pkg.tar.zst` instalados en VMs limpias; arranque tras reinicio, coleta real autorizada, upgrade y uninstall. Arch es criterio obligatorio, no sustituto de Ubuntu. |
| P5 — Windows | Agente/packaging Windows | Build Windows y MSI real, instalación limpia, Windows Service, evento real, upgrade y uninstall en VM. |
| P6 — macOS | Agente/packaging Darwin | Colector compatible con alcance aprobado, `.app/.pkg` instalable, launchd, evento real, upgrade/uninstall en Mac. |
| P7 — Distribución | Release/backend + landing | Publicar primero en Moto, SHA-256 comprobado contra bytes, versión/arquitectura correctas y descarga completa del paquete real desde el landing. |
| P8 — Candidato público | Release/seguridad | Firma de distribución, notarización cuando aplique, reproducibilidad, rollback y monitoreo documentados; release pública solo con evidencias de su plataforma. |

Cada fase tiene un PR revisable y evidencia de comandos/VM/versión. Una falla de build o una fuente faltante bloquea declarar completada la fase dependiente. No se prometen fechas antes de cerrar P0 y P1.

## Matriz mínima para llamar completo al recorrido local

Para Ubuntu, Arch, Windows y macOS: instalar sin runtime de desarrollo; negar/aceptar autorización; login válido/inválido; enrolamiento de primer uso; equipo visible; evento real y evidencia; reinicio del equipo/API; pérdida y recuperación de red sin duplicados; checksum adulterado rechazado; actualización válida y fallida con rollback; token expirado/reusado; revocación; aislamiento entre dos organizaciones; desinstalación con política explícita de retención de datos. Registrar hash del paquete y snapshot/SO para cada evidencia.

La disponibilidad pública de macOS requiere plan de Developer ID y notarización; los paquetes Windows necesitan una estrategia de firma. Las pruebas locales pueden empezar con certificados de desarrollo sin contratar servicios cloud. Eso no acredita confianza pública ni garantiza distribución final sin costo de certificados/cuentas/hardware.

Referencias oficiales consultadas: [Moto server mode](https://docs.getmoto.org/en/latest/docs/server_mode.html), [Apple Developer ID](https://developer.apple.com/developer-id/), [notarización macOS](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution), [Microsoft firma de paquetes](https://learn.microsoft.com/en-us/windows/msix/package/signing-package-overview).

## Evidencia inicial

- Landing: lint/build y pruebas unitarias pasan; descarga de fixture Moto verificada con Chromium. Esto no es un paquete real.
- Agente Linux: `go build ./...` falla por duplicación de `SupportsPlatform`, `auparse.AuditClient` inexistente y tipos de constantes audit incompatibles. No empaquetar un binario antiguo como si fuera un build validado de las fuentes actuales.
- Windows x64: el cross-build falla por sintaxis en `internal/collectors/windows/eventlog.go:205` y `:252`. macOS arm64 compila de forma cruzada; la instalación y el colector Darwin siguen pendientes.
- Backend: health real HTTP 200 en puerto 4001 y PostgreSQL con 19 migraciones aplicadas. Ver `docs/LOCAL-LAB.md` en Cispar-ISOC; el puerto 4000 pertenece a otro gateway.
