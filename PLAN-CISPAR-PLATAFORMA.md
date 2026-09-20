# CISPAR — Plan ejecutable para otra IA
Versión 2 · 19 de septiembre de 2026
Estado: especificación de trabajo; no acredita implementación ni deployment.
Este documento sustituye el plan anterior.

## 0. Cómo usar este documento y ahorrar costo

Objetivo: una persona descarga CISPAR, instala, inicia sesión en su navegador, paga si corresponde y empieza a usarlo sin que el equipo le cree una cuenta o licencia manualmente.

La IA debe ejecutar una tarea por vez, leer solamente sus archivos relacionados y conservar un registro breve en docs/IMPLEMENTATION-STATUS.md. Este plan tiene contexto suficiente para empezar por T00; no es necesario volver a investigar toda la arquitectura en cada sesión.

Reglas de ejecución:

1. Leer las instrucciones del repositorio y revisar git status. Preservar cambios ajenos.
2. Empezar por T00. No asumir que el backend o el cliente desktop no existen.
3. Reutilizar framework, infraestructura y módulos existentes. No cambiar a Tauri, Next.js u otro stack por preferencia.
4. Ejecutar únicamente las tareas cuyas dependencias estén resueltas. Avanzar frontend mientras faltan repositorios o credenciales.
5. Reutilizar contratos reales si difieren de los nombres propuestos; documentar el mapeo una vez.
6. No inventar precios, métricas, clientes, certificaciones, capacidades, secretos ni releases.
7. No construir un servidor OAuth ni algoritmos criptográficos desde cero. Usar proveedor/librería mantenida y validada.
8. Preparar código, migraciones, configuración y pruebas localmente. Registrar por separado qué requiere credenciales, certificados o acceso a infraestructura.
9. Reportar resultado, archivos, comprobaciones y pendientes. No repetir todo el plan.
10. No declarar terminado lo probado únicamente con mocks; identificar explícitamente pruebas locales, sandbox y producción.

### Prompt para pegar a la otra IA

> Lee PLAN-CISPAR-PLATAFORMA.md y las instrucciones del repositorio. Ejecuta T00 y registra los hallazgos en docs/IMPLEMENTATION-STATUS.md. Después implementa la siguiente tarea disponible, respetando dependencias y contratos. Conserva el stack y cambios existentes. No vuelvas a planear el proyecto completo. Verifica el resultado con las pruebas indicadas y entrega un resumen breve con archivos modificados, evidencia y siguiente tarea. Si falta un repositorio o una decisión comercial, registra el bloqueo y continúa las tareas independientes. No publiques ni contrates servicios como consecuencia implícita de este documento.

## 1. Buenas prácticas y límites de confianza

| Responsabilidad | Dueño |
|---|---|
| Identidad, contraseñas, recuperación y sesión web | Supabase Auth, ya integrado |
| Permisos del producto y dispositivos | Backend CISPAR |
| Cobro y estado de transacciones | Proveedor de pagos |
| Permisos efectivos persistidos | DB, actualizada por backend |
| Presentación y navegación | Frontend |
| Instalación y credenciales locales | Cliente desktop |
| Construcción y firma de paquetes | CI del producto |

El frontend y el ejecutable son clientes públicos: sus variables y binarios pueden inspeccionarse. Cada operación protegida debe validar identidad, propiedad del recurso y permiso en servidor. Ocultar un botón no es autorización.

El backend valida firma, emisor, audiencia y expiración del token con el mecanismo admitido por el proveedor. Decodificar un JWT no lo valida. No confiar en un user_id, email, plan o metadata enviado por el cliente para conceder permisos.

Enviar un access token al backend propio mediante HTTPS es normal. Preferir Authorization: Bearer y redacción de logs. El problema sería aceptarlo sin validación, filtrarlo, reutilizarlo indebidamente o enviarlo a otro destinatario.

