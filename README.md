# CISPAR — Autonomous SOC AI Agent

> Detects, investigates, and contains threats automatically. L1, L2, and L3. 24/7.

[![Deploy to GitHub Pages](https://github.com/Cispar-siem/Landing-page/actions/workflows/deploy.yml/badge.svg)](https://github.com/Cispar-siem/Landing-page/actions/workflows/deploy.yml)

---

## What is CISPAR?

CISPAR is an autonomous Security Operations Center (SOC) AI agent that replaces L1, L2, and L3 human analyst tiers. It operates around the clock to:

- **L1 — Triage**: Monitor systems, parse events, enrich IOCs, classify threats against MITRE ATT&CK
- **L2 — Response**: Collect forensic evidence, execute playbooks, contain threats autonomously
- **L3 — Hunting**: Proactively search for TTPs, identify detection gaps, apply system hardening

This repository is the public landing page hosted on GitHub Pages.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Bundler | Vite 5 |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

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

---

## Project Structure

```
Landing-page/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD (Pages artifact deployment)
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
├── vite.config.ts              # base: '/Landing-page/' for GH Pages
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Deployment

Deployment is fully automated via GitHub Actions on every push to `main`.

**How it works:**
1. GitHub Actions runs `npm run lint` and `npm test`
2. It compiles the bundle with `npm run build`
3. The `dist/` folder is uploaded as a GitHub Pages artifact (`actions/upload-pages-artifact@v3`)
4. GitHub Pages deploys the artifact directly to production (`actions/deploy-pages@v4`)

**Manual trigger:** Go to Actions → Deploy to GitHub Pages → Run workflow.

**GitHub Pages setup (one time):**
- Repository Settings → Pages → Build and deployment → Source: **GitHub Actions**

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
