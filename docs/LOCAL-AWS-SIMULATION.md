# Simulación local del flujo de releases con Moto

## Lo que describe hoy la documentación

- `docs/PLAN-FRONTEND.md` describe un landing estático servido por Vercel. Los instaladores y sus checksums se originan en `cispar-siem-mono`; el landing consume `releases.json`.
- `openspec/specs/downloads/spec.md` permite `dl.cispar.io` y `releases.cispar.io` como hosts de descargas y exige HTTPS, versión y SHA-256 antes de habilitar un enlace.
- `docs/PRODUCTION-READINESS.md`, `docs/PROJECT-CONTEXT.md` y `public/releases.json` indican que no hay instaladores CISPAR Security publicados y que el catálogo actual los mantiene deshabilitados.
- No hay una arquitectura AWS de producción documentada para el landing o para publicar esos instaladores. Por eso la ruta S3 de este documento es una simulación local y una propuesta técnica acotada, no una afirmación sobre la infraestructura desplegada.

## Arquitectura de prueba

```text
Vite local (frontend de descargas)
       │ GET del manifiesto + enlace prefirmado
       ▼
Moto S3 en 127.0.0.1:5000
       ├── cispar-local-releases/releases.json
       └── fixtures/cispar-agent-linux-amd64-test-fixture.txt
```

Moto simula la API de S3 y el objeto de prueba. El seeder permite lectura anónima del manifiesto dentro de Moto, cuyo puerto está publicado únicamente en loopback; el enlace al artefacto de prueba queda prefirmado por una hora y el manifiesto contiene el SHA-256 real del fixture. El seeder rechaza endpoints fuera de loopback HTTP en puerto 5000. La validación del frontend acepta `http://localhost:5000` solo si Vite compila en modo desarrollo y `VITE_LOCAL_MOTO=true`; un build de producción conserva HTTPS y la lista de hosts aprobados. El fixture es texto explicativo, no un instalador.

Esta prueba no simula CloudFront, DNS, certificados TLS, Vercel, EC2, publicación de binarios reales, firma de código, GitHub Actions ni el pipeline de releases de `cispar-siem-mono`. Moto verifica compatibilidad con el API simulado de S3, no comportamiento de AWS real. Antes de elegir S3/CloudFront para producción, falta aprobar y documentar esa arquitectura y validar permisos, políticas de bucket, cacheo, revocación/expiración de enlaces, versionado, observabilidad y rollback.

## Ejecutar localmente

1. Ejecuta `./local-aws/start.sh`. Arranca Moto, instala boto3 en un entorno virtual si hace falta, sube el fixture y abre Vite.
2. Abre `http://127.0.0.1:5173/#/download` y selecciona **Ubuntu Server LTS** para ver el fixture.
3. Para verificar el flujo en Chromium: `npx playwright test --config local-aws/playwright.config.ts`.
4. Para apagar Moto: `./local-aws/stop.sh`.

El servicio se enlaza únicamente a loopback. El estado de Moto es efímero; reiniciarlo elimina el bucket. No se deben copiar las URLs, credenciales mock, manifiesto ni artefacto de prueba a producción.
