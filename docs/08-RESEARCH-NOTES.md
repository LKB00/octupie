# 08 · Research notes

Collected 9 Nov 2026. Re-check prices and API details before launch; they change often.

## 1. What the reference product does (from the audit)

Octupie (octupie.com, app v2.22.0) targets founders, coaches and creators who sell on Instagram. Loop: track niche accounts → feed of reels beating their account's usual views → "Why this went viral" breakdown inside a chat → three script angles → script in the user's voice. Pricing in India: Free, Creator ₹499/mo, Pro ₹1,999/mo with a 5-day ₹99 Pro trial; Paddle as merchant of record.

Strengths to keep: clear positioning against "AI chat" and "agency"; handle-first entry; outlier-vs-own-baseline idea; voice profile with versions; proof bank and don't-use list.

Problems to fix (full list in the audit doc): sparse first feed, voice–strategy mismatch not flagged, no Scripts page, Studio hidden from nav, breakdown only in chat, inconsistent "usual views" numbers, invisible quota, scattered settings, no social proof on the site.

## 2. Competitors and adjacent tools

| Product | Focus | Notes |
| --- | --- | --- |
| Sandcastles | Short-form outliers across Instagram, TikTok, YouTube Shorts + scripts | The best-known in this niche; channel tracking, competitive feed and playbooks. |
| Virlo | Outlier Reels, breakdowns and scripts in your voice | Also exposes an MCP so Claude/ChatGPT can query outliers. |
| 1of10 | YouTube long-form outliers and thumbnails | Different format; often used alongside Sandcastles. |
| Mysocial Outliers | Posts beating a creator's usual views on YouTube, TikTok, Instagram, X, Threads | Shows each post's multiple. |
| Outliers / ViewRank (Chrome extensions) | Rank a profile's reels by views vs followers | Free, manual, one profile at a time. |
| Format Finder | Ideas, scripts, shot plans and editing feedback | Production-side rather than research-side. |

**Where to differentiate**: Indian creators and bilingual (Hinglish, Tamil-English) voices; scripts as a managed library with status; the performance loop (did your version beat the source?); guaranteed-full first feed; transparent quota.

## 3. Getting Instagram data

**Official: Business Discovery API** (Instagram API with Facebook Login)
- Returns public data about other **Business or Creator** accounts: follower and media counts and media with like, comment and (for reels) `view_count`. `view_count` now combines Instagram and Facebook views for crossposted videos.
- Personal accounts can't be read. Saves and shares aren't available through Business Discovery.
- For reels whose owner has turned off downloads, the media URL is omitted in Business Discovery responses — so you may not be able to fetch the video for analysis.
- Needs a Meta app, a Business/Creator Instagram account connected to a Facebook Page, and app review; rate limits apply.

**Unofficial: scraping services** (Apify actors, HikerAPI, SociaVault and similar)
- Fast to integrate, work for any public account, return views, likes, comments, duration, captions and video URLs.
- Apify reel scrapers range from about $0.5 to $2.5 per 1,000 results depending on the actor; the official Apify actor lists $2.30 per 1,000 reels.
- **Risk**: scraping can breach Instagram's terms; actors break when Instagram changes; data accuracy varies. Treat as a prototype path and get legal advice before commercial use.

**Recommendation**: Mock for building → Apify for a private beta with a handful of users → Business Discovery for production coverage where possible; keep the provider interface so you can switch.

## 4. AI stack

- **Video understanding**: Gemini models take video directly (frames and audio together, sampled at about 1 frame per second) and can transcribe and describe visuals in one call. A 45-second reel costs a fraction of a cent on a Flash model. Claude doesn't accept video input, so use Gemini for "watching" and Claude for writing.
- **Speech to text** (fallback or for the user's own voice recordings): roughly $0.003–0.009 per minute (OpenAI gpt-4o-mini-transcribe ~$0.003/min; Deepgram Nova-3 multilingual ~$0.009/min; Deepgram's newer Flux model supports Hindi). Test on Hinglish samples before choosing.
- **Writing**: Claude Sonnet-class model for breakdowns, scripts and voice; Haiku-class for cheap tagging and previews. Use structured output and prompt caching for the creator context. Verify current model IDs and prices on docs.claude.com before launch.

## 5. Payments in India

Paddle (merchant of record) handles tax and international cards, and is what the reference product uses. Razorpay is the common Indian alternative with UPI support but you handle GST yourself. Start with Paddle sandbox; add Razorpay if most users pay by UPI.

## 6. Legal and privacy checklist (not legal advice)

- Instagram/Meta platform terms for any data source you use.
- Copyright: analyse other creators' reels, don't re-host them; link out and show thumbnails only.
- India's Digital Personal Data Protection Act: consent for collecting the user's own data, deletion on request, a privacy policy that lists processors (Supabase, Anthropic, Google, Paddle, email provider).
- Don't store follower lists or personal data about tracked accounts beyond public profile and post metrics.
- Don't use another product's name, logo, copy or exact visual identity.

## 7. Sources

- Meta for Developers — IG User Business Discovery reference: https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery
- Meta for Developers — Instagram Media reference: https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media
- Meta for Developers blog — API updates (Apr 2026): https://developers.facebook.com/blog/post/2026/04/22/instagram-api-updates-for-partnerships-metrics-collaboration-and-engagement/
- Instagram Platform changelog: https://developers.facebook.com/documentation/instagram-platform/changelog
- Apify — Instagram Reel Scraper: https://apify.com/apify/instagram-reel-scraper
- Apify — community reel scrapers (pricing examples): https://apify.com/insta_scrapper/instagram-reels-scraper.md, https://apify.com/datascraperes/instagram-public-reels-scraper.md
- Zernio — Instagram Graph API alternatives (HikerAPI pricing): https://zernio.com/blog/instagram-graph-api-alternative
- Speech-to-text pricing comparisons: https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026, https://costbench.com/software/ai-transcription-apis/deepgram/
- Gemini video understanding: https://gemini-api.apidog.io/doc-965861, cost estimates https://vorplabs.com/models/video-understanding-costs
- Competitors: https://creatoreconomytools.com/blog/sandcastles-vs-1of10-comparison-2026, https://virlo.ai/reels, https://mysocial.io/outliers.md, https://formatfinder.onepeakcreative.com/resources/compare/format-finder-vs-sandcastles-ai
- Reference product: https://www.octupie.com, https://www.octupie.com/pricing (reviewed 9 Nov 2026)
