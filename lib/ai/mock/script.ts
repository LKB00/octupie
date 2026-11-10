import type { Breakdown, ReelAngle, ScriptOutput, VoiceMode } from "@/lib/ai/schemas";

type Input = {
  angle: ReelAngle | "from_idea" | "from_pillar";
  voiceMode: VoiceMode;
  pillar: string | null;
  breakdown?: Breakdown | null;
  idea?: string | null;
};

const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

/** Canned P4 output in the fixture creator's voice (Hindi-English) or a neutral voice. */
export function mockScript({ angle, voiceMode, pillar, breakdown, idea }: Input): ScriptOutput {
  const own = voiceMode === "own";
  const topic = idea?.trim() || pillar || "fintech onboarding";
  const titleByAngle: Record<Input["angle"], string> = {
    same_hook: `The ${topic.toLowerCase()} mistake I see every week`,
    same_structure: `What shipping an AI refund agent taught me`,
    counter_take: `Why that advice breaks for fintech products`,
    from_idea: clip(topic.charAt(0).toUpperCase() + topic.slice(1), 70),
    from_pillar: `${topic}: one change that moves the numbers`,
  };

  const hooks = own
    ? [
        {
          text: "Kya aapko pata hai, most fintech apps KYC pe hi users kho dete hain?",
          why: "Rhetorical opener, your usual style",
        },
        {
          text: "I shipped an AI refund agent. Ye ek cheez sabse zyada matter ki.",
          why: "Uses your own proof",
        },
        {
          text: "Bhai, onboarding ko government office jaisa mat banao.",
          why: "Voice-led and relatable",
        },
      ]
    : [
        {
          text: "Most fintech apps lose users before the home screen.",
          why: "Bold, specific claim",
        },
        {
          text: "I shipped an AI refund agent. One decision mattered most.",
          why: "Uses your own proof",
        },
        {
          text: "Your onboarding feels like paperwork. Here's the fix.",
          why: "Names the pain directly",
        },
      ];

  const lines: ScriptOutput["lines"] = [
    { text: hooks[0]!.text, cue: "On screen: the claim in large type", beat: "hook" },
    {
      text: own
        ? "Main batata hoon jo maine apne projects mein dekha."
        : "Here's what I saw in my own projects.",
      cue: null,
      beat: "setup",
    },
    {
      text: own
        ? "Pehla: reward pehle dikhao, documents baad mein maango."
        : "First: show the reward before asking for documents.",
      cue: "Screen recording: reward screen before KYC",
      beat: "payoff",
    },
    {
      text: own
        ? "Doosra: har step pe batao kitne steps baaki hain."
        : "Second: tell people how many steps are left.",
      cue: "Highlight the step counter",
      beat: "payoff",
    },
    {
      text: own
        ? "Teesra: jo legally zaroori nahi, use skip karne do."
        : "Third: let them skip what isn't legally required.",
      cue: "Tap 'Do this later'",
      beat: "payoff",
    },
  ];
  // Ideas and pillars aren't about fintech: open on the topic and keep the body generic.
  if (angle === "from_idea" || angle === "from_pillar") {
    const claim = clip(topic.charAt(0).toUpperCase() + topic.slice(1).replace(/[.?!]$/, ""), 100);
    hooks[0] = own
      ? { text: clip(`Sach bataun? ${claim}.`, 120), why: "Confession opener, your usual style" }
      : { text: clip(`${claim}.`, 120), why: "States the idea as a bold claim" };
    hooks[1] = own
      ? { text: "Maine ye galti khud ki thi. Ab nahi karta.", why: "Uses your own story" }
      : { text: "I made this mistake myself. Here's what changed.", why: "Uses your own story" };
    hooks[2] = own
      ? { text: "Bhai, ye ek cheez sab miss karte hain.", why: "Voice-led and relatable" }
      : { text: "Almost everyone misses this one thing.", why: "Creates a curiosity gap" };
    lines.splice(
      0,
      lines.length,
      { text: hooks[0].text, cue: "On screen: the claim in large type", beat: "hook" },
      {
        text: own
          ? "Main batata hoon jo maine apne kaam mein dekha."
          : "Here's what I've seen in my own work.",
        cue: null,
        beat: "setup",
      },
      {
        text: own ? "Pehla: problem ek line mein bolo." : "First: name the problem in one line.",
        cue: "On screen: the problem in one line",
        beat: "payoff",
      },
      {
        text: own ? "Doosra: apna ek real example dikhao." : "Second: show one real example.",
        cue: "Screen recording of your example",
        beat: "payoff",
      },
      {
        text: own
          ? "Teesra: ek cheez batao jo aaj hi try ho sake."
          : "Third: give one thing to try today.",
        cue: "On screen: the one thing to try",
        beat: "payoff",
      },
    );
  }
  if (breakdown && angle === "same_structure") {
    lines.splice(2, 0, {
      text: clip(
        own
          ? `Same pattern jo is reel ne use kiya: ${breakdown.whyItWorked[0]!.key.toLowerCase()}.`
          : `It's the same pattern: ${breakdown.whyItWorked[0]!.key.toLowerCase()}.`,
        140,
      ),
      cue: null,
      beat: "setup",
    });
  }
  if (angle === "counter_take") {
    lines.splice(1, 1, {
      text: own
        ? "Sab bolte hain 'fewer steps'. Fintech mein ye galat hai."
        : "Everyone says 'fewer steps'. In fintech, that's wrong.",
      cue: "On screen: 'fewer steps?' crossed out",
      beat: "setup",
    });
  }
  const generic = angle === "from_idea" || angle === "from_pillar";
  const cta = generic
    ? own
      ? "Comment 'more' aur main full checklist bhejta hoon."
      : "Comment 'more' and I'll send the full checklist."
    : own
      ? "Comment 'flow' aur main full breakdown bhejta hoon."
      : "Comment 'flow' and I'll send the full breakdown.";
  lines.push({ text: cta, cue: null, beat: "cta" });

  const words = lines.reduce((n, l) => n + l.text.split(/\s+/).length, 0);
  return {
    title: clip(titleByAngle[angle], 80),
    hooks,
    lines,
    cta,
    caption: generic
      ? `${clip(topic.charAt(0).toUpperCase() + topic.slice(1), 120)}. ${
          own
            ? "Ek cheez aaj try karo aur batao kya hua."
            : "Try one thing today and tell me how it went."
        }`
      : own
        ? "Onboarding ko simple rakho. Ye 3 changes try karo aur batao kya hua."
        : "Three onboarding changes that keep people past KYC. Try one this week.",
    hashtags: generic
      ? ["#productdesign", "#uxdesign", "#designcareer"]
      : ["#productdesign", "#fintech", "#uxdesign", "#onboarding"],
    estSeconds: Math.max(15, Math.round(words / 2.5)),
    pillar,
  };
}
