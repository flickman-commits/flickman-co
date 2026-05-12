/**
 * The set of glyphs we ask the user to draw.
 * Order = the order shown in the drawing flow.
 *
 * `zone` controls the on-canvas guide hint:
 *   - 'cap'        → tall letters that sit on the baseline (A, B, T, …)
 *   - 'x'          → short letters that sit on the baseline (a, c, e, …)
 *   - 'ascender'   → tall lowercase (b, d, h, k, l, t, f)
 *   - 'descender'  → letters that hang below baseline (g, j, p, q, y)
 *   - 'punct'      → small marks (sit around baseline)
 */
export type Zone = "cap" | "x" | "ascender" | "descender" | "punct";

export interface GlyphSpec {
  char: string;
  label?: string;
  zone: Zone;
}

const upper: GlyphSpec[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({ char: c, zone: "cap" }));

const lowerZone = (c: string): Zone => {
  if ("bdfhklt".includes(c)) return "ascender";
  if ("gjpqy".includes(c)) return "descender";
  return "x";
};
const lower: GlyphSpec[] = "abcdefghijklmnopqrstuvwxyz".split("").map((c) => ({
  char: c,
  zone: lowerZone(c),
}));

const digits: GlyphSpec[] = "0123456789".split("").map((c) => ({ char: c, zone: "cap" }));

const punct: GlyphSpec[] = [
  { char: ".", label: "period", zone: "punct" },
  { char: ",", label: "comma", zone: "punct" },
  { char: "!", label: "exclamation", zone: "cap" },
  { char: "?", label: "question", zone: "cap" },
  { char: "'", label: "apostrophe", zone: "punct" },
];

export const glyphs: GlyphSpec[] = [...upper, ...lower, ...digits, ...punct];

export const TOTAL_GLYPHS = glyphs.length;

export type Phase = "upper" | "lower" | "digits" | "punct";

export const PHASES: { key: Phase; label: string; total: number; emoji: string }[] = [
  { key: "upper", label: "UPPERCASE", total: upper.length, emoji: "🅰️" },
  { key: "lower", label: "lowercase", total: lower.length, emoji: "🔡" },
  { key: "digits", label: "Numbers", total: digits.length, emoji: "🔢" },
  { key: "punct", label: "Punctuation", total: punct.length, emoji: "❗" },
];

export function phaseForChar(c: string): Phase {
  if (/^[A-Z]$/.test(c)) return "upper";
  if (/^[a-z]$/.test(c)) return "lower";
  if (/^[0-9]$/.test(c)) return "digits";
  return "punct";
}

/** First index of a given phase in the global glyphs array. */
export function phaseStartIndex(p: Phase): number {
  return glyphs.findIndex((g) => phaseForChar(g.char) === p);
}

/** Position (1-indexed) of `globalIndex` within its phase. */
export function indexWithinPhase(globalIndex: number): { i: number; phase: Phase; total: number; label: string } {
  const phase = phaseForChar(glyphs[globalIndex].char);
  const start = phaseStartIndex(phase);
  const info = PHASES.find((p) => p.key === phase)!;
  return { i: globalIndex - start + 1, phase, total: info.total, label: info.label };
}
