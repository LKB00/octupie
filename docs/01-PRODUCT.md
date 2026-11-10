# 01 · Product spec

## 1. The problem

People who sell on Instagram (founders, coaches, consultants, small brands) know short video brings them clients, but they don't have hours a week to work out what to post. Today they either scroll competitors by hand, paste ideas into a general AI chat that knows nothing about their niche or voice, or pay an agency a monthly retainer.

## 2. The promise

> Know what to post this week, in your own voice, in minutes.

The product does the two jobs an agency charges for, **niche research** and **scriptwriting**, continuously. The user films and posts. We don't edit video, schedule or post.

## 3. Who it's for

| Persona | Situation | What they need most |
| --- | --- | --- |
| **Founder-creator** (primary) | Runs a business, posts 2–4 reels a week, little time | A short list of proven ideas and a script they can film today |
| **Coach / consultant** | Sells services through personal brand, often bilingual (e.g. Hinglish) | Scripts that sound like them, in their language mix |
| **Social media manager / small agency** | Runs content for 3–20 clients | One workspace, one niche and voice per client, fast switching |

## 4. Core loop

1. **Discover** — a feed of outlier reels from the user's niche, refreshed daily.
2. **Understand** — a breakdown of why one reel worked: hook (verbal, visual, on-screen text), structure, payoff, what to borrow.
3. **Write** — pick an angle and get a ready-to-film script in the user's voice, with hook options, on-screen cues and a caption.
4. **Track** — the script lives in a Scripts library with a status (Draft → Filmed → Posted). When the user's matching reel goes live, show how it did against the source outlier.

## 5. Product principles

1. **Value on first visit.** A new user sees at least 15 relevant outliers and one example breakdown on their own niche before being asked to pay.
2. **Numbers you can trust.** One definition of "usual views", shown everywhere a multiple appears.
3. **No hidden costs.** Every action that uses quota says so on the button. Usage is always visible.
4. **The output is the product.** Scripts are saved, named, searchable objects, not chat history.
5. **Voice and strategy agree.** If the user's voice samples don't match their stated audience, tell them and let them choose.
6. **Chat is for refining, not for finding things.** Primary actions live on pages; Studio is where you edit and ask follow-ups.

## 6. Scope

### v1 (build this)