Las URLs públicas de instaladores son normales. Descargar el ejecutable no equivale a comprar acceso. La protección real corresponde al backend; un software totalmente local puede ser modificado por su propietario y no admite garantías absolutas contra evasión de licencia.

### Hashing, cifrado y datos

| Dato | Tratamiento |
|---|---|
| Contraseña | La administra y hashea Supabase Auth; no duplicarla en profiles |
| Token propio aleatorio de alta entropía | Guardar digest criptográfico para verificarlo; no usar un hash de contraseña lento por defecto |
| Token del proveedor que el servidor necesita reutilizar | Cifrado recuperable y acceso restringido; un hash no permite reutilizarlo |
| Email/datos de facturación necesarios | Minimizar, controlar acceso y retención; no hashear indiscriminadamente |
| Datos de tarjeta/CVV | Checkout alojado; no recibirlos ni guardarlos |
| Refresh token desktop | Almacén seguro del sistema operativo |
| Secreto de Stripe, DB o firma | Secret manager/CI; nunca VITE_*, bundle o ejecutable |

RLS y grants en tablas expuestas; pruebas de aislamiento entre dos usuarios. Las credenciales privilegiadas omiten RLS: las rutas del backend deben aplicar su propia autorización. Logs sin tokens, URLs de sesión ni payloads sensibles completos.

## 2. Evidencia disponible y asuntos pendientes

Repositorio inspeccionado: /home/axel/Landing-page.

| Hallazgo | Evidencia | Consecuencia |
|---|---|---|
| React 18, TypeScript, Vite, Supabase JS | package.json | Conservar stack |
| Auth web y autorización de dispositivo | src/context/AuthContext.tsx; src/components/auth/AuthModal.tsx | Auditar flujos existentes antes de reemplazar |
| Endpoint de plataforma referenciado | VITE_PLATFORM_API_URL | La URL debe apuntar a Cispar-platform y ser HTTPS en producción |
| HashRouter y base /Landing-page/ | src/App.tsx; vite.config.ts | Coordinar rutas, callbacks y hosting |
| Catálogo con todas las releases no disponibles | public/releases.json | No habilitar descargas ficticias |
| Manifest sin validación estructural estricta | src/lib/releases.ts | Validar campos y URLs antes de enlazar |
| Seis hojas CSS globales cargadas | src/main.tsx | Consolidar por componente evitando regresiones |
| Tests de detección de plataforma | tests/platform.test.mjs | Reutilizarlos |
| Workflow de Pages mediante artifacts | .github/workflows/deploy.yml | README describe incorrectamente despliegue a rama gh-pages |
| Build env omite manifest/WhatsApp | .github/workflows/deploy.yml; .env.example | Revisar configuración de producción |

No se revisaron backend, repositorio desktop, cuenta Supabase, cuenta de pagos ni infraestructura. Tampoco se realizó una auditoría visual renderizada o un build en esta revisión del plan.

### Decisiones fijadas para ahorrar trabajo

- Conservar React/Vite y Supabase Auth.
- Ampliar el backend existente cuando se entregue su código.
- Descarga pública; permisos de uso en backend.
- Conservar las plataformas ya funcionales. Si no existe ningún instalador, priorizar Windows x64 por la necesidad expresada del .exe.
- Conservar email/password y Google donde ya funcionen; agregar MFA, SSO o magic links cuando los requisitos de producción, clientes o riesgo lo justifiquen y se documente la decisión.
- No crear organizaciones, invitaciones ni roles empresariales salvo que el producto existente ya los requiera.
- No agregar microservicios, Kubernetes, Redis ni una cola externa sin necesidad demostrada. Una tabla durable de trabajos y un worker pueden ser suficientes.
- No prometer modo offline ni crear licencias firmadas propias hasta revisar cómo opera el producto.
- Dominios del plan son ejemplos, no recursos confirmados.

### Decisiones que bloquean únicamente su módulo

