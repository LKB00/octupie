# CLAUDE.md — Octupie

Octupie helps founders, coaches and creators who sell on Instagram decide what to post. It watches accounts in the user's niche, flags reels that beat their creator's usual views ("outliers"), explains why each one worked, and writes the user's own version as a ready-to-film script in their voice.

Read these before building anything:
- `docs/01-PRODUCT.md` — what we're building and why
- `docs/02-INFORMATION-ARCHITECTURE.md` — routes, objects, flows
- `docs/03-SCREENS.md` — screen-by-screen spec with all states
- `docs/04-DESIGN-SYSTEM.md` + `design/tokens.css` — visual rules
- `docs/05-ARCHITECTURE.md` — services, jobs, outlier maths, AI pipeline
- `docs/06-AI-PROMPTS.md` — prompts and output schemas
- `db/schema.sql` — database
- `docs/07-BUILD-PLAN.md` — the milestone you're on

## Stack

- Next.js (App Router, React Server Components), TypeScript strict mode
- Tailwind CSS with the CSS variables in `design/tokens.css`; shadcn/ui for primitives (Dialog, Popover, DropdownMenu, Tabs, Tooltip, Toast)
- Supabase: Postgres, Auth (Google + email magic link), Storage (thumbnails, audio, voice samples), row-level security on every table
- Inngest for background jobs and schedules
- Zod for every external boundary (API input, AI output, scraper output)
- AI: Anthropic Claude API (`@anthropic-ai/sdk`) for text; Google Gemini API for video understanding; a speech-to-text API for transcripts
- Payments: Paddle (merchant of record) behind a `BillingProvider` interface; stubbed in mock mode
- Testing: Vitest for logic, Playwright for the 3 core flows
- Package manager: pnpm

## Folder layout

```
app/
  (marketing)/            landing, pricing
  (auth)/                 sign-in, onboarding
  (app)/c/[creatorId]/    discover, reels/[shortcode], studio, scripts, your-reels, context
  (app)/settings/         profile, accounts, notifications, billing, danger
  api/                    route handlers (webhooks, inngest)
components/
  ui/                     shadcn primitives (don't edit by hand beyond tokens)
  app/                    product components (ReelCard, MultipleBadge, QuotaMeter, HookScore…)
lib/
  data/                   InstagramProvider interface + mock | apify | meta implementations
  ai/                     claude.ts, gemini.ts, transcribe.ts, prompts/, schemas/
  outliers/               baseline + multiple + trending maths (pure functions, fully tested)
  quota/                  plan limits and usage checks
  db/                     typed Supabase client and queries
inngest/                  job definitions
fixtures/                 mock data (see fixtures/sample-data.json)
db/                       schema.sql, migrations
docs/                     the spec
```

## Commands

- `pnpm dev` — run locally
- `pnpm test` — unit tests
- `pnpm e2e` — Playwright
- `pnpm lint && pnpm typecheck` — run both before saying a task is done
- `pnpm db:types` — regenerate Supabase types after a schema change

## Environment

- `MOCK_MODE=true` makes every external service read from `fixtures/` and return canned AI output. Milestones 0–5 must work fully in mock mode.
- Real keys live in `.env.local`; list every new variable in `.env.example` with a comment.

## Rules

1. **One definition of "usual views".** Always use `lib/outliers/baseline.ts`. Never compute a baseline inline. Show the definition in a tooltip wherever a multiple appears.
2. **Every paid action shows its cost before the click** ("Uses 1 breakdown") and decrements the `QuotaMeter` after. Check quota on the server, never only in the UI.
3. **Every list has four states**: loading (skeleton), empty (with a next step), sparse (fewer than the target count, with a way to get more), and error (with retry). See `docs/03-SCREENS.md`.
4. **AI output is validated with Zod** against the schemas in `lib/ai/schemas`. On failure, retry once with the validation error appended; then show a friendly error. Never render raw model text that failed validation.
5. **Scripts are first-class records** in the `scripts` table, not just chat messages. Anything generated in Studio is saved to Scripts automatically.
6. **Don't call Instagram or AI services from React components.** Server actions or route handlers call `lib/`, and long work goes to Inngest jobs.
7. **Use design tokens only.** No hex values or arbitrary Tailwind colours in components. Light and dark mode must both work.
8. **Accessibility**: every interactive element is keyboard reachable with a visible focus ring; icon-only buttons have `aria-label`; text contrast passes WCAG AA; modals trap focus and close on Escape.
9. **Copy is plain and specific.** Say what will happen ("Write my version · uses 1 script"). No "Oops", no exclamation marks in errors.
10. **Don't store anything we don't need.** We store public reel metadata, transcripts and thumbnails for tracked accounts; we don't download or re-host other creators' videos beyond what's needed to analyse them, and we delete temporary video files after analysis.
11. Keep components under ~200 lines; extract hooks and sub-components when they grow.
12. When a spec is ambiguous, pick the simplest option that satisfies the acceptance criteria and note the choice in the PR description.
