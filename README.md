# CISPAR Security — landing público

> Plataforma de operaciones de ciberseguridad en desarrollo; piloto en preparación.

[![Verify landing](https://github.com/Cispar-siem/Landing-page/actions/workflows/deploy.yml/badge.svg)](https://github.com/Cispar-siem/Landing-page/actions/workflows/deploy.yml)

---

## What is CISPAR?

CISPAR busca dar visibilidad de endpoints, detecciones con evidencia, investigación y respuestas autorizadas. La web presenta el alcance previsto y un Quick Scan de fuentes públicas del dominio. La disponibilidad de cada capacidad requiere validación; no hay paquetes del agente Security publicados.

This repository is the public landing page deployed through Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Bundler | Vite 5 |
| Hosting | Vercel |
| CI | GitHub Actions |

---

## Local Development

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run platform detection tests
npm test

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173`.

Para el laboratorio S3 local, ejecuta `./local-aws/start.sh` y abre `http://127.0.0.1:5173/#/download`. Los artefactos Moto actuales son fixtures de texto. El [plan de paquetes nativos](docs/NATIVE-PACKAGES-PLAN.md) cubre Ubuntu, Arch, macOS y Windows, junto con sus criterios de aceptación.

---

## Project Structure

```
Landing-page/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions verification before Vercel promotion
├── docs/                       # Implementation status, architecture & plans
├── public/
│   └── releases.json           # Catalog of downloadable releases
├── src/
│   ├── components/             # Reusable UI, layout and auth components
│   ├── context/                # React context (AuthContext, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Supabase client, releases client, etc.
│   ├── pages/                  # Page-level components
│   ├── types/                  # Shared TypeScript interfaces
│   ├── App.tsx                 # Root router (HashRouter)
│   ├── main.tsx                # Entry point
│   └── index.css               # Base Tailwind styles
├── tests/
│   └── platform.test.mjs       # Platform detection tests
├── index.html
├── vercel.json                 # Vercel build contract
├── vite.config.ts              # domain-root asset paths for Vercel
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Deployment

Vercel deploys this repository through its Git integration. GitHub Actions
independently verifies linting, tests and the production bundle on every push.

**How it works:**
1. In Vercel, import `Cispar-siem/Landing-page`.
2. Set `main` as the production branch. Vercel detects `vercel.json` and uses
   `npm ci`, `npm run build`, and `dist`.
3. Add only browser-safe variables in Vercel: `VITE_PLATFORM_API_URL`,
   `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` when Supabase is enabled.
4. Every commit to `main` is a production deployment; pull requests receive
   preview deployments after the GitHub verification workflow passes.

Never configure server credentials, service-role keys, payment secrets or GCP
credentials with a `VITE_` prefix: Vite embeds those values into the public
browser bundle.

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0a0a0f` |
| Surface | `#111118` |
| Accent Blue | `#3b82f6` |
| Accent Purple | `#8b5cf6` |
| Accent Cyan | `#06b6d4` |
| Safe/Green | `#10b981` |
| Danger/Red | `#ef4444` |
| Font | Inter + JetBrains Mono |

---

## License

MIT © CISPAR
