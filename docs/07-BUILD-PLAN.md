# 07 · Build plan for Claude Code

Nine milestones. Run one per Claude Code session, commit when the "done when" list passes, then start a fresh session for the next. Milestones 0–5 need no API keys.

Tip: start each session with `/clear`, then paste the prompt. If Claude Code proposes a plan, read it before approving; push back if it skips a state from `docs/03-SCREENS.md`.

---

## M0 · Project setup

**Prompt**
```
Read CLAUDE.md and docs/04-DESIGN-SYSTEM.md. Set up the project:
- Next.js (App Router, TypeScript strict), pnpm, Tailwind, shadcn/ui, ESLint, Prettier, Vitest, Playwright.
- Import design/tokens.css in globals.css and map tokens to Tailwind as shown at the bottom of that file.
- Load Host Grotesk, Inter and JetBrains Mono with next/font.
- Add MOCK_MODE handling and .env.example from docs/05-ARCHITECTURE.md §8.
- Create the folder layout from CLAUDE.md with placeholder index files.
- Build a /design page that shows every token, the type scale, and Button (primary, secondary, ghost, disabled, with cost suffix), Input, Chip, Segmented control, Card, Dialog, Toast, Skeleton, in light and dark.
Run lint, typecheck and tests before finishing.
```
**Done when**: `pnpm dev` shows `/design` with all components in both themes; offset-shadow buttons press on hover; reduced motion disables animation.

---

## M1 · Data layer and outlier maths (mock)

**Prompt**
```
Read docs/02, docs/05 §2–3, db/schema.sql and fixtures/sample-data.json.
1. Add db/schema.sql as the first Supabase migration (local Supabase via the CLI) and generate types.
2. Implement lib/data/instagram-provider.ts (interface + Zod schemas) and MockProvider reading the fixtures.
3. Implement lib/outliers: baseline (median of last 30 reels older than 3 days, low-confidence under 8), multiple, isOutlier, breakingScore. Export the tooltip copy string from the same module.
4. Write Vitest tests for every edge case listed in docs/05 §3.
5. Add a seed script that loads the fixtures into the local database.
```
**Done when**: tests pass; seed loads 12 accounts and ~100 reels; recomputing baselines from seeded data matches the fixture `usualViews`.

---

## M2 · App shell, auth and navigation

**Prompt**
```
Read docs/02 §2–3 and docs/03 S0, S10, S11.
Build the signed-in app shell: sidebar with creator switcher, nav (Discover, Studio, Scripts, Your reels, Context), QuotaMeter, account menu; bottom tab bar under 768px; top bar with notifications popover (marks read on open) and per-page help popover.
Add Supabase Auth (Google + magic link) and route protection. In MOCK_MODE, sign in as the fixture creator automatically.
Add the Settings area with its five sections (forms can be static for now except Notifications toggles).
```
**Done when**: every nav route renders a titled placeholder; keyboard navigation works through the sidebar; quota meter reads from fixtures `usage`.

---

## M3 · Discover

**Prompt**
```
Read docs/01 F2, docs/03 S4 and docs/04 §4.
Build Discover with Feed, Saved and Creator map tabs:
- ReelCard, MultipleBadge (with UsualTooltip), filter bar (sort, window, format, pillar) synced to the URL.
- Right rail of tracked accounts with filter-on-click, add (validates handle via provider) and remove.
- All states: loading skeleton, empty, sparse banner (<15 cards: widen window, 2× threshold, add suggested accounts), filling progress, error with retry.
- Creator map: scatter (followers log-x, outliers-30d y) with a side panel and "See their outliers".
- Save/unsave with optimistic update.
Use server components for data and keep filters as search params.
```
**Done when**: with fixtures the feed shows ≥ 15 cards; setting window to 7 days triggers the sparse banner; all filters survive a page reload.

---

## M4 · Reel detail and breakdown

**Prompt**
```
Read docs/01 F3, docs/03 S5 and docs/06 P1–P3.
Build the reel detail page: player column, performance card with bars and growth chart (note when tracking started late), and the breakdown rendered on the page (HookScore x3, StructureTimeline, why it worked, borrow, HookTemplate with copy, collapsed transcript).
For unanalysed reels show "Break it down · uses 1 breakdown". Create the reel/analyse Inngest job; in MOCK_MODE it returns the fixture breakdown after a 3s delay with progress steps.
Enforce quota on the server (usage_events), show the result toast with remaining count, and an inline UpgradeCard at the limit.
Add the AnglePicker dialog (three equal cards with previews, voice toggle with 2-line previews, pillar select).
```
**Done when**: the fixture reel shows a full breakdown; an unanalysed reel can be analysed in mock mode and the meter drops by one; the 6th breakdown on Free shows the UpgradeCard.

