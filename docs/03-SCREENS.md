# 03 · Screens

Each screen lists layout, components, copy, and every state. Component names match `components/app/`. Measurements are at 1440 px desktop unless stated. Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

---

## S0 · App shell

- **Sidebar** 224 px, background `--bg`, collapsible to 64 px icon rail. Under `md`: hidden; bottom tab bar with Discover, Studio, Scripts, Your reels, More.
- **Nav item**: pill (radius full), 14/20 Inter, padding 8×12. Active: `--surface` background, `--brand-strong` text, weight 500, `--shadow-selected`. Idle: `--text-muted`.
- **Main column**: max-width 1240 px, padding 32 px (16 px on mobile). Page title in display font 32/35, weight 400–500, with a (?) help button that opens a popover explaining the page in 2 sentences.
- **Right rail** (Discover only): 280 px, collapsible.
- **QuotaMeter** at the bottom of the sidebar: two thin bars (Breakdowns, Scripts) with "2 of 5" labels and an Upgrade link when on Free.
- **Toasts** bottom-right; **dialogs** centred, max 560 px, close on Escape.

---

## S1 · Landing (`/`)

Order: hero → product tour (3 steps) → proof → comparison → pricing teaser → FAQ (≤ 8) → closing CTA → footer.

- **Hero**: eyebrow "For founders, coaches and creators who sell on Instagram"; H1 (display 72–80/1.02, letter-spacing −0.035em) "Know what to post this week, in your voice."; subcopy 18/28; handle input with "@" prefix + primary button "Get my free audit →"; microcopy "Free audit and your niche's breakout reels. No card."
- **Background**: a slow vertical marquee of example outlier cards (niche label, title, views, multiple) at 40% opacity behind a radial white fade. Respect `prefers-reduced-motion` (static grid). Each card's multiple must be the same in every repeat.
- **Product tour**: 3 sticky steps (See what's working · Know why it worked · Get your script) with real app screenshots in a browser frame. The video player uses a poster image so it's never an empty box.
- **Proof** (missing on the original): 3 creator stories with one metric each, a "reels analysed" counter, logos only with permission.
- **Comparison table**: rows Finds what's working · Explains why · Writes in your style · Time to a filmable script · Cost; columns General AI chat · Agency · Octupie (highlighted column). No fade-in on rows.
- **CTA style**: rectangular, 0 radius, solid ink or brand fill, with a hard offset shadow (`--shadow-offset`: 5px 5px 0 ink). Hover: shadow 2px 2px and translate(3px,3px). This "pressed" interaction is the brand's signature.
- States: handle input validates format (letters, numbers, `.` `_`, 1–30 chars) inline; on submit, go to sign-up with the handle prefilled.

## S2 · Pricing (`/pricing`)

- Monthly/Annual segmented control with "Save up to 17%" chip.
- Three cards (Free, Creator, Pro) with the same row order of limits. Pro card outlined with offset shadow and "Most popular".
- Under the cards: "Every paid plan includes…" list, refund policy line, FAQ (6 pricing questions, no SEO questions).
- Currency by region (₹ in India, $ elsewhere); use one symbol style everywhere ("₹", not "Rs").

---

## S3 · Onboarding (`/onboarding/[step]`)

Full-screen, no sidebar, step indicator "Step 2 of 5" top-left, Back/Continue bottom.

1. **Handle**: input + "Check". Success shows avatar, name, followers. Errors: "We couldn't find @x" · "@x is private, so we can't read its reels".
2. **What we understood**: cards for Who you are, What you post about, How you sound (3 sample phrases), Language. Each card has Edit. Loading: skeleton cards with the line "Reading your last 30 reels…" and a progress bar (steps: profile → reels → transcripts → summary).
3. **Interview**: one question per screen, text area + mic button. Questions: What do you sell, and to whom? · What should a new follower do after watching? · Which language(s) do you post in? · What's one thing you never want to sound like? · Anything we must never mention? (→ don't-use list).
4. **Pillars**: 6–8 suggested pillar chips with one-line descriptions; pick up to 5; "Write my own".
5. **Building**: checklist animating through Strategy written · Voice built · 14 accounts found in your niche · Finding outliers. If the voice conflict check fires, show the Conflict card here before finishing (see S9). End: "Your feed is ready" → Discover.

