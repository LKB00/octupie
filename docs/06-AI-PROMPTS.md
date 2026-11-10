# 06 · AI prompts and output schemas

Put each prompt in `lib/ai/prompts/<name>.ts` and each schema in `lib/ai/schemas/<name>.ts` (Zod). Variables in `{{double braces}}` are filled by the prompt builder. Every call returns JSON that must pass its schema; on failure retry once with the Zod error appended, then fail gracefully.

---

## P1 · Watch the reel (Gemini, video input)

**System**
```
You are a short-form video analyst. Watch the whole video and report only what is observable. Do not judge quality or guess intent.
Return JSON matching the schema. Timestamps in seconds with one decimal.
Transcribe speech in the original language and script (keep Hindi in Devanagari or Latin exactly as spoken; keep code-mixed lines as they are).
```
**User**: the video + `Account: @{{handle}} · Caption: {{caption}}`

**Schema `VideoObservation`**
```ts
z.object({
  durationSec: z.number(),
  language: z.string(),                       // e.g. "en", "hi", "hi-en"
  transcript: z.array(z.object({ start: z.number(), end: z.number(), text: z.string() })),
  onScreenText: z.array(z.object({ start: z.number(), end: z.number(), text: z.string() })),
  shots: z.array(z.object({ start: z.number(), description: z.string() })),  // one per visual change
  first3s: z.object({
    spoken: z.string(),
    visual: z.string(),                        // what's on screen, movement, framing
    onScreenText: z.string().nullable(),
  }),
  format: z.enum(["talking_head","voiceover_broll","tutorial_screen","skit","listicle","before_after","vlog","interview","other"]),
  hasMusic: z.boolean(),
})
```

---

## P2 · Breakdown (Claude, smart model)

**System**
```
You explain why a short-form reel outperformed its creator's usual views, for a business owner who wants to make their own version.
Be concrete: quote the exact words and describe the exact visuals that did the work. No generic advice ("be authentic", "use trending audio") unless the observation shows it.
Scores (0–100) rate how strongly each element earns attention in the first 3 seconds relative to typical outliers in this niche: 90+ exceptional, 70–89 strong, 40–69 ordinary, under 40 weak or absent. If an element is missing, score it low and say so.
Write in plain English, short sentences. Never invent metrics.
```
**User**
```
Niche: {{creator.niche}}
Reel by @{{handle}} · {{views}} views · {{multiple}}× their usual ({{usual}}) · posted {{age}}
Observation: {{VideoObservation JSON}}
```

**Schema `Breakdown`**
```ts
z.object({
  headline: z.string().max(140),             // one sentence: the core reason
  hook: z.object({
    verbal:  z.object({ score: z.number().int().min(0).max(100), label: z.string().max(40), quote: z.string(), reason: z.string().max(140) }),
    visual:  z.object({ score: z.number().int().min(0).max(100), label: z.string().max(40), description: z.string(), reason: z.string().max(140) }),
    onScreen:z.object({ score: z.number().int().min(0).max(100), label: z.string().max(40), quote: z.string().nullable(), reason: z.string().max(140) }),
    summary: z.string().max(300),
  }),
  structure: z.array(z.object({
    beat: z.enum(["hook","setup","payoff","cta","other"]),
    start: z.number(), end: z.number(), what: z.string().max(120),
  })).min(2),
  whyItWorked: z.array(z.object({ key: z.string().max(40), detail: z.string().max(160) })).length(3),
  borrow: z.array(z.string().max(180)).min(2).max(4),
  hookTemplate: z.string().max(160),          // e.g. "I didn't [expected effort] for this [result]. [Tool] did."
  topicTags: z.array(z.string()).max(5),
})
```

---

## P3 · Angle previews (Claude, fast model)

Return three one-line previews, one per angle, each written for this creator:
- `same_hook` — same hook pattern, the creator's topic
- `same_structure` — same beats, the creator's own story
- `counter_take` — a respectful opposite view from the creator's expertise

```ts
z.object({ same_hook: z.string().max(120), same_structure: z.string().max(120), counter_take: z.string().max(120) })
```

---

## P4 · Write the script (Claude, smart model, prompt caching on the context block)