| Decisión pendiente | Evidencia necesaria | Mientras falta |
|---|---|---|
| Framework y login desktop | Código del cliente + backend | Trabajar UI y contratos propuestos |
| Precio, moneda, unidad de cobro, límite de dispositivos | Decisión del propietario | Tests con catálogo sandbox; no publicar precios |
| País fiscal, cuenta bancaria, mercados y facturación | Datos del negocio | Comparación de proveedores |
| Offline y vencimiento durante protección activa | Comportamiento real y política de producto | No implementar apagado automático |
| Hosting y dominio | Configuración/acceso actuales | Preparar build y runbook |

## 3. Frontend: especificación visual concreta

Dirección: herramienta de seguridad precisa y editorial. Conservar el logo. Hero oscuro, una sección clara de explicación y capturas reales como protagonista. No inventar una consola que aparente ser producto real: si se usa una simulación, etiquetarla “Ejemplo ilustrativo”.

Propuesta estética inicial, no una afirmación de que ya fue validada visualmente:

| Token | Valor |
|---|---|
| Tipografía | Conservar Inter; verificar carga efectiva y licencia antes de self-hosting |
| Datos técnicos | JetBrains Mono, solo códigos, timestamps y checksums |
| Canvas / superficie / texto | #0b1320 / #121f31 / #eaf0f8 |
| Texto secundario / borde | #a4b2c6 / #29394e |
| Acento | #3979ec; verificar contraste en cada combinación |
| Sección clara | #f6f8fb con texto #15243a |
| H1 | clamp(40px, 4.8vw, 68px), line-height 1.05, peso 650 |
| H2 / texto / texto pequeño | 32–44px / 16–18px / mínimo 14px para texto de lectura |
| Ancho | 1120px; texto corrido máximo 65ch |
| Espaciado | 4, 8, 12, 16, 24, 32, 48, 64, 96px |
| Radios | 8px controles; 12px superficies |
| Movimiento | 150–220ms para estados; respetar reduced motion |

Composición:

1. Header: logo, Producto, Descargas, Precios, Acceder; un CTA principal.
2. Hero asimétrico 45/55: promesa concreta y verificable + captura; título máximo tres líneas en desktop.
3. Historia de un incidente: señal → evidencia → acción; con datos anonimizados y límites de autonomía explícitos.
4. Instalación en tres pasos: descargar, acceder en navegador, configurar.
5. Compatibilidad, permisos y requisitos reales.
6. Precios cuando estén definidos; aclarar unidad de cobro y renovación.
7. FAQ y footer con privacidad, términos, soporte y versión.

No repetir una cuadrícula de tarjetas en cada sección, ni usar gradientes de texto, efectos de escritura interminables, logos de clientes ficticios o badges de compliance sin respaldo.

Crear componentes compartidos solo cuando haya usos repetidos. Consolidar las seis hojas CSS progresivamente; no borrar estilos porque parezcan antiguos sin revisar imports y rutas.

Aceptación visual: capturas antes/después en 360, 768 y 1440px; sin scroll horizontal a 320px; teclado, focus visible, errores anunciados, modal con foco contenido y retorno al disparador. WCAG AA para contraste. LCP ≤2.5s, CLS ≤0.1 e INP ≤200ms son objetivos de campo al p75; Lighthouse local sirve como aproximación, no como prueba de usuarios reales.

## 4. Auth: dos flujos distintos, una decisión explícita

### Web

Mantener Supabase para login, alta, verificación de email, recuperación y cierre de sesión. Usar PKCE donde el flujo OAuth lo requiera; esto no significa agregar PKCE al login directo por contraseña.

Callback fijo y permitido, separado de la autorización del dispositivo. Guardar solo el identificador no secreto de la operación pendiente durante la redirección. No usar window.location.href sin validación como redirect genérico.

