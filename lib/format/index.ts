/** Number and date formatting rules from docs/04-DESIGN-SYSTEM.md §5. */

export function compactNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const abs = Math.abs(n);
  const fmt = (v: number, suffix: string) => {
    const s = v >= 100 ? Math.round(v).toString() : (Math.round(v * 10) / 10).toString();
    return `${s}${suffix}`;
  };
  if (abs >= 1_000_000) return fmt(n / 1_000_000, "M");
  if (abs >= 1_000) return fmt(n / 1_000, "K");
  return Math.round(n).toString();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Relative under 7 days ("3 days ago"), otherwise "15 Oct". */
export function relativeDate(iso: string, now: Date): string {
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (diff < 0) return shortDate(iso);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return shortDate(iso);
}

/** Instagram-style short age for tight spaces: "5m", "13h", "3d", then "15 Oct". */
export function shortAge(iso: string, now: Date): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < 0) return shortDate(iso);
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return shortDate(iso);
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function clockTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function pluralise(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Instagram's counts: "8,817" under 10,000, then "44.1K", "1.2M". */
export function igCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  if (n < 10_000) return n.toLocaleString("en-US");
  return compactNumber(n);
}

/** Full number with separators, as Instagram writes likes on a post: "193,656". */
export function fullNumber(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("en-US");
}
