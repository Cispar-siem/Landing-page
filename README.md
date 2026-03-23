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
│       └── deploy.yml          # GitHub Actions CI/CD
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Sticky nav with mobile menu
│   │   │   └── Footer.tsx      # Footer with link columns
│   │   └── sections/
│   │       ├── Hero.tsx        # Full-screen hero with animated orbs
│   │       ├── TrustSignals.tsx # Compliance badges + key metrics
│   │       ├── HowItWorks.tsx  # Interactive L1/L2/L3 explainer
│   │       ├── Features.tsx    # Six capabilities grid
│   │       ├── Terminal.tsx    # Animated SOC demo terminal
│   │       ├── Stats.tsx       # Count-up metrics section
│   │       └── CallToAction.tsx # Email capture + early access
│   ├── hooks/
│   │   └── useIntersectionObserver.ts  # Scroll-triggered visibility
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom component classes
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
1. GitHub Actions builds the project with `npm run build`
2. The `dist/` folder is deployed to the `gh-pages` branch
3. GitHub Pages serves from that branch

**Manual trigger:** Go to Actions → Deploy to GitHub Pages → Run workflow.

**GitHub Pages setup (one time):**
- Settings → Pages → Source: Deploy from branch `gh-pages`

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
