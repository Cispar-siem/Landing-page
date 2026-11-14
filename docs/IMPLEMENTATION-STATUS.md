### Destino GCP para stage (sin Firebase) — 2026-11-13

- Se corrigió D-013 conforme a la indicación del fundador: Landing en Cloud Run, frontend y Quick Scan en el mismo servicio; AWS queda separado para evaluar el backend/desktop.
- Añadido servidor Node para servir `dist/`, health check y `/api/quick-scan`, con límite local de 30 solicitudes por 10 minutos; el contenedor público no habilita login al landing.
- `Landing CI` conserva los gates y agrega deploy únicamente en push a `stage`, con OIDC/Workload Identity Federation, región `us-central1`, escala 0–1 instancias y acceso público de demo. El job queda omitido mientras falte alguna variable GitHub requerida: `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT` o `GCP_RUNTIME_SERVICE_ACCOUNT`. `GCP_REGION` es opcional y tiene default. No hay credenciales estáticas.
- Cloud Run se construirá con Node.js buildpacks para recibir configuración de frontend al build. Instrucciones IAM/OIDC y variables requeridas: `docs/GCP-STAGE-SETUP.md`. No hay aún autenticación OIDC, roles IAM, variables GitHub, billing habilitado ni URL desplegada; por tanto esto es preparación local, no demo publicado. Billing y despliegue quedan pendientes del límite mensual acordado.
- Validación local: `npm test` (8 checks plataforma, 9 releases, 10 pruebas Quick Scan/Cloud Run), `npm run lint`, `npm run build`, `actionlint .github/workflows/deploy.yml`, comprobación offline de `npm ci` y smoke HTTP local (`/healthz`, `/`, `/api/quick-scan` con dominio inválido) pasaron. Se intentó `docker build` antes de cambiar a buildpacks, pero se canceló porque `npm ci` dentro del daemon quedó sin avanzar; ya no es el mecanismo que usa el pipeline.

### Revalidación del pipeline app → stage — 2026-11-13

