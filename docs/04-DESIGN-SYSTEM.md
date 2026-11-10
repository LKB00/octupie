# 04 · Design system

## 1. Direction (v2, Nov 2026)

Calm, modern SaaS. The app sits in an **inset frame**: the sidebar lives on a tinted canvas and the content sits in one white, rounded (24 px) panel. Inside it: flat white cards with 16–20 px radii and hairline borders (shadows only on floating layers); **tinted icon tiles** as the main decorative device; quiet gradient washes for hero areas and highlighted cards. One violet brand colour for primary actions, selection and data emphasis; an ink "dark" button for the single most important action on a page. Photos carry frosted overlays (multiple, save, creator).

v1 used square frames with hard offset shadows; that look was retired because it read as a landing page, not a working tool.

One typeface, Inter (optical sizes on), for everything; JetBrains Mono for hook templates.

## 2. Reference values observed on octupie.com and app.octupie.com (9 Nov 2026)

Measured with computed styles in Chrome. Use these to understand the feel, not to copy the brand.

| Token | Light | Dark |
| --- | --- | --- |
| Page background | `#f5f7fb` | `#000000` |
| Surface | `#ffffff` | `#0e0e10` |
| Surface 2 / hover / segment track | `#edf0f7` | `#1a1a1d` |
| Ink (text) | `#0b1430` | `#ededed` |
| Muted text | `rgba(11,20,48,.65)` | `#c8c8cb` |
| Border / strong | `rgba(11,20,48,.10)` / `.18` | `rgba(255,255,255,.22)` |
| Brand 1 / Brand 2 | `#4c61ff` / `#014ce3` | — |
| Success / warning / danger text | `#166534` / `#92400e` / `#b91c1c` | — |
| Chart series | `#2a78d6 #eb6834 #1baf7a #eda100 #e87ba4 #008300 #4a3aa7` | — |
| Card lift shadow | `0 1px 2px rgba(11,20,48,.04), 0 4px 16px rgba(11,20,48,.04)` | — |
| Input glow | `0 0 34px -6px rgba(1,76,227,.55)` | — |
| Offset CTA shadow | `5px 5px 0 #0b1430` (hero) · `4px 4px 0 #8c92a3` (nav) | — |
| Fonts | Display: Host Grotesk · Body: Inter | |
| Marketing H1 / H2 | 80/81.6, weight 500, tracking −2.8px · 52/54, −1.56px | |
| App page title | 32/35.2, weight 400, Host Grotesk | |
| Nav item | 14/20 Inter, pill, padding 8×11; active white + brand-2 text | |
| Segmented control | track `#edf0f7`, padding 2, option 12/16 weight 500, pill | |
| Reel card | 220 px column, 1 px solid ink border, 0 radius, 10 px padding | |
| Feed grid gap | 24 px columns, 40 px rows | |
| Sidebar width | 224 px | |

## 3. Tokens (in `design/tokens.css`)

| Role | Token | Light | Dark |
| --- | --- | --- | --- |
| Canvas | `--bg` | `#f3f3f7` | `#0b0b0f` |
| Surface | `--surface` | `#ffffff` | `#131318` |
| Fill / hover | `--surface-2` | `#f6f6f9` | `#1a1a21` |
| Track / pressed | `--surface-3` | `#ececf2` | `#24242d` |
| Ink | `--text` | `#16161d` | `#f2f2f5` |
| Muted / faint | `--text-muted` / `--text-faint` | `#5f5f6e` / `#6b6b7d` | `#a3a3b2` / `#8a8a98` |
| Border / strong | `--border` / `--border-strong` | `#e9e9f0` / `#d6d6e0` | `#25252e` / `#34343f` |
| Brand | `--brand` | `#6d4aff` (5.2:1 with white) | `#6a4cf0` (5.4:1 with white) |
| Brand text / tint | `--brand-strong` / `--brand-weak` | `#5530e8` / `#f1edff` | `#a993ff` / violet 14% |
| Hot (≥ 10×) | `--hot` + `--text-on-hot` | `#ff5c35` + ink | `#ff7a52` + ink |
| Icon tiles | `--tint-{violet,amber,sky,rose,mint}` + `-bg` | AA pairs | AA pairs |
| On photos | `--scrim`, `--scrim-strong`, `--glass`, `--on-media` | same in both themes | |

### Type scale

