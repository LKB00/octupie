/**
 * Mock profile photos (randomuser.me portraits). An empty string means the account has no
 * photo, so the UI shows Instagram's default silhouette, as Instagram does.
 */
const P = (g: "men" | "women", n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;

const AVATARS: Record<string, string> = {
  "demo.creator": P("men", 36),
  "pixelpriya.design": P("women", 44),
  uxwithkabir: P("men", 32),
  "founderfiles.in": "",
  thedesignloop: P("women", 68),
  figmafridays: P("men", 75),
  "buildinpublic.anu": P("women", 21),
  pmwithmeera: P("women", 12),
  casestudyclub: "",
  "ui.daily.dev": P("men", 46),
  startupsketches: P("men", 11),
  "portfolio.doctor": P("women", 90),
  "designhiring.in": P("men", 52),
  "onboarding.lab": "",
  "fintechux.in": P("men", 22),
  "designleads.daily": P("women", 33),
  "caseclub.mumbai": "",
  brandforfounders: P("men", 64),
  "uxwriting.desi": P("women", 57),
  "private.account": "",
};

export function mockAvatar(handle: string): string {
  return AVATARS[handle] ?? "";
}
