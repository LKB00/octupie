/** Onboarding (docs/03 S3): five steps, the interview is one question per screen. */
export const ONBOARDING_STEPS = [
  { slug: "handle", label: "Your account" },
  { slug: "understood", label: "What we understood" },
  { slug: "interview", label: "A few questions" },
  { slug: "pillars", label: "Pillars" },
  { slug: "building", label: "Building" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["slug"];

export const INTERVIEW = [
  {
    key: "offer",
    q: "What do you sell, and to whom?",
    hint: "e.g. Portfolio reviews for junior product designers, ₹2,999 each.",
  },
  {
    key: "cta",
    q: "What should a new follower do after watching?",
    hint: "e.g. Comment PORTFOLIO, or book a call from the link in bio.",
  },
  {
    key: "languages",
    q: "Which language(s) do you post in?",
    hint: "e.g. Mostly English, Hindi for jokes and asides.",
  },
  {
    key: "never_sound",
    q: "What's one thing you never want to sound like?",
    hint: "e.g. A hustle-bro, or a LinkedIn thought leader.",
  },
  {
    key: "never_mention",
    q: "Anything we must never mention?",
    hint: "One per line. These go on your don't-use list.",
  },
] as const;

/** Suggested pillars: the ones read from your reels first, then common ones in your niche. */
export const EXTRA_PILLARS = [
  {
    id: "sp_portfolio",
    name: "Portfolio teardown",
    description: "Live reviews of real portfolios, what to cut and why.",
  },
  {
    id: "sp_career",
    name: "Career moves",
    description: "Switching into product design, interviews and offers.",
  },
  {
    id: "sp_tools",
    name: "Tools and workflow",
    description: "The tools and habits behind faster, better design work.",
  },
  {
    id: "sp_day",
    name: "Behind the work",
    description: "A day in your work, decisions and mistakes included.",
  },
];

export const MAX_PILLARS = 5;

export function stepIndex(slug: string) {
  return ONBOARDING_STEPS.findIndex((s) => s.slug === slug);
}
