# Octupie

Octupie helps founders, coaches and creators who sell on Instagram decide what to post. It watches accounts in your niche, flags reels that beat their creator's usual views ("outliers"), explains why each one worked, and writes your own version as a ready-to-film script in your voice.

This repository is the product prototype. It runs entirely on mock data, so no API keys are needed.

## Run it

```bash
pnpm install
cp .env.example .env.local   # MOCK_MODE=true is already set
pnpm dev
```

Then open **http://localhost:3000/c/c_demo/home**. In mock mode you're signed in as a demo creator. The marketing site (landing and pricing) is not part of this repository, so `/` has no page.

Useful pages:

| Page | URL |
| --- | --- |
| Home | `/c/c_demo/home` |
| Discover (outlier feed, saved, creator map) | `/c/c_demo/discover` |
| A reel with its breakdown | `/c/c_demo/reels/wxrJbYD4JAE` |
| Studio (write and edit scripts) | `/c/c_demo/studio` |
| Scripts | `/c/c_demo/scripts` |
| Onboarding | `/onboarding/handle` |
| Settings and billing | `/settings/billing` |
| Design tokens and components | `/design` |

Reset the demo data at any time with `curl -X POST http://localhost:3000/api/mock/reset`.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run locally |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm e2e` | End-to-end tests (Playwright) |
| `pnpm lint && pnpm typecheck` | Run both before calling a change done |
| `pnpm build` | Production build |

## Stack

Next.js (App Router) and TypeScript, Tailwind CSS with the tokens in `design/tokens.css`, shadcn/ui on Base UI, Phosphor icons, and Zod at every boundary. Real services sit behind interfaces with mock implementations: Instagram data (`lib/data`), AI (`lib/ai`), and billing (`lib/billing`, Paddle).

## Where things are

- `CLAUDE.md`: project rules and conventions
- `docs/01-PRODUCT.md` to `docs/08-RESEARCH-NOTES.md`: product spec, information architecture, screens, design system, architecture, AI prompts, build plan and research
- `db/schema.sql`: Postgres schema with row-level security
- `fixtures/sample-data.json`: the mock data the prototype runs on

## Status

Milestones 0 to 5 and 8 to 9 are built on mock data. Real Instagram data and real AI (Milestones 6 and 7) need API keys; see `.env.example` and `docs/05-ARCHITECTURE.md`.