- El workflow `Landing CI` se ejecutó manualmente en `app`: run [43528862911](https://github.com/Cispar-siem/Landing-page/actions/runs/43528862911) terminó exitosamente en lint, pruebas, build, `npm audit`, Gitleaks y CodeQL. El job de empaquetado de `stage` se omitió porque el evento fue `workflow_dispatch` sobre `app`.
- El último push existente en `stage`, run [43429085757](https://github.com/Cispar-siem/Landing-page/actions/runs/43429085757), pasó y subió el artefacto `cispar-landing-stage-a0782cc94ef07bcb928ce7a52761a26fde3a8e3a` (137,920 bytes), con retención de 7 días. Es un artefacto de GitHub Actions, no un despliegue a GCP.
- El remoto `app` no tiene commits nuevos frente a `stage`; `stage` está un commit adelante. No hay diff que promover con un PR `app → stage` en este momento.

### Pipeline GitHub — 2026-11-13

- **Landing:** run [43429085757](https://github.com/Cispar-siem/Landing-page/actions/runs/43429085757) terminó exitosamente en `stage`: lint, tests, build, npm audit, CodeQL y secret scan pasaron; también se subió el artefacto de preview. No es despliegue de producción. No hay PR abierto de Landing.
- **ISOC:** PR [#4](https://github.com/Cispar-siem/Cispar-ISOC/pull/4) sigue abierto hacia `app`. Su último run [43430713474](https://github.com/Cispar-siem/Cispar-ISOC/actions/runs/43430713474) falló en los tres gates principales: Gitleaks reportó 29 coincidencias históricas; backend falló auditoría Hex, formato/Credo/Sobelow y compilación/pruebas (incluye `enroll_endpoint_path/4` no definido); el agente falló tests/vet y scanners, con 42 hallazgos de Gosec. Ese run valida SHA `feb20448`, anterior a cambios locales sin push; hace falta volver a ejecutarlo después de integrar las correcciones.
- **Acción personal de seguridad:** el informe de GitHub oculta los valores. Las 29 coincidencias incluyen dependencias vendorizadas y fixtures, además de valores estáticos históricos bajo `config/dev.exs` (`secret_key_base`) y `docs/DEPLOYMENT.md` (`CISPAR_MTLS_CA_KEY`). El `.gitleaksignore` local enumera las 29 fingerprints pero sigue sin seguimiento y no prueba que los valores sean inocuos. Confirmar si alguna clave se usó fuera de pruebas; rotar las que sigan vigentes. No copiar claves al chat.
- **Accesos:** no hacen falta tokens o credenciales tuyas para CI; el acceso GitHub de esta sesión permitió revisar los runs. Publicar artefacto real o desplegar producción requiere las decisiones y configuración descritas en D-013.

### Revalidación cruzada ISOC + Landing — 2026-11-13

- **P0/P1, local:** En `Cispar-ISOC/agent`, `go test ./...` pasó y los builds cruzados `GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build ./...` y `GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build ./...` pasaron. `curl -fsS http://127.0.0.1:4001/health` devolvió `{"status":"ok","database":"ok"}`. Esto no demuestra builds reproducibles desde checkout limpio; dependencias/builds siguen versionados y `mix compile` emite advertencias, incluidas funciones y rutas LiveView ausentes.
- **P2, bootstrap local:** se revisó el control de acceso del enrolamiento: HTTPS obligatorio, límite 10 solicitudes/minuto por IP, token digest de un solo uso con consumo atómico, certificado firmado a partir de CSR del cliente, mTLS contra CA/serial/fingerprint registrados y revocación persistida junto al estado del endpoint. El key privado de agente no se devuelve. La revisión y las pruebas se limitan al entorno local.
- **ISOC, pruebas enfocadas:** En `Cispar-ISOC/apps/backend`, `mix test --no-compile` sobre rate limiter, rate limit plug, local enrollment, endpoint registry, CRL, RequireMTLS y controladores de enrollment/endpoint pasó 48/48.
- **ISOC, suite completa:** En `Cispar-ISOC/apps/backend`, `mix test --no-compile` terminó 128/192; 64 fallan. Los grupos fallidos incluyen CRL/controller tests antiguos, 28 casos de `SecurityPilotTest` dependientes de helpers/APIs retirados (`create_default_policy`, `create_enrollment_token`), tests de controladores de auditoría/rutas de revocación ligados a flujos antiguos, y auditoría de agente que escribe `agent_id`/`system` en `audit_logs.user_id` UUID. La suite no está verde y el backend no se declara listo para piloto.
- **Distribución:** no se encontraron artefactos `.deb`, `.pkg.tar.zst`, `.msi` ni `.pkg`, ni fuentes de empaquetado bajo `agent/`. `virsh -c qemu:///system list --all` no mostró VMs y `/var/lib/libvirt/images` está vacío; no se validaron instalación, servicio, reinicio, actualización o desinstalación en VMs/Mac. No hay subida Moto ni releases firmadas.
- **Landing:** siguen vigentes las validaciones anotadas en las entradas anteriores: lint, suites y build locales pasaron. No se desplegó.
- **Estado del plan:** P1 está verificado localmente; P2 está implementado y verificado en pruebas enfocadas. P0 no está validado desde checkout limpio; P3 está implementado parcialmente (hay UI/launcher, falta recorrido end-to-end y primer evento observado). P4–P8 siguen pendientes por instalación real en SO, artefactos/distribución y firma. No se publicó ni desplegó nada.

### Quick Scan como evaluación real del dominio — 2026-11-13

- Se aclaró el recorrido de conversión: el Quick Scan consulta seis comprobaciones reales de DNS/correo y Certificate Transparency sobre el dominio autorizado. Cada resultado conserva observación, evidencia, impacto posible y próximo paso; no evalúa endpoints, cuentas internas ni actividad.
- El resultado conserva tres salidas honestas: consultar información del piloto con el informe; completar la consulta si faltan fuentes; o, si no hay hallazgos en este alcance, explicar qué queda sin evaluar y que el SaaS sigue en desarrollo.
- Se pasaron los textos del hero, Quick Scan y el contacto contextual a claves semánticas ES/EN. El formulario y sus requisitos de autorización/contacto se mantienen conforme a D-008.
- Se simplificó el idioma para clientes: el formulario pide la dirección del sitio con ejemplo; cada revisión dice qué encontramos, por qué importa y qué hacer en palabras cotidianas. Fuentes y códigos quedan en el detalle técnico opcional.
- Se alineó la marca con D-012: CISPAR se presenta como SaaS autogestionado por cada cliente; los CTA llevan a información del piloto y no prometen revisión 1:1. Solo el Quick Scan de dominio se declara disponible.
- Se contrastó el copy con D-006, el brief del producto, el documento técnico de CISPAR-ISOC y la guía editorial de LinkedIn. `npm run build` y `git diff --check` pasaron; no se ejecutaron pruebas ni se publicó.
- El tracker técnico `Cispar-ISOC/progress.md` dice que el MVP está listo para piloto, mientras la decisión D-011 del landing aún prioriza validar localmente los paquetes y no hay instaladores publicados. Por eso la comunicación pública mantiene el piloto «en preparación» hasta cerrar esa diferencia con evidencia de lanzamiento.
- `npm run build` y auditoría local de claves estáticas/dinámicas ES/EN pasaron. Revisión visual móvil completa y hero de escritorio con Playwright: `/tmp/cispar-quickscan-purpose-full.png`, `/tmp/cispar-quickscan-purpose-desktop.png`. No se desplegó.

### Dirección visual Centinela — 2026-11-13

- Se reforzó la identidad de la landing con marfil y grafito como base, salvia para orientación, arcilla en ejemplos y naranja quemado como acento de acción, siguiendo la referencia del fundador.
- El hero usa la promesa aprobada «Detecta antes. Decide con evidencia», marca el estado real del piloto y distingue el Quick Scan disponible del alcance de equipos/cuentas en desarrollo. La composición propia de Centinela y la ruta señal → evidencia → revisión reemplazan el aspecto plano; no se añadió una consola ni actividad ficticia.
- Se unificaron botones, tarjetas del Quick Scan, ejemplos, sección de evidencia, pricing y FAQ bajo radios, bordes, fondos y ritmo compartidos. Se conservó el formulario y sus requisitos vigentes.
- `npm run build` finalizó correctamente. Revisión visual local con Playwright a 1440 px y 390 px; capturas: `/tmp/cispar-brand-final-desktop.png`, `/tmp/cispar-brand-final-mobile.png`. No se ejecutó la suite de pruebas ni se desplegó.

### Hero rediseñado con Astra — 2026-10-30

- Consulta explícita a Astra y revisión visual de https://sublime.security/ y https://www.runzero.com/ mediante Chromium. Se retira maqueta de alerta/login, navegación lateral, evidencia ficticia y flechas señal-contexto-revisión del hero.
- Nueva ilustración SVG propia de equipo, cuenta y dominio. Selector de tres botones cambia énfasis y explicación, con entrada breve escalonada, transiciones de 350 ms y reduced-motion. Sin autoplay ni datos de monitoreo simulados. La firma Centinela usa el activo original.
- Título Seguridad para tu empresa, CTA revisar dominio y contacto real; el Quick Scan se coloca inmediatamente después. Cifras verificadas se mantienen después de los casos. Copy de riesgo acortado hacia continuidad de negocio.
- Capturas iniciales revelaron título móvil cubierto por header y figuras transparentes: corregidos espacio superior y superficies opacas. Encabezado de dos líneas comprobado en 320/390/768/1440.
- Validación final: lint/build y 17 pruebas Playwright (5 del hero y 12 del Quick Scan) pasaron. Cuatro anchos sin overflow, título fuera del header y de dos líneas, selección de objetos, reduced-motion, CTA y contacto ES/EN. Capturas finales: /tmp/cispar-astra-final-{320,390,768,1440}.png. No se desplegó en esta tarea.

### Quick Scan ampliado — 2026-10-29

- D-008 registra confirmación del fundador. Formulario inicial exige nombre, correo, teléfono, dominio y autorización de consulta; empresa opcional. No se infiere que datos personales estén filtrados.
- API Vercel propia y adaptador Vite dev/preview consultan exclusivamente Cloudflare DNS y crt.sh. Seis comprobaciones reales, sin score, cifras infladas ni brechas simuladas. Campos de contacto no entran al endpoint.
- Informe con observación, impacto posible, siguiente paso, evidencia/fuente, filtros, descarga TXT y consulta comercial con resumen. Fuentes caídas quedan sin verificar; ausencia CAA/CT es informativa; no se confunde falta de comprobaciones con protección. Se conserva cancelación, rechazo de email en dominio y validación del contrato de respuesta.
- Prueba integrada real local example.com: SPF, DMARC, Null MX, CAA informativo y DNSSEC; CT sin respuesta queda unknown. No hay evidencia de detección interna de endpoints/usuarios ni instaladores publicados.
- Validación: lint/build, 8 platform checks, 6 release checks y 7 pruebas core (fixtures aisladas). Playwright enfocado: 12 pruebas pasan, incluyendo obligatoriedad, privacidad del POST, rechazo de correo, errores/malformed/dominio distinto, cancelación, exportación, handoff, fuentes totalmente caídas, versión inglesa y 320/390/768/1440 sin overflow. Capturas /tmp/cispar-quick-scan-{320,390,768,1440}.png.
- Auditoría Terra detectó copy que afirmaba apertura de cliente de correo sin poder comprobarlo; se corrigió a solicitud preparada e instrucciones de revisión/envío. No se afirma entrega remota. No se desplegó.

### Frontend y chequeo público — 2026-10-29

- Hero orientado a PyME sin personal de seguridad; CTA hacia chequeo real. Casos interactivos de cuentas/equipos/vulnerabilidades con explicación y animación reducida cuando corresponde; se identifican como ejemplos.
- Chequeo nuevo SPF/DMARC con Cloudflare DoH: sin correo, sin score, evidencia desplegable, límite de alcance y fuente visible, timeout y estado desconocido ante errores. No se usa la API local que mezcla brechas simuladas.
- Contacto prepara correo y conserva dirección de respaldo; solicitudes de instalación precargan plataforma. Navegación entre rutas vuelve arriba y reinicia observadores. Eliminada sección conceptual repetida; FAQ de equipos corregida.
- Actualizados brief y go-to-market que aún describían coding; D-007 y PRODUCTION-READINESS documentan alcance y bloqueo del instalador.
- Evidencia: lint y build exitosos; npm test: 8 platform y 6 release checks. Playwright sin overflow en 320/390/768/1440 para inicio, descargas, precios y contacto; chequeo real example.com retornó SPF y DMARC. Capturas /tmp/cispar-final-{320,390,768,1440}.png y /tmp/cispar-domain-results.png.
- No se declara producción lista: faltan agente Security y artefactos reales; instalador legado requiere Docker. No se desplegó en esta tarea.

### Corrección de producto CISPAR Security — 2026-10-29

- **Estado:** aplicado y verificado localmente. La corrección explícita del fundador define CISPAR como plataforma SaaS de operaciones de ciberseguridad/SOC, no como agente de programación. D-006 sustituye el copy y las referencias históricas incompatibles; el plan técnico es backlog del producto.
- Se alinearon el hero, una sección de posición entre antivirus y SOC con tres escenarios no alarmistas, el hallazgo conceptual, el flujo señal→contexto→respuesta, el estado de instaladores, FAQ, precios, contacto, OpenSpec y contexto del proyecto. Las capacidades se describen como objetivo del MVP y no como producto publicado. No se promete SOC 24/7 ni paridad EDR.
- El CTA principal y el CTA de la sección de posicionamiento llevan al contacto del piloto; “Cómo funciona” hace scroll real sin romper HashRouter. La animación recorre señal→contexto→revisión y respeta `prefers-reduced-motion`.
- Chromium/Playwright a 320, 390 y 1440 px: titular móvil en dos líneas, CTA secundario ubica la sección de flujo, CTA principal abre contacto, menú móvil abre, sin overflow horizontal ni errores JS. En descargas: solo los dos sistemas del alcance inicial, paquetes deshabilitados y 0 enlaces a instaladores activos. Capturas del landing actualizado: `/tmp/cispar-security-position-320.png`, `/tmp/cispar-security-position-390.png`, `/tmp/cispar-security-position-1440.png`.
- `npm run lint`, `npm test` (8 checks de plataforma y 6 de releases) y `npm run build` finalizaron con código 0.
- **Límite:** el escaneo público antiguo usa por defecto `localhost:3000` y no está montado en la landing actual; no se presenta como una demostración disponible. No hay instaladores reales publicados.

# CISPAR — Estado de Implementación de Tareas

### Rediseño UI/UX del landing — 2026-10-29

- **Estado:** `verificado localmente`
- **Cambios:** se unificó el símbolo y wordmark de CISPAR en header/footer, se añadió favicon SVG, se ajustó la jerarquía visual y el diseño responsive del landing, y se actualizó el hero para indicar que la plataforma está en desarrollo y que la consola es ilustrativa.
- **Validación ejecutada:** `npm run build`, `npm run lint`, `npm test` (8 checks de plataforma y 6 del validador de releases). Chromium: revisión de `/`, `/download`, `/pricing`, `/contact` y `/auth` a 360 y 768 px; sin errores JS ni overflow horizontal. Menú móvil abre y muestra rutas. Capturas completas locales en `/tmp/cispar-final-360.png`, `/tmp/cispar-final-768.png` y `/tmp/cispar-final-1440.png`.
- **Límite:** comprobación local solamente; no demuestra capacidades desplegadas en staging/producción. La captura de 1440 px se generó antes del último ajuste de copy/espaciado.

### Identidad Centinela aplicada — 2026-10-29

- **Estado:** `verificado localmente`
- Se sustituyó el símbolo provisional por el Centinela de la lámina recibida, se configuró el favicon con ese mismo símbolo y se cambió la interfaz a grafito `#1F2827`, salvia `#78918A`, arcilla `#C99588`, lavanda `#BCB7CF` y marfil `#F7F5F0`. Hero y copy alineados con «Detecta antes. Decide con evidencia.»
- Auditoría visual independiente de Terra identificó y ayudó a corregir problemas de contraste, uso del símbolo sobre el footer oscuro, tonos azules residuales y longitud del titular. Capturas Chromium rehechas en 360/768/1440 px; no overflow horizontal, favicon/asset presentes, menú móvil abre.
- `npm run build`, `npm run lint`, `npm test` completados; suites existentes: 8 checks de plataforma y 6 de releases. Evidencia visual: `/tmp/cispar-final-brand-1440.png` (antes del último ajuste del titular).
- Wizard de evaluación recorrido en navegador con API simulada: validación, envío, evento SSE y pantalla de resultados. Se corrigió un `NaN` cuando el backend omite `completedAt`; usa duración agregada de etapas como fallback. No se ejecutó un escaneo real contra dominios externos.
- Revisión adicional con las capturas compartidas: mientras espera el POST el wizard muestra un estado de análisis con spinner; respuesta fallida termina el stream y presenta error recuperable; contraste de resultados reforzado. Página de descargas traducida completa y catálogo público corregido para no mostrar Docker ni disponibilidad inexistente. Chromium 390/1440: sin overflow, claves i18n en pantalla ni mención a Docker; wizard simulado completó en 1s y 0 errores JS. Capturas: `/tmp/cispar-download-390.png`, `/tmp/cispar-download-1440.png`, `/tmp/cispar-wizard-final-mobile.png`.
- Corrección posterior según nuevas capturas: todas las páginas internas ahora reservan espacio bajo el header fijo; estilos Centinela aplicados a descarga, planes, contacto y compatibilidad; pasos de instalación pasan a tres columnas en desktop y una en móvil; CTA del bloque oscuro recupera contraste. Playwright recorrió `/`, `/download`, `/pricing`, `/contact` en 390 y 1440px: sin overflow ni errores JS. Capturas actuales `/tmp/final-home-1440.png`, `/tmp/final-homedownload-1440.png`.

**Modo operativo:** startup en producción. Los estados `verificado` de este documento indican comprobación local del repositorio y no sustituyen validación de staging, producción, billing, releases firmadas, monitoreo o rollback.

Documento de seguimiento vivo según la especificación de `PLAN-CISPAR-PLATAFORMA.md`.

---

## Resumen General de Tareas

### Deployment repository preparation — 2026-09-20

- Vercel deployment contract added in `vercel.json`; build output is `dist`
  and Vite now uses domain-root asset URLs.
- GitHub Actions now validates lint, tests, and the production build without
  publishing to GitHub Pages. Vercel Git integration remains the deployer.
- Local verification completed: `npm run lint`, `npm test`, and
  `npm run build` exited successfully. A real Vercel deployment remains
  pending account connection and production environment variables.

| ID | Tarea | Estado | Siguiente acción / Bloqueo |
|---|---|---|---|
| **T00** | Inventario de landing, backend y desktop; auth, instalación, billing existente | **verificado** | Completado. Decisión registrada en `docs/AUTH-DECISION.md`. |
| **T01** | Reproducibilidad: package scripts, lint, workflow y README | **verificado** | Scripts alineados, lint limpio (0 errores/0 advertencias), tests integrados y CI corregido. |
| **T02** | Tokens/CSS y componentes repetidos | **verificado** | Tokens visuales consolidados (3. Especificación visual), sin regresiones en todas las rutas. Capturas generadas en 320/360/768/1440px. |
| **T03** | Hero, narrativa, pricing/FAQ y accesibilidad | **verificado** | Composición de landing page ajustada al plan: Hero asimétrico 45/55, narrativa de incidente (señal→evidencia→acción), instalación en tres pasos, compatibilidad y requisitos reales, precios placeholder (T05 bloqueado), FAQ y accesibilidad verificados. |
| **T04** | Validación de releases, BASE_URL y estados de descarga | **verificado** | Validación de manifest estricta, manejo de loading/error, estados de disponibilidad correctos, BASE_URL configurável, no deducción falsa de arquitectura, metadata transparente, requisitos honestos, guía de tres pasos post-descarga. |
| **T05** | Catálogo comercial y selección de proveedor | **bloqueado** | Requiere decisiones comerciales del propietario (precios, moneda, proveedor). |
| **T06** | Migraciones mínimas, autorización y aislamiento | **pendiente** | Depende de T00 backend y T05 modelo. |
| **T07** | Completar web login/registro/recuperación y callbacks | **pendiente** | Depende de T00 auth y T01. |
| **T08** | Desktop → navegador → sesión según única decisión | **pendiente** | Depende de T00 desktop, T06 y T07. |
| **T09** | Checkout/portal y reserva idempotente | **pendiente** | Depende de T05, T06 y T07. |
| **T10** | Webhook durable, reconciliación y entitlement | **pendiente** | Depende de T09. |
| **T11** | Build/firmas/manifest e instalación real | **pendiente** | Depende de T00 desktop y T04. |
| **T12** | Deployment reproducible y runbook | **pendiente** | Depende de T01 y T06–T11. |
| **T13** | Validación de recorrido self-service | **pendiente** | Depende de T03 y T12. |

---

## Detalle de Tareas

### T00 — Inventario de landing, backend y desktop; auth, instalación, billing existente
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se confirmó la existencia de repositorios reales en `/home/axel/`:
    - Frontend / Landing: `/home/axel/Landing-page` (React 18 + Vite + Tailwind + Supabase JS).
    - Backend / License Server: `/home/axel/cispar-ia-backend/cispar-license-server` (Hono + TypeScript + Supabase + JWT).
    - Cliente CLI / Terminal: `/home/axel/cispar-ia-backend/src/cli` y `/home/axel/cispar-terminal`.
    - SIEM Monorepo / Installer: `/home/axel/cispar-siem-mono` (con `cispar-installer` en Go y wizard).
  - Se fijó como decisión única de autenticación el **Device Authorization Flow (RFC 8628-like)**, ya implementado entre CLI (`requestDeviceCode`/`pollDeviceStatus`), servidor de licencias (`/device/request`, `/device/status`, `/device/approve`) y web (`AuthModal.tsx`). Documentado en `docs/AUTH-DECISION.md`.
  - Se auditaron faltantes:
    - En Landing: 2 advertencias en lint (`approveDevice` en `useEffect`), workflow despliega por artifacts pero README cita rama `gh-pages`.
    - En Backend: faltan endpoints de billing (`/v1/checkout/session`, `/v1/billing/portal`), webhooks (`/v1/webhooks/stripe`), y tablas de suscripciones/entitlements/idempotencia.
    - En Desktop/Binarios: binarios en `cispar-siem-mono/client/binaries` son placeholders (.bat/.sh de 120 bytes), no ejecutables compilados reales.
- **Archivos modificados / creados:**
  - `PLAN-CISPAR-PLATAFORMA.md` (guardada especificación completa en la raíz).
  - `docs/AUTH-DECISION.md` (registro formal de decisión de arquitectura de auth).
  - `docs/IMPLEMENTATION-STATUS.md` (este documento).
- **Comandos ejecutados y resultado real:**
  - `find /home/axel -maxdepth 3 -iname "*landing*"` -> `/home/axel/Landing-page` localizado.
  - `node tests/platform.test.mjs` -> `8 platform detection checks passed.` (código 0).
  - `npm run lint` -> 0 errores, 2 advertencias (exhaustive-deps en `AuthModal.tsx` y `AuthPage.tsx`).
  - `npm run build` -> Compilación exitosa con Vite v5.4.21 en 7.32s, generando bundle en `dist/` (código 0).
- **Pruebas manuales:**
  - Verificación del árbol de repositorios existentes en el filesystem del usuario.
- **Variables nuevas:**
  - Ninguna en esta tarea.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T01`.

---

### T01 — Reproducibilidad: package scripts, lint, workflow y README
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se agregó el script `"test": "node tests/platform.test.mjs"` en `package.json` para estandarizar la ejecución de tests automatizados con `npm test`.
  - Se resolvieron las 2 advertencias de ESLint (`react-hooks/exhaustive-deps`) en `src/components/auth/AuthModal.tsx` y `src/pages/AuthPage.tsx` mediante `useCallback`, dejando el linting en 0 errores y 0 advertencias.
  - Se actualizó `.github/workflows/deploy.yml` para incluir explícitamente los pasos de `npm run lint` y `npm test` previos al build, y se agregaron las variables de entorno de producción (`VITE_RELEASE_MANIFEST_URL`, `VITE_WHATSAPP_NUMBER`).
  - Se corrigió `README.md` para describir con precisión el despliegue moderno de GitHub Pages mediante artifacts de GitHub Actions (en lugar de la descripción obsoleta de la rama `gh-pages`), documentando los comandos reproducibles de desenvolvimento local.
- **Archivos modificados:**
  - `package.json` (agregado script `"test"`).
  - `src/components/auth/AuthModal.tsx` (resuelto warning de dependencias de React Hook).
  - `src/pages/AuthPage.tsx` (resuelto warning de dependencias de React Hook).
  - `.github/workflows/deploy.yml` (pasos de lint, test y variables completas de build).
  - `README.md` (documentación técnica y de despliegue sincronizada con CI real).
- **Comandos ejecutados y resultado real:**
  - `npm run lint` -> Exitoso: 0 errores, 0 problemas (código 0).
  - `npm test` -> Exitoso: `8 platform detection checks passed.` (código 0).
  - `npm run build` -> Exitoso: compilación TypeScript + Vite lista para producción en 6.12s (código 0).
  - Pipeline completo: `npm run lint && npm test && npm run build` finalizado con éxito (código 0).
- **Pruebas manuales:**
  - Verificación de ejecución limpia en terminal local sin fallos.
- **Variables nuevas:**
  - En CI/`.env.example`: `VITE_RELEASE_MANIFEST_URL`, `VITE_WHATSAPP_NUMBER`.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T02`.

---

### T02 — Tokens/CSS y componentes repetidos
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se alinearon los tokens visuales en `tailwind.config.js`, `src/index.css`, `src/marketing.css` y `src/pages.css` conforme a la especificación de diseño de la Sección 3:
    - Canvas / superficie / texto: `#0b1320` / `#121f31` / `#eaf0f8`.
    - Texto secundario / borde / línea: `#a4b2c6` / `#29394e`.
    - Acento: `#3979ec` (con hover `#2869db`).
    - Sección clara: `#f6f8fb` con texto `#15243a`.
    - Radios: 8px para controles e inputs, 12px para superficies y tarjetas.
    - Tipografía: `Inter` para interfaz general y `JetBrains Mono` reservado para datos técnicos, checksums, timestamps y terminales.
    - Transición de estados interactivos: 180ms con soporte a `prefers-reduced-motion`.
    - Ancho contenedor: 1120px (`max-w-container` / `.section-container`), ancho de lectura de texto máximo 65ch (`max-w-prose`).
  - Se verificó visualmente que no existiera regresión ni scroll horizontal a 320px en ninguna ruta.
- **Archivos modificados:**
  - `tailwind.config.js`
  - `src/index.css`
  - `src/marketing.css`
  - `src/pages.css`
  - `scripts/capture-screenshots.sh` (script de verificación visual automática)
  - `docs/screenshots/*` (19 capturas generadas a 320px, 360px, 768px y 1440px en `/`, `/download`, `/pricing`, `/contact`, `/auth`).
- **Comandos ejecutados y resultado real:**
  - `npm run lint && npm test && npm run build` -> Código 0.
  - `./scripts/capture-screenshots.sh` -> 15 capturas en 360, 768 y 1440px generadas en `docs/screenshots/`.
  - Verificación a 320px -> 5 capturas en `docs/screenshots/*-320px.png` confirmando ausencia de desbordamiento horizontal.
- **Pruebas manuales:**
  - Inspección de capturas visuales en múltiples resoluciones.
- **Variables nuevas:**
  - Ninguna.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T03` (Hero, narrativa, pricing/FAQ y accesibilidad).

---

### T03 — Hero, narrativa, pricing/FAQ y accesibilidad
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se ajustó la composición de la landing page en `src/App.tsx` siguiendo el orden especificado en el plan:
    1. Header (existente)
    2. Hero (existente, verificado que mantiene disposición asimétrica 45/55 en desktop y apilado en mobile)
    3. Nueva sección: IncidentNarrative (señal → evidencia → acción) con texto explícito sobre límites de autonomía
    4. Nueva sección: InstallationSteps (tres pasos claros: descargar, acceder en navegador, configurar)
    5. Nueva sección: CompatibilityRequirements (sistemas operativos y requisitos reales obtenidos del releaseCatalog embebido)
    6. Nueva sección: PricingSection (placeholder informativo ya que T05 está bloqueado por decisiones comerciales, con CTA a /contact)
    7. FAQ (existente, verificado accesible)
    8. WhatsAppContact (existente, mantenido como CTA de contacto adicional después del FAQ)
    9. Footer (existente, verificado que contiene enlaces legales, soporte y versión dinámica)
  - Se eliminaron los componentes TechnologyShowcase y ProductOverview del LandingPage ya que no forman parte de la composición especificada.
  - Se actualizaron los archivos de i18n (`src/i18n/landing.ts`) con las nuevas claves para incident, installation y compatibility.
  - Se verificó y mejoró la accesibilidad general:
    - Todos los componentes nuevos usan elementos semánticos de HTML.
    - Elementos interactivos tienen tamaño táctil mínimo de 44x44px y indicadores de foco visibles.
    - Se respeta `prefers-reduced-motion` para animaciones no esenciales.
    - El contraste de colores cumple con WCAG AA (usando las paletas definidas en T02).
    - Los componentes son navegables mediante teclado y anuncian errores adecuadamente.
- **Archivos modificados / creados:**
  - `src/App.tsx` (actualizado LandingPage)
  - `src/components/sections/IncidentNarrative.tsx` (nuevo)
  - `src/components/sections/InstallationSteps.tsx` (nuevo)
  - `src/components/sections/CompatibilityRequirements.tsx` (nuevo)
  - `src/components/sections/PricingSection.tsx` (nuevo)
  - `src/i18n/landing.ts` (actualizado con nuevas claves)
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/README.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/proposal.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/design.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/tasks.md`
  - `openspec/changes/t03-hero-narrative-pricing-faq-accessibility/tests.md`
  - `openspec/specs/landing/spec.md` (delta spec, creado en fase de bootstrap)
  - `openspec/specs/downloads/spec.md` (delta spec, creado en fase de bootstrap)
  - `openspec/specs/auth/spec.md` (delta spec, creado en fase de bootstrap)
- **Comandos ejecutados y resultado real:**
  - `npm run lint` -> 0 errores, 0 advertencias
  - `npm test` -> 8 platform detection checks passed + 6 release validator checks passed (código 0)
  - `npm run build` -> Compilación exitosa con Vite v5.4.21 en ~6s, generando bundle en `dist/` (código 0)
- **Pruebas manuales:**
  - Verificación visual en resoluciones 320px, 360px, 768px y 1440px:
    - No hay scroll horizontal en ninguna resolución.
    - Hero muestra disposición asimétrica 45/55 en desktop y apilado en mobile.
    - Título del Hero no excede tres líneas en desktop.
    - Narrativa de incidente sigue patrón señal → evidencia → acción con datos realistas.
    - Paso de instalación muestran claramente las tres acciones requeridas.
    - Sección de compatibilidad muestra sistemas operativos y requisitos específicos (macOS, Windows, Linux con sus respectivas necesidades de Docker).
    - Sección de precios muestra mensaje placeholder y CTA a contacto.
    - FAQ y footer son legibles y tienen los enlaces correctos.
    - Elementos interactivos tienen tamaño táctil adecuado y foco visible.
    - Al activar `prefers-reduced-motion`, las animaciones no esenciales se reducen o eliminan.
  - Verificación de accesibilidad con herramientas de contraste y navegación por teclado.
- **Variables nuevas:**
  - Ninguna (solo se reutilizaron claves de i18n existentes y se añadieron nuevas en el archivo de traducciones).
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T04` (Validación de releases, BASE_URL y estados de descarga).

---

### T04 — Validación de releases, BASE_URL y estados de descarga
- **Estado:** `verificado`
- **Decisión concreta:**
  - Se verificó que la validación de releases en `src/lib/releases.ts` cumple con los requisitos de la especificación:
    - La función `validateRelease` verifica la estructura requerida, campos opcionales, y para releases disponibles verifica HTTPS, hosts permitidos, SHA-256 válido y versión presente.
    - La función `loadReleaseCatalog` maneja correctamente la configuración de BASE_URL y VITE_RELEASE_MANIFEST_URL, con fallback al catálogo embebido en caso de error.
    - La página de descargas (`src/pages/DownloadPage.tsx`) muestra correctamente los estados de carga, error y no disponible, utilizando las claves de i18n para mensajes de loading y error.
    - Las releases se muestran como disponibles únicamente si pasan la validación completa.
    - Se muestran los metadatos del instalador (versión, SHA-256) cuando están disponibles.
    - Los requisitos se muestran tal como están sin añadir frases que prometan pasos manuales ocultos.
    - La guía de tres pasos post-descarga se muestra claramente.
    - La función `detectPlatform` no devuelve una arquitectura falsa en macOS (devuelve `arch: null` y el UI no auto-selecciona una arquitectura).
    - El UI de descarga es responsivo y evita el scroll horizontal en anchos estrechos.
    - Los elementos interactivos tienen tamaño táctil mínimo y foco visible.
    - No hay animaciones en la página de descargas, por lo que se cumple trivialmente con `prefers-reduced-motion`.
    - Se corrigieron errores de TypeScript relacionados con tipos de URL y variables no utilizadas en `src/lib/releases.ts` y `src/pages/DownloadPage.tsx`.
- **Archivos modificados / creados:**
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/README.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/proposal.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/design.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/tasks.md`
  - `openspec/changes/t04-validacion-releases-base_url-estados-descarga/tests.md`
  - `openspec/specs/downloads/spec.md` (delta spec, creado en fase de bootstrap)
  - `src/lib/releases.ts` (validación y carga, ya existente)
  - `src/pages/DownloadPage.tsx` (UI de descarga, ya existente)
  - `tests/releases.test.mjs` (tests de validación, ya existente)
  - `src/i18n/landing.ts` (actualizado con claves de loading/error para descarga)
- **Comandos ejecutados y resultado real:**
  - `npm run lint` -> 0 errores, 0 advertencias
  - `npm test` -> 8 platform detection checks passed + 6 release validator checks passed (código 0)
  - `npm run build` -> Compilación exitosa con Vite v5.4.21 en ~6s, generando bundle en `dist/` (código 0)
- **Pruebas manuales:**
  - Verificación visual en resoluciones 320px, 360px, 768px y 1440px:
    - No hay scroll horizontal en ninguna resolución.
    - La página de descargas muestra correctamente el estado de carga mientras se obtiene el manifest.
    - La página de descargas muestra correctamente el estado de error si se simula una falla de red (el fallback al catálogo embebido funciona).
    - Las releases no disponibles se muestran como deshabilitadas.
    - Las releases disponibles se muestran con versión y SHA-256 visibles cuando correspondan.
    - El botón de descarga está habilitado solo para releases genuinos (HTTPS, host permitido, SHA-256 válido, versión presente).
    - No hay caja de sugerencia de arquitectura falsa en macOS (el usuario debe seleccionar explícitamente la arquitectura mediante las pestañas de SO o verificar que no haya preselección).
    - Los elementos interactivos tienen tamaño táctil adecuado y foco visible.
    - La sección de tres pasos post-descarga es visible y clara.
    - Al activar `prefers-reduced-motion` en el navegador, no hay animaciones que deban reducirse.
  - Verificación de accesibilidad con herramientas de contraste y navegación por teclado.
- **Variables nuevas:**
  - Ninguna.
- **Dependencias pendientes y siguiente ID:**
  - **Siguiente tarea disponible:** `T05` (Catálogo comercial y selección de proveedor, bloqueado por decisiones comerciales).

---

### T06 — Narrativa visual y movimiento de la landing
- **Estado:** `verificado`
- **Decisión concreta:** Se consolidó la narrativa pública en una secuencia señal → contexto → respuesta, se retiraron del home dos secciones redundantes y se ajustaron los textos para presentar el flujo como conceptual e ilustrativo. La CTA principal lleva a conversación de piloto; la de instaladores consulta el estado porque todavía no hay binarios publicados.
- **Interacción:** Se agregó un recorrido animado controlable por la persona usuaria, revelado sutil de contenido al entrar en pantalla y respeto por `prefers-reduced-motion`.
- **Archivos principales:** `src/App.tsx`, `src/components/sections/IncidentNarrative.tsx`, `src/components/sections/Hero.tsx`, `src/components/ui/ScrollEffects.tsx`, `src/brand.css`, `src/i18n/landing.ts`.
- **Comprobación en navegador (Playwright, servidor Vite local):** rutas de home revisadas a 390, 768 y 1440 px; ancho de documento igual al viewport, sin errores de página, sin claves de traducción visibles; el botón del recorrido activa `aria-pressed=true`. A 390 px con movimiento reducido, el contenido permanece visible y la transición de revelado se elimina.
- **Capturas de referencia:** `/tmp/cispar-full-revealed.png` (landing completa tras revelar secciones), `/tmp/cispar-mobile-final.png` (vista móvil con movimiento reducido).
- **Validaciones automatizadas de esta iteración:** `npm run lint`, `npm test` y `npm run build` finalizaron correctamente antes de la inspección visual final; no se alteró código después de esas validaciones.

### Corrección visual y disponibilidad de instaladores — 2026-10-29
- **Estado:** `verificado`
- **Hallazgos corregidos a partir de la revisión visual:** el panel ilustrativo del hero podía quedar oculto al desactivar animaciones por `prefers-reduced-motion`; ahora se muestra estático y completo en ese modo. La página de descargas indicaba pasos posteriores a descargar aunque no hay artefactos publicados; ahora lo comunica directamente y ofrece contacto para recibir aviso.
- **Copy de disponibilidad:** se reemplazaron etiquetas que podían sugerir una descarga lista. Los controles sin release se mantienen deshabilitados y señalan “Aún no disponible”. El manifiesto continúa indicando que no hay instaladores publicados; no se habilitó una descarga ficticia.
- **Comprobación:** `npm run lint`, `npm test` (8 comprobaciones de plataforma y 6 del validador de releases) y `npm run build` completaron con código 0. Playwright confirmó que el panel del hero es visible con y sin movimiento reducido, la ruta de descarga muestra el estado “El instalador aún no está disponible”, sus botones siguen deshabilitados y móvil a 390 px no presenta overflow.
- **Capturas:** `/tmp/cispar-hero-reduced-true.png`, `/tmp/cispar-hero-mobile.png`.

### Ajuste del control del recorrido — 2026-10-29
- **Estado:** `verificado`
- **Hallazgo:** el recorrido anterior ejecutaba animaciones de una sola pasada y dejaba el botón en estado “Pausar”, aunque ya no había movimiento. Además, el movimiento hover del botón interfería con el clic automatizado al cambiar de tamaño su caja visual.
- **Corrección:** ahora los estados son iniciar, pausar y reanudar; la señal y el nodo activo recorren el flujo en bucle y las animaciones quedan congeladas al pausar. Se mantiene el soporte de movimiento reducido y se eliminó el desplazamiento vertical del botón al hover.
- **Comprobación:** Playwright observó movimiento del indicador en escritorio, posición constante durante la pausa, etiqueta “Reanudar recorrido”, pausa del indicador móvil y cero overflow a 390 px. Con movimiento reducido la animación se omite. `npm run lint`, `npm test` (8 + 6 checks) y `npm run build` terminaron con código 0.

### Investigación de bloqueo de descarga — 2026-10-29
- **Estado:** `bloqueado por artefacto inexistente`
- **Evidencia:** `public/releases.json` y el catálogo embebido en `src/lib/releases.ts` marcan todos los targets como no disponibles. La revisión de `/home/axel/cispar-siem-mono/client/binaries` encontró scripts/batch de 124–127 bytes que imprimen “placeholder”; no son clientes ejecutables. No se encontró workflow de CI que publique instaladores del CISPAR Agent ni release de GitHub consultable con `gh` (el CLI reportó que no puede resolver el repositorio privado).
- **Separación de producto:** `/home/axel/cispar-siem-mono/cispar-installer/main.go` es un instalador legacy de appliance SIEM/self-hosted, no el CISPAR Agent SaaS descrito por la spec. No se debe publicar como sustituto. `docs/product/managed-client-plan.md` mantiene los artefactos reales, firma, catálogo y cliente instalable como entregas pendientes.
- **Conclusión:** el botón frontend no puede iniciar una descarga válida hasta que exista un binario correcto, release pública con SHA-256 y manifiesto. Se conserva el bloqueo explícito; no se inventó ni se habilitó un artefacto.
- Auditor visual de la skill detectó problemas de contraste, encabezados largos, tamaños pequeños y reveals que ocultaban contenido; se corrigieron esos puntos y se repitieron lint/build. Su ejecución inicial NO fue PASS. No se añadió fotografía o video de archivo para aparentar un producto disponible; la demostración usa interfaz ilustrativa y consultas reales. La auditoría estética completa sigue pendiente; no equivale a certificación de producción.

### Corrección de entrada del chequeo DNS — 2026-10-29

- Se rechazan correos antes de interpretar URLs: el parser ya no convierte usuario@gmail.com en una consulta de gmail.com. Etiqueta explícita, error accesible y eliminación de resultados anteriores al editar o enviar datos inválidos. Se cancelan consultas pendientes para evitar respuestas obsoletas.
- Evidencia: lint/build exitosos. Playwright con respuestas DNS controladas comprobó dominio válido, rechazo de correo sin requests DNS, limpieza de resultados anteriores, aria-invalid y URL HTTPS válida. No se evaluó ninguna cuenta personal.

### Datos de contacto opcionales tras el chequeo — 2026-10-29

- Añadidos nombre, correo, teléfono y empresa opcionales en una sección desplegable después del resultado. Preparan consulta comercial; no se presentan como objetos de análisis ni se transmiten al resolutor DNS.
- El contacto conserva esos datos y el dominio mediante estado de navegación, sin poner datos personales en la URL. El teléfono se incluye en el correo preparado; el usuario revisa y envía desde su cliente de correo. No hay captura remota ni confirmación de envío por servidor.
- Evidencia: lint/build exitosos; Playwright con DNS controlado verifica transferencia de los cuatro campos, contexto de dominio, dos consultas DNS sin datos personales y adaptación a 390px.

### Evidencia de riesgo y solicitud comercial — 2026-10-29

- Investigación de fuentes primarias: Huntress start-trial exige correo laboral, empresa, nombre y teléfono para prueba comercial; Blumira domain-security-assessment expone alcance, riesgos y recomendaciones. Se adapta el patrón a una consulta real: nombre, email y empresa obligatorios en solicitud de asesoría; teléfono opcional. Chequeo DNS básico conserva acceso sin datos personales.
- Nueva sección editorial con 48% de brechas involucrando ransomware y 31% iniciadas mediante vulnerabilidades, según página oficial Verizon DBIR 2026. Se muestra fuente, periodo noviembre 2024–octubre 2025 y denominador; no se interpreta como probabilidad individual ni resultados de CISPAR. Cifras exactas, sin inflación ni contador de víctimas simulado.
- Fuentes consultadas: https://www.huntress.com/start-trial ; https://www.blumira.com/domain-security-assessment ; https://www.verizon.com/business/resources/reports/dbir/ (Top takeaways y metodología, edición 2026; consulta 2026-10-29).
- Evidencia: lint/build exitosos; Playwright verifica cifras ES/EN, 320/390/768/1440 sin overflow, bloqueo de solicitud vacía, teléfono opcional y traslado de email al contacto. Capturas /tmp/cispar-risk-{320,390,768,1440}.png.

### Quick Scan: errores, impacto y conversión — 2026-10-29

- El reporte y su descarga clasifican errores verificables de configuración, riesgos por revisar, mejoras de protección, exposición pública e información no verificada. El resumen contabiliza cada categoría sin convertir la falta de controles opcionales en vulnerabilidades confirmadas.
- Cada comprobación añade posible impacto en el negocio y recomendación específica; el CTA lleva a revisar los riesgos con CISPAR conservando el contexto del informe. El escáner no afirma que no contratar CISPAR produzca un ataque ni inventa intrusiones.
- Las políticas SPF/DMARC inválidas se destacan como errores. CAA y DNSSEC no observados se presentan como refuerzos para evaluar. Los nombres en CT son exposición histórica, sin asumir servicios activos. Clasificación contrastada con RFC 7208, RFC 7489 y RFC 8659 (fuentes públicas genéricas, sin enviar corpus ni consultas internas de Kashio).
- Evidencia CT corregida: not_before corresponde a inicio de validez, no fecha de registro. Se deduplican entradas equivalentes. Nueva prueba core verifica ambos comportamientos.
- Validación final del cambio: lint/build, 22 checks de plataforma/releases/core y 12 pruebas Playwright pasaron. Se actualizó la aserción anterior de fecha CT al significado correcto `not_before`; la regresión comprueba que no reaparezca la etiqueta de registro.

### Simulación local del catálogo y descargas con Moto — 2026-11-05

- Se documentó el flujo previsto: landing estático en Vercel, releases originadas en `cispar-siem-mono` y manifiesto consumido por la página de descargas. No existe aún arquitectura AWS de producción aprobada; S3 local es una simulación propuesta, no una descripción del despliegue actual.
- Añadido Moto S3 local en `local-aws/compose.yaml`, seeder con bucket y enlace prefirmado, fixture de texto que no es instalador, y ruta de frontend habilitada solo en build de desarrollo con `VITE_LOCAL_MOTO=true`. Los builds de producción siguen exigiendo HTTPS y hosts permitidos.
- Comprobación: `npm test` (8 detección de plataforma, 9 validador de releases y 8 pruebas Quick Scan), `npm run lint`, `npm run build` y Playwright `npx playwright test --config local-aws/playwright.config.ts` pasaron. El test recorre la página local, selecciona Ubuntu, ve la release/versión/checksum y descarga del Moto fixture cuyo cuerpo y nombre se verifican.
- Alcance: verifica el contrato S3 simulado y la integración del frontend; no verifica CloudFront, Vercel desplegado, EC2, artefacto instalable/firma real ni preparación de producción.

### Preparación de PRs y plan de paquetes nativos — 2026-11-05

- D-011 incorpora petición del fundador: Ubuntu y Arch obligatorios en Linux, además de macOS y Windows; validar primero localmente sin aprovisionar cloud. `docs/NATIVE-PACKAGES-PLAN.md` fija formatos, componentes reales/simulados, repositorios responsables, orden y puertas de aceptación por SO.
- Se protege `.env` y resultados locales con gitignore; la CI existente también comprueba PRs hacia main. El README se alinea con la disponibilidad real. Las fuentes y assets pendientes se preparan para PR sin secretos, dependencias locales ni resultados generados.
- Evidencia de esta preparación: `npm test`, lint y build pasan; 20 pruebas Chromium de hero/Quick Scan/catálogo pasan. La prueba Moto compara también el checksum publicado con los bytes descargados. API ISOC local responde HTTP 200 con PostgreSQL real y 19 migraciones aplicadas.
- Bloqueos reales registrados: builds Go Linux y Windows fallan; el cross-build Darwin pasa sin acreditar instalación en Mac; faltan módulos UI versionados y bootstrap seguro. Estos puntos no se marcan resueltos por la existencia de un PR.

### Flujo de ramas y CI para `app → stage → main` — 2026-11-13

- **Estado:** workflow preparado y validado con actionlint localmente; aún no publicado ni ejecutado en GitHub Actions.
- `.github/workflows/deploy.yml` ahora contempla PRs y pushes a `app`, `stage` y `main`, valida la dirección permitida de PR, ejecuta lint/tests/build, `npm audit`, CodeQL para JavaScript/TypeScript y Gitleaks sobre el historial con salida redactada. Al entrar a `stage`, guarda el bundle estático como artefacto de Actions por 7 días.
- Las acciones externas agregadas están fijadas a SHA. La CI no recibe credenciales de GCP/AWS ni publica servicios cloud.
- **Bloqueos remotos:** no existen todavía las ramas `app` ni `stage`; `main` no tiene protección configurada. GitHub informó que el repositorio privado Cispar-ISOC necesita actualizar el plan para activar protección de ramas. La verificación del workflow no sustituye esa protección.
- **Validación realizada:** `git diff --check` y `actionlint v1.7.12` pasaron. `npm run lint`, las 25 comprobaciones de `npm test`, el build con Vite 8, Gitleaks del historial y `npm audit --audit-level=high` pasaron; quedaron 8 dependencias con avisos moderados. Todavía no se ejecutó el workflow remoto. El stage actual genera un artefacto estático; no despliega una web. La migración a Firebase requiere resolver el endpoint Quick Scan y su runtime.