Revisar en AuthModal y AuthContext: aprobación automática al SIGNED_IN, cierre del modal antes de confirmar dispositivo, usuario ya autenticado, callback duplicado, error de Google, código capturado con valor antiguo y fallos al obtener sesión. La aprobación de dispositivo debe requerir acción explícita y mostrar qué equipo se autoriza.

### Desktop

Preferencia para una app gráfica nueva con navegador disponible: Authorization Code + PKCE S256 mediante proveedor compatible, navegador del sistema y callback loopback en 127.0.0.1 con puerto efímero. El cliente conserva verifier/state, valida state y canjea el código. No integrar contraseñas en webviews.

No asumir que la configuración actual de Supabase soporta automáticamente este flujo desktop: verificar proveedor, versión, registro del cliente y reglas de redirect. El PKCE iniciado en el navegador web no permite por sí solo canjear el código desde el .exe, que no tiene su verifier.

Si el backend/CLI existente ya usa autorización por dispositivo, puede conservarse después de auditarlo. Es una alternativa basada en polling, no una mezcla con el callback PKCE:

1. Desktop solicita una operación; recibe device_code secreto, user_code mostrable, verification_uri, expires_in e interval.
2. Abre el navegador con verification_uri y, opcionalmente, user_code. Nunca incluir device_code en la URL.
3. Web autentica al usuario y muestra código/equipo para aprobación explícita.
4. Backend valida usuario, caducidad, intentos y uso único.
5. Desktop consulta con device_code respetando interval, authorization_pending y slow_down.
6. Aprobación entrega credenciales solo al cliente que conoce el secreto; denegación o expiración finalizan la operación.

T00 debe registrar una sola elección en docs/AUTH-DECISION.md, con evidencia del cliente y servidor. Si falta código, esa tarea queda pendiente: no implementar ambos flujos “por si acaso”. RFC 8628 explica device flow y RFC 8252 la alternativa nativa.

### Sesiones y permisos

- Identidad verificada no equivale a suscripción pagada.
- Un usuario sin plan puede acceder a su cuenta y comprar.
- Cada instalación tiene sesión revocable independiente. No copiar la sesión web al desktop por URL.
- Reutilizar refresh/rotación del proveedor cuando sea posible. Si ya existen sesiones propias, revisar revocación, expiración y protección contra reutilización.
- Logout local borra credenciales y revoca esa sesión; “cerrar todas” es una operación distinta.
- El backend verifica revocación en operaciones sensibles; documentar cuánto puede seguir válido un access token ya emitido.
- El registro de una instalación es distinto de la sesión y del consumo de una plaza del plan.
- No persistir credenciales en plaintext si falta almacén seguro: mostrar error recuperable o usar sesión temporal.

## 5. Datos mínimos y contratos propuestos

Usar migraciones del backend existente. El esquema siguiente aplica al primer producto comercial de producción; si ya hay organizaciones, conservarlas y adaptar owner_id con pruebas de aislamiento.

| Tabla | Campos y restricciones principales |
|---|---|
| profiles | user_id PK/FK a auth.users, display_name, created_at |
| billing_customers | user_id FK, provider, provider_customer_id; unique(provider,user_id) y unique(provider,provider_customer_id) |
| subscriptions | id PK, user_id FK, provider, provider_subscription_id único por proveedor, provider_customer_id indexado NO único, plan_key, status, current_period_end, cancel_at_period_end |
| entitlements | user_id + product_key únicos, status, valid_until, source_subscription_id, updated_at |
| devices | id PK, user_id FK, installation_id, platform, arch, version, revoked_at; unique(user_id,installation_id) |
| webhook_events | provider + event_id PK, estado pending/processing/processed/failed, attempts, next_attempt_at, lease_until, received_at, processed_at |
| idempotency_keys | user_id + operation + key únicos, request_hash, estado, respuesta saneada, expires_at |
| audit_log | id, actor, action, target, timestamp y metadata mínima |