One family: **Inter** with optical sizing on (large sizes get Inter's tighter display cut), plus JetBrains Mono for hook templates. Every text style is one of these roles (utilities in `app/globals.css`); components never set font sizes directly.

| Role | Utility | Size / line | Weight | Use |
| --- | --- | --- | --- | --- |
| Display | `type-display` | 40/48 (32/40 on phones), −0.025em | 600 | One per page at most: Home hero, Studio start |
| Page title | `type-title` | 28/36 (24/32 on phones), −0.02em | 600 | The page's h1 |
| Section | `type-section` | 18/26, −0.012em | 600 | Section headers (`SectionHeader`), breakdown headline |
| Card title | `type-card-title` | 15/22 | 600 | Card, panel and list-item titles (`SectionCard`) |
| Body | `type-body` | 15/24 | 400 | Reading text, script lines |
| Body small | `type-body-sm` | 14/20 | 400 | UI text, descriptions, table cells |
| Label | `type-label` | 13/18 | 500 | Controls, tabs, field labels, badges |
| Caption | `type-caption` | 12/16 | 400 | Meta: ages, counts, helper text |
| Overline | `type-overline` | 11/16, +0.06em, uppercase | 600 | Group labels (sidebar groups, outline) |
| KPI | `type-kpi` | 28/36, tabular | 600 | Big numbers in stat tiles |
| Stat | `type-stat` | 18/24, tabular | 600 | Inline numbers (profile stats, map panel) |
| Mono | `type-mono` | 13/20 | 400 | Hook templates |

Colour carries the second level of hierarchy: `--text` for titles and values, `--text-muted` for descriptions, `--text-faint` for hints only.

### Spacing rhythm

4-point scale, used the same way on every page:

| Gap | Where |
| --- | --- |
| 32 | Between page sections (every page root is `gap-8`) |
| 24 | Toolbar or filters → the list they control |
| 16 | Section header → content; between cards in a grid; inside a card between blocks |
| 12 | Between rows in a list |
| 20 | Padding inside a card (`rounded-xl`) |
| 16 | Padding inside a nested tile, option or alert (`rounded-lg`) |

### Radius and elevation

- Radius: `--r-sm 8` (small buttons), `--r-md 12` (large buttons, inputs), `--r-lg 16` (nested tiles, options, alerts), `--r-xl 20` (cards, panels), `--r-2xl 24` (app frame, dialogs, hero), `--r-full`.
- **Elevation only for things that float.** Cards, panels, tiles, tables, inputs and buttons are flat: a hairline border, no shadow, no hover lift. Hover feedback on clickable cards is a stronger border and a faint fill. Shadows are reserved for `--shadow-pop` (menus, popovers, dialogs, toasts, tooltips), `--shadow-selected` (the selected segment) and `--shadow-glow` (keyboard focus).

### Instagram identity

Accounts look the way Instagram shows them: a circular photo with a hairline edge, then the **username in semibold with no "@"**, then one muted line. Accounts without a photo show Instagram's default (a white silhouette on light grey), never initials. Use `IgAvatar`, `IgUsername` and `AccountRow` from `components/app/ig/`.

## 4. Components

| Component | Spec |
| --- | --- |
| **Button** | Heights 32/40/48, radius 8/10/12. Variants: primary (brand), dark (ink, one per page), secondary (surface + border), ghost (toolbar), danger. Press scales to 98%. |
| **Cost** | A pill inside the button ("uses 1 breakdown"), never hidden; the button's accessible name includes it. |
| **Nav item** | 36 px, radius 10, muted icon + label; active: surface fill, selected shadow, brand icon. |
| **Segmented control / tabs** | Track `--surface-3`, radius 10, 2 px padding; selected segment surface + ink + selected shadow. |
| **Filter chips** | Pills; selected = ink fill. |
| **Input** | 40 px, radius 10, xs shadow; focus: brand border + glow ring. Composer variant: 2xl card with toolbar row. |
| **IconTile** | 32/40/48 px tinted square holding a 16–24 px icon. |
| **ReelTile (feed)** | Instagram post vocabulary: 3:4 cover, reel/carousel marker top-right, ▶ play count bottom-left, our multiple top-left; hover shows ♥ and comment counts. Below: hook line (card-title, 2 lines), avatar + @handle · age, bookmark. |
| **ReelTile (grid)** | Instagram profile/saved grid: tight 4 px gaps, radius 8, overlays only. Used for Saved and Your reels. |
| **ReelPlayer** | Instagram reel frame: 9:16, action rail (likes, comments, share = copy link, save), creator + caption + "Original audio" at the bottom. |
| **Icons** | Phosphor (`@phosphor-icons/react/dist/ssr`), regular weight; the active nav item uses duotone. One icon per concept, from `components/app/icons.ts`. Reel metrics use Instagram's meanings: play = views, heart = likes, bubble = comments, plane = share, bookmark = save. shadcn primitives in `components/ui` keep their Lucide chevrons and checks; the logo is a brand mark, not an icon. |
| **MultipleBadge** | Pill with trend icon, "3.4×"; ≥ 10× hot fill with ink text. Always paired with `UsualTooltip`. |
| **HookScore** | 48 px ring (score colour by band), label, quote with brand rule, reason. |
| **Card / panel** | Surface, radius xl, hairline border, padding 20, no shadow; highlighted cards use `--wash-violet`. |
| **Dialog** | Radius 2xl, max-width 560, padding 24, blurred overlay. |
| **Toast** | Radius 12, surface, icon by tone, auto-dismiss 4 s, pause on hover. |
| **Skeleton** | `--surface-2` with a 1.2 s shimmer; static under reduced motion. |

## 5. Patterns

- **Empty state**: one sentence + one primary action; no illustrations needed.
- **Sparse state**: a banner, not a modal; offer 2–3 concrete ways to get more.
- **Cost disclosure**: on the button, before the click; result toast "Breakdown ready · 3 left this month".
- **Help**: (?) next to every page title; 2-sentence popover.
- **Motion**: 150 ms ease-out for hovers, 200 ms for dialogs and card lifts; marquee and shimmer off under `prefers-reduced-motion`.
- **Numbers**: compact format (31K, 1.4M), multiples to 1 decimal under 10× and whole numbers above (3.4×, 48×).
- **Dates**: relative under 7 days ("3 days ago"), else "15 Oct".
