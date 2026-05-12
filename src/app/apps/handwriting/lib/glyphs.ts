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