---

## M5 · Studio and Scripts

**Prompt**
```
Read docs/01 F4–F5, docs/03 S6–S7 and docs/06 P4–P5.
Build Studio (ScriptEditor + AssistantPanel, tabs on mobile) and the Scripts library.
- Generating from AnglePicker creates a scripts row immediately (status draft) and a script_versions row.
- Chat edits apply tool-call patches (update_lines, set_hooks, select_hook, set_caption, set_title) with undo/redo and a versions menu; in MOCK_MODE return canned patches for the quick chips.
- Empty Studio shows 4 starters from top outliers and pillars.
- Scripts library: search, status/pillar filters, status dropdown chip, duplicate, delete with confirm, copy, export .txt.
```
**Done when**: the core loop works end to end in mock mode (Discover → reel → breakdown → write → edit → find it in Scripts); a Playwright test covers it.

---

## M6 · Real AI

**Prompt**
```
Read docs/05 §5–7 and docs/06 fully.
Implement lib/ai: claude.ts (Anthropic SDK, structured output via tool use, prompt caching on creator_context and voice blocks), gemini.ts (video upload + VideoObservation), transcribe.ts (fallback STT), each with Zod validation, one retry with the validation error, and cost logging to ai_calls.
Swap the mock implementations behind MOCK_MODE=false. Build fixtures/eval with 10 sample observations and `pnpm eval` that checks the properties listed in docs/06 Evaluation.
Keep model IDs in env.
```
**Done when**: with real keys and a local video file, a breakdown and a script generate and pass validation; `pnpm eval` reports a pass rate.

---

## M7 · Real Instagram data and jobs

**Prompt**
```
Read docs/05 §2, §4 and docs/08 Risks.
Implement ApifyProvider (actor IDs from env, Zod-mapped output) and MetaProvider (business_discovery for Business/Creator accounts). Choose by INSTAGRAM_PROVIDER.
Implement Inngest jobs: account/scrape (daily, staggered, only new reels), snapshots/refresh (6h, reels < 7 days), alerts/breakout (max 2/week), with retries, idempotency keys and per-provider concurrency limits.
Cache shared data across workspaces (ig_accounts, reels, breakdowns). Delete temporary video files after analysis.
```
**Done when**: adding a real public account fills the feed within minutes; re-running a scrape doesn't duplicate rows; a failed provider call retries and then shows the feed error state.

---

## M8 · Onboarding and Context

**Prompt**
```
Read docs/01 F1 and F7, docs/03 S3 and S9, docs/06 P6–P8.
Build onboarding (handle → understood → interview with text/voice → pillars → building with live job progress) and the Context page (About you with "What changed?" diff/apply and live facts with Refresh on all plans; Voice with editable phrases, sources toggles, versions/restore).
Run the voice–strategy conflict check after strategy/build and show ConflictCard in onboarding and on Voice.
On completion, analyse one top outlier for free as the user's first example breakdown.
```
**Done when**: a fresh account goes from handle to a filled feed with one free breakdown; editing a phrase rebuilds the voice and keeps the old version; the fixture creator shows the ConflictCard.

---

## M9 · Billing, email, landing and launch checks

**Prompt**
```
Read docs/01 F8–F9 and docs/03 S1–S2.
- Paddle checkout overlay and webhooks (subscription created/updated/cancelled) updating workspaces.plan and period_start; Billing settings with current plan, usage, invoices.
- Weekly digest email (Resend + React Email) per user time zone.
- Landing and Pricing pages per S1–S2, with reduced-motion fallback and poster images.
- Launch checks: Lighthouse ≥ 90 on landing, axe accessibility scan clean on main pages, all Playwright flows green, error tracking added.
```
**Done when**: a test purchase in Paddle sandbox upgrades the plan and resets quota; the digest renders; launch checks pass.

---

## After v1

- Agency workspace: multiple creators, seats, creator switcher already in place.
- Performance loop: match a Posted script to the creator's new reel and show it against the source outlier.
- Weekly planner by pillar.
- TikTok and YouTube Shorts providers.