---

## S4 · Discover (`/c/:id/discover`)

**Header row**: title "Discover" (?) · tabs Feed | Saved (n) | Creator map.

**Filter bar** (one row, wraps on mobile): Sort dropdown (Breaking now, Newest, Highest multiple) · Window (7d, 30d, 90d) · Format (All, Reels, Carousels) · Pillar · Clear. All filters in the URL.

**Grid**: `repeat(auto-fill, minmax(200px, 1fr))`, gap 24 px column / 32 px row.

**ReelCard** (220 wide reference):
- 1 px ink border, 0 radius, 10 px padding, white surface; hover lifts with `--shadow-offset-sm`.
- Thumbnail 9:16, rounded 0, with **MultipleBadge** overlapping the top-left corner (white pill, display font 14/600, e.g. "3.4×"; brand fill when ≥ 10×) and a **Save** bookmark top-right.
- Hook line (2 lines max, 14/20 600) — the first spoken line from the transcript; fall back to caption.
- Creator avatar 24 + handle 12/16 + age ("4 weeks ago").
- Stats row: views, likes, comments (icons + 14/600 numbers).
- Pillar tag (small chip) when matched.

**Right rail**: "Tracked accounts (14)" · Add account (input accepts @handle or a topic) · list rows (avatar, handle, "usually 9.2K views", outliers this month, filter-on-click, remove ×) · "Manage" link.

**States**
- Loading: 8 skeleton cards.
- Empty (no tracked accounts): illustration-free card: "Add accounts in your niche to start your feed" + input + "Suggest accounts for me".
- **Sparse (< 15 cards)**: banner above grid: "Only 3 outliers in the last 7 days. Try 30 days · Show 2× and up · Add 5 suggested accounts".
- Filling (just onboarded): progress banner "Checking 14 accounts · 9 done" with cards streaming in.
- Error: "We couldn't refresh your feed. Showing results from [time]." + Retry.

**Creator map tab**: scatter (x = followers, log scale; y = outliers in 30 days), avatars as points, "You" marked; side panel for the hovered/selected account with followers, usual views, outliers, "See their outliers". Below the chart: "Suggested accounts to track" list.

---

## S5 · Reel detail (`/c/:id/reels/:shortcode`)

Two columns ≥ `lg` (left 360 px sticky player, right flexible); stacked on mobile.

**Left**: embedded reel or thumbnail with "Watch on Instagram"; under it, creator row.

