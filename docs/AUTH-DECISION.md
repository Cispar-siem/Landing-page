# Decisión de Arquitectura de Autenticación — CISPAR

**Fecha:** 19 de septiembre de 2026  
**Tarea asociada:** T00  
**Estado:** DECISIÓN FIJADA  

---

## 1. Decisión Única: Flujo de Autorización por Dispositivo (Device Authorization Flow — RFC 8628)

Se adopta y consolida de forma exclusiva el **Flujo de Autorización por Dispositivo (RFC 8628-like)** como el mecanismo de autenticación para terminales, clientes CLI, agentes y aplicaciones de escritorio de CISPAR.

Se **descarta** la implementación paralela de Authorization Code con Loopback PKCE (RFC 8252) para evitar duplicidad de flujos, dependencias de apertura de puertos locales en entornos restringidos/remotos/SSH/Docker y discrepancias de redirección en Supabase Auth.

---

## 2. Evidencia en el Ecosistema Existente

El flujo por dispositivo ya cuenta con código funcional e integrado en los tres componentes del sistema:

### A. Cliente CLI / Terminal
- **Ubicación:** `/home/axel/cispar-ia-backend/src/cli/cispar-config.ts` y `/home/axel/cispar-ia-backend/src/cli/program/register.auth.ts`
- **Comportamiento:**
  1. `cispar login` llama a `requestDeviceCode()`.
  2. Recibe `{ deviceCode, verificationUrl, expiresIn }`.
  3. Abre `verificationUrl` en el navegador del usuario (`open(verificationUrl)`).
  4. Realiza polling con `pollDeviceStatus(deviceCode)` cada 3 segundos (`POLL_INTERVAL_MS = 3000`) hasta expiración o autorización.
  5. Al recibir `{ status: "authorized", token, customer }`, persiste la configuración en `~/.cispar/config.json`.

### B. Servidor de Licencias / Backend
- **Ubicación:** `/home/axel/cispar-ia-backend/cispar-license-server/src/routes/device.ts`
- **Endpoints existentes:**
  - `POST /device/request`: Genera un código aleatorio criptográfico (`crypto.randomBytes(4).toString("hex")`), crea registro en la tabla `device_codes` de Supabase con estado `pending` y TTL de 600 segundos, y entrega la URL de verificación web.
  - `GET /device/status`: Consulta el estado en `device_codes` (`pending`, `authorized`, `expired`, `not_found`). Al autorizarse, entrega el token JWT emitido.
  - `POST /device/approve`: Recibe `{ deviceCode, supabaseToken }`, valida la sesión con `supabase.auth.getUser(supabaseToken)`, valida la licencia en la tabla `customers`, firma un JWT de CISPAR (`jwt.sign`) y marca el registro como `authorized`.
  - `POST /auth/validate`: Endpoint en `auth.ts` que valida el token Bearer emitido.

### C. Frontend / Landing Page
- **Ubicación:** `/home/axel/Landing-page/src/components/auth/AuthModal.tsx` y `src/pages/AuthPage.tsx`
- **Comportamiento:**
  - Extrae el código público de usuario de la URL (`window.location.hash`, parámetro `?user_code=`).
  - Permite inicio de sesión con email/password o Google OAuth mediante Supabase Auth.
  - Después de confirmación explícita, envía `POST ${VITE_PLATFORM_API_URL}/device/approve` con el `userCode` y el `access_token` de Supabase.

---

## 3. Brechas Identificadas para Auditoría y Endurecimiento (Tareas T07 y T08)

Aunque el flujo base existe y funciona, presenta las siguientes vulnerabilidades y mejoras obligatorias que se atenderán en T07 y T08:

1. **Aprobación Explícita Obligatoria (Frontend):**
   - *Problema actual:* `AuthModal.tsx` auto-aprueba la terminal inmediatamente al detectar `SIGNED_IN` en `onAuthStateChange`. Si un usuario ya tenía una sesión activa en el navegador e ingresa a un enlace malicioso con `?code=`, se aprobaría automáticamente sin su consentimiento.
   - *Solución:* Requerir una pantalla intermedia de confirmación explícita donde el usuario vea el código a autorizar y deba presionar voluntariamente "Autorizar este equipo".
2. **Validación de Expiración en Servidor:**
   - *Problema actual:* `POST /device/approve` debe rechazar la aprobación si el registro ya expiró antes de emitir el JWT.
3. **Mapeo de Dispositivos e Identificadores (Hardware / Installation ID):**
   - Registrar `installation_id`, plataforma y versión en el contrato de dispositivos según la sección 5 del plan.
4. **Semántica de Polling:**
   - El endpoint de request debe informar explícitamente el `interval` sugerido (e.g. 3 o 5 segundos) y soportar respuestas estándar de control (`authorization_pending`, `slow_down`, `expired`).

---

## 4. Conclusión

El flujo RFC 8628 (Device Flow) es el único flujo oficial de autorización de dispositivos en CISPAR. Se mantiene, se audita y se fortalece sin introducir flujos alternativos.