Tablas de autorización temporal o sesiones solo si el flujo elegido las necesita. No duplicar sesiones administradas por el proveedor. No crear licenses si el producto puede consultar entitlements online y no usa ya licencias.

Los siguientes endpoints son nombres propuestos; T00 los mapea a los existentes:

| Endpoint | Entrada | Resultado |
|---|---|---|
| GET /health | Sin credenciales | Estado mínimo, sin configuración interna |
| GET /v1/me | Sesión válida | id y perfil del dueño |
| GET /v1/entitlements | Sesión válida | status, features, validUntil, límites reales |
| POST /v1/checkout/session | Sesión + Idempotency-Key; {planKey} | {checkoutUrl, checkoutSessionId} |
| POST /v1/billing/portal | Sesión válida | {url} para Customer del usuario |
| GET /v1/devices | Sesión válida | Solo instalaciones propias |
| POST /v1/devices | Sesión desktop, installationId y plataforma | Registro idempotente; límite validado transaccionalmente |
| POST /v1/devices/:id/revoke | Sesión del dueño | Revocación repetible sin efectos duplicados |
| POST /v1/webhooks/stripe | Body raw y firma | 2xx tras persistencia durable |
| GET releases.json | Público | Manifest validado |

JSON de error de aplicación: {error:{code,message,requestId}}. Usar 401 para sesión inválida, 403 para recurso/permiso prohibido, 409 para conflicto de operación y 429 para límite. Errores OAuth conservan el formato del estándar. Respuestas sensibles: Cache-Control: no-store.

No aceptar user_id, importe o return URL arbitrarios en checkout. Backend deriva usuario de la sesión, plan del catálogo y redirects de configuración permitida.

## 6. Pagos e idempotencia

Stripe Checkout + Billing + Portal es candidato inicial por encaje técnico; la elección comercial sigue pendiente. No considerar que Checkout/Billing resuelven automáticamente obligaciones fiscales o emisión de CFDI.

| Opción | Cuándo evaluarla | Costos/requisitos por confirmar |
|---|---|---|
| Stripe | Control del checkout, suscripciones e integración propia | País de entidad, procesamiento, Billing, cambio de moneda, impuestos, disputas y facturación local |
| Paddle | Delegar venta como merchant of record para software elegible | Aprobación del producto/empresa, comisión, payouts, reembolsos y tratamiento contable |

Precios cambian y dependen del contrato. Antes de contratar, comparar costo total para 100 y 1000 ventas mensuales usando ticket promedio y moneda reales. Fórmula: infraestructura + procesamiento porcentual + cargos fijos + Billing/impuestos/FX + reembolsos/disputas aplicables. Conservar fecha, URL y supuestos. No hace falta integrar dos proveedores.

### Checkout

Crear/reutilizar Customer con restricción única, bloqueo o reconciliación ante carrera. Mantener una intención de compra activa por usuario/producto para reducir checkouts paralelos. Reusar Idempotency-Key en retries de la misma intención y el mismo payload; no generar otra llave en cada intento de red.

La DB reserva la operación atómicamente; payload diferente con misma llave devuelve 409. Guardar el id de operación del proveedor para recuperar resultados tras timeout. La llave no sustituye las restricciones de negocio cuando su retención vence.

### Webhooks

Verificar firma sobre body raw antes de procesar. Persistir evento de forma durable antes de responder 2xx. Duplicado processed: 2xx. Duplicado pending/failed: asegurar que quede reintentable; la mera existencia del ID no demuestra procesamiento.

Worker reclama mediante bloqueo/lease, actualiza estado y aplica cambios de negocio en transacción. Tras caída, la lease vence y otro intento continúa. Si la DB no persiste, devolver error para permitir redelivery. Añadir backoff, límite de intentos, alerta y replay controlado.