**Right, top to bottom**:
1. Breadcrumb "← Discover" · actions Save, Open on Instagram, (?).
2. **Headline row**: views · likes · comments · posted date.
3. **Performance card**: "3.4× their usual views" (multiple in brand colour), bars This reel vs Usual (with the "usual = median of their last 30 reels older than 3 days" tooltip), growth chart (line for this reel, dashed for the account's typical curve). If first snapshot came late: note "We started tracking this reel on day 14."
4. **Breakdown** (if analysed):
   - Headline sentence (display 22/28).
   - **HookScore** ×3 (Verbal, Visual, On-screen text): ring gauge 0–100, label, one-line reason, the quote/description (expandable, never truncated without a "more").
   - Scale note: "How strongly each part holds attention in the first 3 seconds, compared with other outliers in your niche."
   - **Structure timeline**: horizontal segments Hook · Setup · Payoff · CTA with timestamps.
   - Why it worked: 3 bullets with bold key phrase.
   - Borrow this: 3 bullets + **HookTemplate** box (monospace, copy button).
   - Transcript (collapsed).
5. **If not analysed**: card "Get the breakdown: hook, structure and what to borrow." Button "Break it down · uses 1 breakdown". While running: progress lines (Watching the video · Reading the transcript · Writing the breakdown), ~20 s.
6. **Sticky footer CTA** (on scroll): "Write my version" → **AnglePicker** dialog.

**AnglePicker** dialog: three equal cards (Same hook, your topic · Same structure, your story · Your counter-take), each with a one-line preview generated from the breakdown; voice toggle with 2-line preview; pillar select; button "Write script · uses 1 script".

---

## S6 · Studio (`/c/:id/studio`)

**Layout**: left 60% **ScriptEditor**, right 40% **AssistantPanel**. Mobile: tabs Script | Chat.

**ScriptEditor**
- Title (editable inline), status select (Draft, Ready to film, Filmed, Posted), pillar chip, source reel chip (links back), estimated length "≈ 38 s".
- Hook options: 3 radio cards; selected one is used in the script.
- Body: numbered lines; toggle "Show cues" reveals on-screen text / B-roll cues under each line in muted italic.
- CTA line; Caption block with hashtags and copy button.
- Toolbar: Undo, Redo, Versions (dropdown with timestamps), Copy all, Export .txt.
- Autosave indicator: "Saved · 2s ago".

**AssistantPanel**
- Header "Studio assistant" + voice toggle (Your voice / Neutral).
- Messages; edits applied to the script show a compact diff card ("Changed line 3") with Undo.
- Input with mic and attach; quick chips: Make it shorter · Stronger hook · More like me · Translate to Hinglish · Add a story.

**Empty Studio (no script open)**: centred greeting with the creator's name; 4 starter cards from this week's top outliers and pillars; input "Or describe an idea…".

**States**: generating (lines stream in), validation failure (friendly error + Retry), limit reached (UpgradeCard inline in the panel).

---

## S7 · Scripts (`/c/:id/scripts`)

- Header with count, search, filters (status, pillar), "New script" button.
- Table on desktop (Title · Pillar · Source · Status · Updated · menu); cards on mobile.
- Status uses a dropdown chip; changing it saves immediately.
- Empty: "No scripts yet. Write one from an outlier" + button to Discover.

## S8 · Your reels (`/c/:id/your-reels`)

- Header: "@handle · your usual is about 4.7K views a reel" with the same tooltip definition as everywhere else.
- Sort (Newest, Highest multiple), pillar filter.
- Same ReelCard component (multiple vs **your** usual). Opens Reel detail.
- "How did this do? · uses 1 breakdown" lives on the detail page, not on every card.

## S9 · Context (`/c/:id/context`)

Tabs **About you** | **Voice**.

**About you**
- "What changed?" input at top (text + mic) → shows a diff preview of affected docs → Apply.
- **Live facts** table: label, value, last checked, edit, delete. Stale facts show "Needs a refresh" and a Refresh button that works on every plan (rate-limited), not paywalled.
- Docs as collapsible sections: Positioning · Ideal customer · Goals · Pillars (chips with descriptions) · Proof bank (list + Add) · Don't use (list + Add).

**Voice**
- **ConflictCard** (when detected), warning style, at the top.
- How you sound: 2–3 sentence summary, energy meter, language mix chips.
- Signature phrases, Openers, Closers: chips, each editable/removable.
- Sources: list with toggles (reels, voice recording, writing samples) and "Add source"; count "781 words from 21 reels".
- Earlier versions: list with date + Restore.

## S10 · Settings (`/settings/[section]`)

Left sub-nav: Profile · Linked accounts · Notifications · Plan & billing · Danger zone.
- **Plan & billing**: current plan card (name, renewal date, usage bars), then plan cards, redeem code, invoices.
- **Notifications**: weekly email, breakout alerts, quota warnings (toggles).
- **Danger zone**: Delete creator, Delete account — each with typed confirmation.

## S11 · Notifications panel

Popover from the bell, 360 px: list newest first, each with icon, title, time; panel opening marks all as read; "Get desktop notifications" button at the bottom.

## Shared components

| Component | Purpose |
| --- | --- |
| `ReelCard` | Feed, saved, your reels |
| `MultipleBadge` | "3.4×" pill; brand fill ≥ 10× |
| `UsualTooltip` | The one definition of "usual views" |
| `QuotaMeter` | Sidebar usage |
| `CostLabel` | "· uses 1 breakdown" suffix on buttons |
| `UpgradeCard` | Inline limit-reached prompt |
| `HookScore` | Ring gauge + label + reason + quote |
| `StructureTimeline` | Hook/Setup/Payoff/CTA segments |
| `HookTemplate` | Monospace template with copy |
| `AnglePicker` | Three-angle dialog with previews |
| `ScriptEditor`, `AssistantPanel` | Studio |
| `ConflictCard` | Voice vs strategy mismatch |
| `SparseBanner` | Feed has too few items |
| `EmptyState` | Title, one sentence, one action |
| `PageHelp` | (?) popover per page |
