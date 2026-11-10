import type { ScriptContent, StudioReplyInput as StudioReply } from "@/lib/ai/schemas";

export { QUICK_CHIPS } from "./studio-chips";

const HINGLISH: [RegExp, string][] = [
  [/^Here's/i, "Dekho,"],
  [/\bFirst:/i, "Pehla:"],
  [/\bSecond:/i, "Doosra:"],
  [/\bThird:/i, "Teesra:"],
  [/\bthis week\b/i, "is hafte"],
  [/\bMost\b/, "Zyada tar"],
];

const EDIT_SUGGESTIONS = ["Make it shorter", "Stronger hook", "More like me", "Add a story"];

/** Talk, don't edit: greetings, thanks, questions and anything unclear get a reply only. */
function conversational(message: string, script: ScriptContent): StudioReply | null {
  const m = message
    .toLowerCase()
    .trim()
    .replace(/[!?.]+$/, "");
  if (
    /^(hi|hii+|hello|hey|hey there|namaste|yo|good (morning|afternoon|evening))\b/.test(m) &&
    m.split(/\s+/).length <= 4
  ) {
    return {
      calls: [],
      message: "Hi. Tell me what to change, or pick one below.",
      suggestions: EDIT_SUGGESTIONS,
    };
  }
  if (
    /^(thanks|thank you|thx|great|nice|perfect|cool|ok|okay)\b/.test(m) &&
    m.split(/\s+/).length <= 4
  ) {
    return {
      calls: [],
      message: "Glad that works. Anything else you want to change?",
      suggestions: [],
    };
  }
  if (/\b(how long|length|seconds|duration)\b/.test(m)) {
    return {
      calls: [],
      message: `It runs about ${script.estSeconds} seconds at a normal speaking pace (${script.lines.length} lines).`,
      suggestions: ["Make it shorter"],
    };
  }
  if (/\bwhy\b/.test(m) && /\bhook\b/.test(m)) {
    const h = script.hooks[script.selectedHook]!;
    return {
      calls: [],
      message: `The current hook works because: ${h.why.toLowerCase()}. Want a sharper one?`,
      suggestions: ["Stronger hook"],
    };
  }
  if (/\b(what can you do|help|how does this work)\b/.test(m)) {
    return {
      calls: [],
      message:
        "Tell me what to change and I'll edit the script directly. Every change shows in the script and can be undone.",
      suggestions: EDIT_SUGGESTIONS,
    };
  }
  return null;
}

const EDIT_WORDS =
  /\b(shorter|short|hook|hinglish|hindi|like me|story|title|caption|line \d+|punchier|tighter|cut|remove|add|rewrite|change|make)\b/;

/** Canned P5 output: conversation when the creator is chatting, tool calls when they ask for an edit. */
export function mockStudioReply(message: string, script: ScriptContent): StudioReply {
  const talk = conversational(message, script);
  if (talk) return talk;
  const m = message.toLowerCase();
  const lines = script.lines;
  if (!EDIT_WORDS.test(m)) {
    return {
      calls: [],
      message:
        "I'm not sure what you'd like me to change. Pick one of these, or describe the edit, like \"make line 3 punchier\".",
      suggestions: EDIT_SUGGESTIONS,
    };
  }
  const lineRef = m.match(/\bline (\d+)\b/);
  if (lineRef) {
    const i = Number(lineRef[1]) - 1;
    const line = lines[i];
    if (!line)
      return {
        calls: [],
        message: `This script has ${lines.length} lines, so there's no line ${i + 1}.`,
        suggestions: [],
      };
    const words = line.text.replace(/[.!?]$/, "").split(/\s+/);
    const text =
      (words.length > 6
        ? words.slice(0, Math.ceil(words.length * 0.7)).join(" ")
        : words.join(" ")) + ".";
    return {
      calls: [{ tool: "update_lines", edits: [{ index: i, text }], inserts: [], deletes: [] }],
      message: `Tightened line ${i + 1}.`,
      suggestions: [],
    };
  }

  if (m.includes("shorter")) {
    const payoffs = lines.map((l, i) => ({ l, i })).filter(({ l }) => l.beat === "payoff");
    const deletes = payoffs.length > 1 ? [payoffs[payoffs.length - 1]!.i] : [];
    const setup = lines.findIndex((l) => l.beat === "setup");
    const setupLine = setup >= 0 ? lines[setup] : undefined;
    const edits =
      setupLine && setup >= 0
        ? [{ index: setup, text: setupLine.text.split(/[,.]/)[0]!.trim() + "." }]
        : [];
    return {
      calls: [{ tool: "update_lines", edits, inserts: [], deletes }],
      message: deletes.length
        ? `Removed line ${deletes[0]! + 1} and tightened the setup.`
        : "Tightened the setup line.",
    };
  }
  if (m.includes("hook")) {
    return {
      calls: [
        {
          tool: "set_hooks",
          hooks: [
            {
              text: "4 out of 30 fintech apps got onboarding right. Here's how.",
              why: "Number + curiosity gap",
            },
            script.hooks[0]!,
            script.hooks[1]!,
          ],
        },
        { tool: "select_hook", index: 0 },
        {
          tool: "update_lines",
          edits: [{ index: 0, text: "4 out of 30 fintech apps got onboarding right. Here's how." }],
          inserts: [],
          deletes: [],
        },
      ],
      message: "Added a sharper hook with a number and used it as line 1.",
    };
  }
  if (m.includes("hinglish") || m.includes("like me")) {
    const edits = lines
      .map((l, index) => {
        let text = l.text;
        for (const [re, sub] of HINGLISH) text = text.replace(re, sub);
        if (index === 0 && m.includes("like me") && !/bhai/i.test(text))
          text = `Bhai, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
        return { index, text: text.slice(0, 140) };
      })
      .filter((e, i) => e.text !== lines[i]!.text);
    return {
      calls: [
        {
          tool: "update_lines",
          edits: edits.length
            ? edits
            : [{ index: 0, text: `Bhai, ${lines[0]!.text}`.slice(0, 140) }],
          inserts: [],
          deletes: [],
        },
      ],
      message: m.includes("like me")
        ? "Opened with your usual 'bhai' and kept your phrasing."
        : "Switched the lines to Hindi-English.",
    };
  }
  if (m.includes("story")) {
    const after = Math.max(
      0,
      lines.findIndex((l) => l.beat === "setup"),
    );
    return {
      calls: [
        {
          tool: "update_lines",
          edits: [],
          deletes: [],
          inserts: [
            {
              after,
              text: "Last year our refund flow lost 1 in 3 users at the document step.",
              cue: "B-roll: old refund screen",
              beat: "setup",
            },
          ],
        },
      ],
      message: `Added a short story after line ${after + 1}.`,
    };
  }
  if (m.includes("title")) {
    return {
      calls: [
        {
          tool: "set_title",
          title:
            message
              .replace(/.*title( to)?:?/i, "")
              .trim()
              .slice(0, 80) || script.title,
        },
      ],
      message: "Updated the title.",
    };
  }
  if (m.includes("caption")) {
    return {
      calls: [
        {
          tool: "set_caption",
          caption: `${script.caption} Save this for your next launch.`.slice(0, 600),
          hashtags: script.hashtags,
        },
      ],
      message: "Added a save prompt to the caption.",
    };
  }
  return {
    calls: [],
    message:
      "In mock mode I can make these edits: shorter, stronger hook, more like you, Hinglish, add a story, change a line, the title or the caption. Which one?",
    suggestions: EDIT_SUGGESTIONS,
  };
}