No asumir orden de eventos. Serializar por suscripción y reconciliar con estado actual del proveedor cuando haya ambigüedad. Eventos de efectos externos, como email, requieren deduplicación propia.

Eventos concretos se fijan según integración y versión API; incluir suscripción creada/actualizada/eliminada, factura pagada/fallida y finalización de Checkout. checkout.session.completed por sí solo no demuestra pago de métodos diferidos.

### Permisos después del pago

| Estado | Comportamiento |
|---|---|
| Compra iniciada o pago pendiente | Mostrar “Confirmando pago”; consultar backend con tiempo límite y opción de reintentar |
| Pago confirmado/suscripción habilitada | Activar según política persistida |
| Cancelación al final del periodo | Mantener acceso hasta la fecha aplicable |
| past_due | Aplicar gracia explícita; no inventar plazo |
| incomplete/unpaid/expired | No conceder nuevos permisos pagados |
| Reembolso/disputa | Aplicar política definida; no equipararlo automáticamente a cancelación |

Un problema de facturación no debe ejecutar una acción peligrosa de apagado de protección ni borrar evidencia. Definir con el propietario el comportamiento seguro del producto antes de habilitar enforcement.

## 7. Descargas y lo que debe entregar el backend/producto

Conservar formato actual {releases:[...]} para evitar romper el frontend. Extenderlo con campos opcionales version, sizeBytes, publishedAt, sha256 y channel. No sustituirlo por un manifest de updater incompatible.

Para available:true exigir id, os, arch, requisitos, versión, URL HTTPS de host permitido, tamaño y SHA-256 de 64 caracteres hexadecimales. Validar datos en runtime; un cast TypeScript no valida JSON. Mantener todos los targets no publicados como no disponibles.

Entrega mínima por paquete: instalador real, plataforma/arquitectura, versión, requisitos probados, checksum, firma nativa cuando aplique, changelog, compatibilidad con API y evidencia de instalación limpia.

Pipeline: construir → probar instalación → firmar → calcular hash final → subir asset inmutable → comprobar descarga → publicar manifest. Un fallo antes del último paso no habilita el botón. El manifest del updater será el exigido por el cliente existente y se publicará aparte si difiere.

La descarga web normal usa un enlace directo; no cargar cientos de MB en memoria de React para “verificar”. Mostrar checksum ayuda al usuario; la verificación obligatoria del updater pertenece al cliente nativo. Hash y firma tienen propósitos distintos.

El frontend debe mostrar carga, error con retry, no disponible y selector manual de plataforma. No deducir Apple Silicon por un user-agent que dice Intel. Si arquitectura es desconocida, abrir selección.

### Requisitos de instalación que faltaban

El catálogo menciona Docker Desktop/Engine. Auditar si sigue siendo requisito real, junto con WSL2, permisos, puertos, memoria, disco, descarga de imágenes y reinicio. No prometer “instalar y usar” si hay pasos manuales ocultos.

Probar VM limpia sin herramientas de desarrollo: instalación, login, prerrequisitos ausentes, interrupción de red, reinicio, reintento, actualización y desinstalación preservando datos según política. Si Docker es obligatorio, documentar instalación y condiciones aplicables; no instalarlo silenciosamente.

La app recibe de backend identidad validada, permisos y configuración mínima. Los binarios vienen del almacenamiento/CDN; normalmente no deben atravesar el proceso de API. URLs firmadas solo si existe una necesidad real de restringir paquetes.

## 8. Deployment y operación

Producción: frontend estático + backend operativo + Supabase + almacenamiento de releases, con dominio, secretos separados, backups, monitoreo, soporte y rollback comprobado.

Para Pages, conservar HashRouter mientras no se haya validado fallback. Un callback web puede usar ruta física/raíz y luego restaurar la navegación. Cambiar a BrowserRouter exige probar entrada directa y reload de cada ruta. Dominio propio es recomendable, no requisito técnico absoluto.