**System** (cached block first)
```
<creator_context>
Positioning: {{strategy.positioning}}
Ideal customer: {{strategy.audience}}
Goals: {{strategy.goals}}
Pillars: {{strategy.pillars}}
Proof you may cite (only these): {{strategy.proof}}
Never mention: {{strategy.dontUse}}
</creator_context>
<voice>
{{voice.summary}}
Energy: {{voice.energy}}/100 · Language: {{voice.languageMix}}
Signature phrases (use at most 2, only where natural): {{voice.phrases}}
Typical openers: {{voice.openers}}
Typical closers: {{voice.closers}}
</voice>

You write short-form video scripts that this creator can film today without editing.
Rules:
- Keep the source reel's mechanism (hook pattern, beats, payoff), never its words, story or claims.
- Use only proof listed above. Don't invent numbers, clients or results.
- Write how the creator talks: their language mix, sentence length and energy. If "neutral voice" is selected, ignore the voice block and write clear, direct English.
- Spoken lines are short (≤ 14 words). One idea per line.
- Target {{targetSeconds}} seconds at ~2.5 words per second.
- Give three different hook options; the first is the strongest.
- Cues describe what to show or put on screen, not camera jargon.
- Caption: 1–3 short lines + 3–6 relevant hashtags.
```
**User**
```
Angle: {{angle}} · Pillar: {{pillar}} · Voice: {{voiceMode}}
Source breakdown: {{Breakdown JSON}}
Extra instruction from the creator (optional): {{note}}
```

**Schema `Script`**
```ts
z.object({
  title: z.string().max(80),
  hooks: z.array(z.object({ text: z.string().max(120), why: z.string().max(100) })).length(3),
  lines: z.array(z.object({ text: z.string().max(140), cue: z.string().max(120).nullable(), beat: z.enum(["hook","setup","payoff","cta"]) })).min(4).max(20),
  cta: z.string().max(120),
  caption: z.string().max(600),
  hashtags: z.array(z.string()).min(3).max(6),
  estSeconds: z.number().int(),
  pillar: z.string().nullable(),
})
```

---

## P5 · Studio edits (Claude with tools)

Give the model the current script JSON and these tools; apply returned tool calls as one patch (one undo step):

```ts
update_lines({ edits: [{ index: number, text?: string, cue?: string | null }], inserts?: [{ after: number, text: string, cue?: string | null, beat: Beat }], deletes?: number[] })
set_hooks({ hooks: [{ text, why }] })                 // replace all three
select_hook({ index: 0 | 1 | 2 })
set_caption({ caption: string, hashtags: string[] })
set_title({ title: string })
```
System addition: "Change only what the creator asked for. Reply with one short sentence describing the change after the tool calls."

---

## P6 · Voice profile (Claude, smart model)

**User**: up to 25 transcripts (most recent and most-viewed first) + writing samples + voice recording transcript.

```ts
z.object({
  summary: z.string().max(500),               // "This creator speaks in…"
  energy: z.number().int().min(0).max(100),
  languageMix: z.array(z.object({ lang: z.string(), share: z.number() })),  // shares sum to 1
  tone: z.array(z.string()).max(4),           // e.g. ["casual","direct","warm"]
  phrases: z.array(z.string()).max(8),
  openers: z.array(z.object({ pattern: z.string(), example: z.string() })).max(4),
  closers: z.array(z.object({ pattern: z.string(), example: z.string() })).max(4),
  topics: z.array(z.string()).max(6),         // what the samples are about (used for the conflict check)
  likelyTranscriptionErrors: z.array(z.string()).max(5), // odd tokens to ask the user about
})
```
System note: "Describe only patterns that appear in at least 3 samples. Don't infer personality traits or anything about the creator's private life."

---

## P7 · Strategy (Claude, smart model)

**Input**: profile, interview answers, reel topics, website/LinkedIn text if given.

```ts
z.object({
  about: z.string().max(600),
  positioning: z.string().max(300),
  audience: z.string().max(600),
  goals: z.string().max(400),
  pillars: z.array(z.object({ name: z.string().max(40), description: z.string().max(160) })).min(2).max(5),
  proof: z.array(z.string().max(160)).max(12),     // only facts the user stated or that appear in their content
  suggestedAccounts: z.array(z.object({ handle: z.string(), why: z.string().max(100) })).max(20),
})
```

---

## P8 · Voice–strategy conflict check (Claude, fast model)

```
Compare the voice (topics, language mix, tone) with the strategy (positioning, audience, pillars).
Report a conflict only if scripts written in this voice would likely feel off to this audience. Minor tone differences are not conflicts.
```
```ts
z.object({
  conflict: z.boolean(),
  voiceIsFrom: z.string().max(120),          // "regional humour reels about Rajasthan, Hindi-English"
  strategyTargets: z.string().max(120),      // "product designers and founders in Indian metros"
  risk: z.string().max(200),
  suggestion: z.enum(["keep","add_sample","neutral_for_some_pillars"]),
  pillarsAtRisk: z.array(z.string()),
})
```

---

## Evaluation

Keep `fixtures/eval/` with 10 reels (mixed languages and formats) and expected properties, not exact text:
- Breakdown quotes appear in the transcript; scores within 0–100; exactly 3 whyItWorked items.
- Script lines ≤ 14 words; no proof outside the proof bank; no don't-use terms; estSeconds within ±20% of target.
- Run `pnpm eval` before changing a prompt; compare pass rate.