- Marketing landing page and pricing page
- Sign-up and onboarding (handle → profile read → short interview → pillars → strategy → niche map)
- Discover: outlier feed, filters, saved reels, creator rail, creator map
- Reel detail with the breakdown on the page
- Studio: write a script from a reel or from scratch; edit with chat; voice choice
- Scripts library with status
- Your reels: the user's own reels with multiples and "how did this do?"
- Context: About you (facts, positioning, audience, goals, pillars, proof bank, don't-use list) and Voice (profile, phrases, sources, versions)
- Settings: profile, linked accounts, notifications, plan & billing, danger zone
- Plans, quota and upgrade prompts
- Weekly email digest

### Later (design for, don't build yet)

- Multi-creator workspace with seats (agency)
- Performance loop: auto-match a posted reel to its script
- Weekly planner by pillar
- TikTok and YouTube Shorts sources
- Native mobile app

### Out of scope

- Video editing, scheduling, auto-posting
- Follower lists or audience demographics of other accounts

## 7. Features and acceptance criteria

### F1 · Onboarding
- User enters an Instagram handle; we verify it exists and is public before continuing.
- We read the last 30 reels and the profile, then show "Here's what we understood" (who they are, topics, tone) with Edit buttons.
- A 4–6 question interview (text or voice): offer, audience, goal, language, what they never want to say.
- User picks up to 5 content pillars from suggestions or writes their own.
- We generate the strategy docs and suggest 10–20 accounts to track; the user can remove any.
- **Voice check**: if voice sources and stated audience/positioning conflict, show the conflict card (see F7) before finishing.
- **Done when**: onboarding completes in under 10 minutes of user time; the feed shows ≥ 15 outliers at the end, or a clear progress state while it fills.

### F2 · Discover (outlier feed)
- Grid of reel cards: thumbnail, multiple badge, hook line (first spoken line, not the caption), creator, age, views.
- Sort: **Breaking now** (default), Newest, Highest multiple. Filter: format (reel, carousel), pillar, time window (7, 30, 90 days), creator.
- Saved tab. Save from card or detail.
- Right rail: tracked creators with their usual views and outlier count; click to filter; add/remove creators; Creator map button.
- **Sparse state**: if fewer than 15 cards, show why and offer: widen time window, lower threshold to 2×, add suggested creators.
- **Done when**: a new user's feed has ≥ 15 cards or an explicit fill-in-progress state, never a lone card on a blank grid.

### F3 · Reel detail and breakdown
- Header: creator, followers, usual views; actions Save and Open on Instagram.
- Performance card: multiple vs usual (bar comparison), growth chart with a note when tracking started late.
- **Breakdown on the page**: summary headline, hook scores (verbal, visual, on-screen text) each with the quote and a one-line reason, why it worked (3 bullets), structure timeline (hook → setup → payoff → CTA with timestamps), borrow-this list, a reusable hook template, transcript (collapsed).
- If not yet analysed: a button "Break it down · uses 1 breakdown". Already-analysed reels in the shared cache are free.
- Primary action: **Write my version** → angle picker → Studio.
- **Done when**: the breakdown renders on the reel page; the quota cost shows on the button; cached breakdowns cost nothing.

### F4 · Studio (write and refine)
- Two-pane layout: script editor (left), assistant chat (right). On mobile, tabs.
- Start options: from a reel (angle: Same hook, your topic · Same structure, your story · Your counter-take), from an idea, or from a pillar.
- Before generating: choose voice (Your voice / Neutral voice) with a 2-line preview of each.
- Script format: title, 3 hook options (pick one), body lines with optional on-screen cues, CTA, caption with hashtags, estimated length in seconds.
- Chat edits update the script in place with undo; every version kept.
- Empty state: 4 starters built from the user's pillars and top outliers this week.
- **Done when**: every generated script appears in Scripts immediately; the user can undo any chat edit.

### F5 · Scripts library
- Table/list: title, source reel, pillar, status (Draft, Ready to film, Filmed, Posted), updated date.
- Filters by status and pillar; search by title.
- Open → Studio with that script. Duplicate, delete (with confirm), copy to clipboard, export as text.
- **Done when**: scripts are findable without opening chat history.

### F6 · Your reels
- The user's own reels with multiple vs their usual, sorted by date by default; sort by multiple; filter by pillar.
- Each opens the same Reel detail view. "How did this do?" analysis uses 1 breakdown, labelled.

### F7 · Context (About you + Voice)
- About you: live facts (editable, with a "last checked" date), positioning, ideal customer, goals, pillars, proof bank, don't-use list, and a "What changed?" input that updates the docs.
- Voice: plain-language summary, energy, signature phrases, openers, closers, language mix; sources list (reels, voice recording, writing samples) with on/off toggles; earlier versions with restore.
- Every phrase is editable or removable (fixes transcription errors).
- **Conflict card**: when the voice's topics/language don't fit the positioning or audience, show: "Your voice comes from [X]. Your strategy targets [Y]." Actions: Keep this voice · Add a new sample · Use neutral voice for [pillar].

### F8 · Quota, plans and billing
- Sidebar QuotaMeter: breakdowns and scripts used this period.
- Billing page shows current plan, renewal date, usage bars, then plan options.
- Limit reached → inline upgrade card at the point of action, not a redirect.

| Plan | Price (example) | Tracked creators | Breakdowns / month | Scripts / month | Chat messages |
| --- | --- | --- | --- | --- | --- |
| Free | ₹0 | 10 | 5 | 3 | 30 |
| Creator | ₹499 / $9 | 75 | 50 | 30 | 400 |
| Pro | ₹1,999 / $29 | 150 | 100 | Unlimited (fair use) | 1,200 |

Prices are placeholders for your own decision. Giving Free a few scripts (Octupie gives none) lets new users feel the whole loop before paying.

### F9 · Notifications and email
- In-app: feed ready, voice ready, breakout alert (tracked creator reel > 5× within 24 h), quota at 80%.
- Weekly email (Monday): top 5 outliers, one ready-to-write idea per pillar.
- Notifications are marked read when the panel opens.

## 8. Success metrics

| Metric | Target for v1 |
| --- | --- |
| Activation: new users who open a breakdown on day 1 | 60% |
| Users who generate a first script within 7 days | 40% |
| Scripts marked Filmed or Posted within 14 days | 25% of scripts |
| Week-4 retention (any session) | 30% |
| Free → paid conversion within 30 days | 5% |