Configurar manifest por VITE_RELEASE_MANIFEST_URL o BASE_URL de Vite; eliminar dependencia accidental de /Landing-page/ al cambiar dominio. Mantener nombres actuales de variables hasta actualizar código, ejemplos y CI juntos.

Variables públicas: URL de Supabase, publishable/anon compatible, URL API, manifest y contacto. Privadas: credenciales DB, secreto Stripe/webhook, claves privilegiadas y de firma. No migrar nombres sin revisar compatibilidad de SDK y proyecto.

CI: npm ci, lint con configuración funcional, build, node tests/platform.test.mjs y pruebas relevantes nuevas. Auditar dependencias sin aplicar upgrades masivos automáticos. Actualizar README para Pages por artifacts. Confirmar runtime soportado al ejecutar.

En staging: OAuth de prueba, sandbox de pagos, DB separada, callback real, webhook y release de prueba. Producción: secrets separados, DNS/TLS si corresponde, CORS exacto, límites y cabeceras donde el hosting permita configurarlas. No afirmar que Pages ofrece control de headers equivalente a una API.

Migraciones compatibles hacia adelante; respaldar y probar restauración antes de cambios destructivos. Rollback de API/frontend a artefacto previo; desktop mediante versión correctiva compatible, sin habilitar downgrades arbitrarios. Retener binarios previos no prueba por sí solo un rollback seguro.

Runbook mínimo: webhook atascado, login caído, usuario pagado sin permiso, descarga rota y release defectuosa. Logs correlacionados por request/event ID, alertas y reconciliación periódica. Registrar quién responde y cómo reintentar sin duplicar cargos.

## 9. Tareas pequeñas con aceptación

| ID | Objetivo y alcance | Depende | Entrega / validación |
|---|---|---|---|
| T00 | Inventario de landing, backend y desktop; auth, instalación, billing existente | — | Estado real, faltantes y AUTH-DECISION; no inventar repositorios |
| T01 | Reproducibilidad: package scripts, lint, workflow y README | T00 landing | Comandos existentes ejecutan o falla documentada; CI refleja deployment real |
| T02 | Tokens/CSS y componentes repetidos | T00 landing | Sin regresiones en todas las rutas; capturas 360/768/1440 |
| T03 | Hero, narrativa, pricing/FAQ y accesibilidad | T02 | Copy verificable, teclado/modal/reduced motion y responsive |
| T04 | Validación de releases, BASE_URL y estados de descarga | T01 | JSON inválido/URL no permitida no generan descarga; arquitectura desconocida abre selector |
| T05 | Catálogo comercial y selección de proveedor | Datos del negocio | Precios/límites/moneda y comparación documentados; no integrar dos proveedores |
| T06 | Migraciones mínimas, autorización y aislamiento | T00 backend; T05 modelo | Usuario A no lee/modifica B; constraints evitan duplicados |
| T07 | Completar login web/registro/recuperación y callbacks | T00 auth; T01 | Cuenta nueva y existente, error OAuth, sesión expirada y callback repetido |
| T08 | Desktop → navegador → sesión según única decisión | T00 desktop; T06; T07 | Expiración, replay, denegación, dos instalaciones, revocación y almacén seguro |
| T09 | Checkout/portal y reserva idempotente | T05; T06; T07 | Doble clic, dos pestañas, timeout y usuario ajeno; una intención válida |
| T10 | Webhook durable, reconciliación y entitlement | T09 | Firma falsa rechazada; duplicados, desorden y caída worker recuperables |
| T11 | Build/firmas/manifest e instalación real | T00 desktop; T04 | Paquete publicado solo tras instalación limpia y verificación |
| T12 | Deployment reproducible y runbook | T01; T06–T11 | Staging end-to-end, restore/rollback documentados; accesos pendientes separados |
| T13 | Validación de recorrido self-service | T03; T12 | Usuario nuevo descarga, se registra, paga y usa; cancelación/revocación verificadas |

Orden útil: T00 → T01 → T02 → T03 → T04. En paralelo solo con contextos independientes: datos comerciales y auditoría backend. Después T05–T13 por dependencias. No estimar días exactos sin conocer tamaño del cliente, backend y accesos.

### Pruebas críticas que no deben omitirse

- Dos usuarios: nunca compartir Customer, dispositivo ni entitlement por un id manipulable.
- Login repetido/replay no autoriza otra instalación ni duplica sesión indebidamente.
- Aprobación de dispositivo requiere confirmación incluso con web ya autenticada.
- Misma clave/payload devuelve mismo resultado; misma clave/payload distinto falla.
- Dos claves distintas no deben saltarse límite de suscripciones o dispositivos.
- Webhook persistido + caída antes de procesar se recupera; processed no repite efectos.
- Pago pendiente no concede acceso; success URL manipulada no concede acceso.
- Manifest vacío, corrupto o con URL insegura no produce un enlace activo.
- Descarga y callback funcionan con base /Landing-page/ y con la base de staging.
- Instalar en máquina limpia y reabrir después de reiniciar.
- Al vencer pago o caer backend se aplica la política segura aprobada, sin borrar datos.

## 10. Formato de entrega de cada tarea

Actualizar docs/IMPLEMENTATION-STATUS.md con:

- ID y estado: pendiente / en curso / verificado / bloqueado.
- Decisión concreta y evidencia relevante.
- Archivos modificados.
- Comandos ejecutados y resultado real.
- Pruebas manuales con entorno y captura si aplica.
- Variables nuevas: solo nombres, nunca valores secretos.
- Dependencias pendientes y siguiente ID.

No generar documentos paralelos extensos. Mantener este plan como referencia, AUTH-DECISION para el flujo elegido y un registro de estado breve. Escribir OpenAPI/migraciones cuando sean parte de la implementación, no múltiples borradores incompatibles.

## 11. Fuentes y uso de investigación

Fuentes oficiales consultadas para esta revisión. Verificar soporte, condiciones y tarifas al implementar; las decisiones visuales y comerciales deben mantenerse alineadas con el producto de producción.

- [RFC 8252 — OAuth para apps nativas](https://www.rfc-editor.org/rfc/rfc8252): navegador externo y redirects nativos.
- [RFC 8628 — Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628): códigos separados y polling; alternativa distinta a PKCE nativo.
- [Supabase PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow): verifier y limitaciones de intercambio.
- [Supabase seguridad de datos](https://supabase.com/docs/guides/database/secure-data): RLS y claves privilegiadas.
- [Supabase sesiones](https://supabase.com/docs/guides/auth/sessions): acceso, refresh y revocación.
- [Stripe webhooks](https://docs.stripe.com/webhooks): firma, duplicados y entrega sin orden garantizado.
- [Stripe idempotencia](https://docs.stripe.com/api/idempotent_requests): reintentos con llave y límites del mecanismo.
- [Stripe precios México](https://stripe.com/mx/pricing): referencia solo si corresponde el país de la empresa.
- [Paddle precios](https://www.paddle.com/pricing): propuesta merchant of record y condiciones comerciales.
- [GitHub release assets](https://docs.github.com/en/rest/releases/assets): publicación y metadatos.
- [Tauri updater](https://v2.tauri.app/plugin/updater/): usar únicamente si el cliente existente es Tauri.

## 12. Qué significa “terminado”

Código y documentación verificables, recorrido completo en staging con servicio de pagos sandbox, paquete real probado en máquina limpia, monitoreo y configuración lista para producción. Publicado significa además que se ejecutó y comprobó el deployment real, el rollback y el procedimiento de soporte.

El plan por sí solo no crea DB, certificados, cuenta comercial, releases ni infraestructura. Los pendientes externos deben quedar visibles, sin impedir avanzar el frontend y los módulos independientes.
