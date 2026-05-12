/**
 * Build a real .otf file from the user's drawn glyphs.
 *
 * Strategy:
 *   - opentype.js builds OpenType fonts from `Path` objects (filled vector shapes).
 *   - The user's strokes are point arrays from a touch/mouse canvas.
 *   - We convert each stroke into a "thick line" — a chain of rectangles between
 *     consecutive points, plus filled circles at every vertex for rounded joins
 *     and end caps. Overlap is fine: opentype.js writes the outline and font
 *     renderers fill it with the non-zero winding rule.
 *   - Canvas y grows down; font y grows up. We flip when converting.
 */
import * as opentype from "opentype.js";
import type { GlyphData, GlyphMap, Point, Stroke } from "./types";

const UNITS_PER_EM = 1000;
// We design the canvas around a baseline at 4/5 of its height. That means
// `ascender / (ascender - descender) = 4/5` → ascender = 800, descender = -200.
const ASCENDER = 800;
const DESCENDER = -200;
const CAP_HEIGHT = 700;
const X_HEIGHT = 500;

const SIDE_BEARING = 60; // font units of empty space on each side of a glyph
const DEFAULT_ADVANCE = 500; // for empty glyphs (skipped or space)

/** Approximate a circle with 4 cubic bezier curves added to `path`. */
function addCircle(path: opentype.Path, cx: number, cy: number, r: number) {
  const k = 0.5522847498307936 * r;
  path.moveTo(cx + r, cy);
  path.curveTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r);
  path.curveTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy);
  path.curveTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r);
  path.curveTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy);
  path.close();
}

/**
 * Convert a single drawn stroke to opentype path commands.
 * `transform` maps canvas (x,y) into font coordinates.
 */
function addStrokeToPath(
  path: opentype.Path,
  stroke: Stroke,
  radius: number,
  transform: (p: Point) => Point
) {
  if (stroke.length === 0) return;
  const pts = stroke.map(transform);

  if (pts.length === 1) {
    addCircle(path, pts[0].x, pts[0].y, radius);
    return;
  }

  // Add a quad for each segment.
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) continue;
    // Perpendicular vector, length = radius.
    const nx = (-dy / len) * radius;
    const ny = (dx / len) * radius;
    path.moveTo(a.x + nx, a.y + ny);
    path.lineTo(b.x + nx, b.y + ny);
    path.lineTo(b.x - nx, b.y - ny);
    path.lineTo(a.x - nx, a.y - ny);
    path.close();
  }

  // Filled circles at every vertex → rounded joins + end caps.
  for (const p of pts) {
    addCircle(path, p.x, p.y, radius);
  }
}

/** Build a single opentype.Glyph from a captured GlyphData. */
function buildGlyph(name: string, unicode: number, data: GlyphData | null): opentype.Glyph {
  if (!data || data.strokes.length === 0) {
    return new opentype.Glyph({
      name,
      unicode,
      advanceWidth: DEFAULT_ADVANCE,
      path: new opentype.Path(),
    });
  }

  // Canvas → font coordinate transform.
  // Map canvas y so that data.baselineY becomes font y=0.
  // Scale uniformly so the canvas's "full em" (baselineY to top of canvas above)
  // corresponds to ASCENDER. That keeps proportions consistent across glyphs.
  const ascenderRegionPx = data.baselineY;
  const scale = ASCENDER / ascenderRegionPx; // font units per canvas pixel

  const transform = (p: Point): Point => ({
    x: p.x * scale,
    y: (data.baselineY - p.y) * scale,
  });

  const path = new opentype.Path();
  const radius = (data.strokeWidth / 2) * scale;

  for (const stroke of data.strokes) {
    addStrokeToPath(path, stroke, radius, transform);
  }

  // Compute advance width from path bounding box (so wider letters take more space).
  // opentype.js Path has no direct bbox; compute manually from commands.
  let minX = Infinity;
  let maxX = -Infinity;
  for (const cmd of path.commands) {
    const xs: number[] = [];
    if ("x" in cmd && typeof cmd.x === "number") xs.push(cmd.x);
    if ("x1" in cmd && typeof cmd.x1 === "number") xs.push(cmd.x1);
    if ("x2" in cmd && typeof cmd.x2 === "number") xs.push(cmd.x2);
    for (const x of xs) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  if (!isFinite(minX) || !isFinite(maxX)) {
    minX = 0;
    maxX = DEFAULT_ADVANCE;
  }

  // Shift path so that the glyph's left edge sits at the side bearing.
  const shift = SIDE_BEARING - minX;
  if (shift !== 0) {
    for (const cmd of path.commands) {
      if ("x" in cmd && typeof cmd.x === "number") cmd.x += shift;
      if ("x1" in cmd && typeof cmd.x1 === "number") cmd.x1 += shift;
      if ("x2" in cmd && typeof cmd.x2 === "number") cmd.x2 += shift;
    }
  }

  const glyphWidth = maxX - minX;
  const advanceWidth = Math.max(
    DEFAULT_ADVANCE,
    Math.round(glyphWidth + SIDE_BEARING * 2)
  );

  return new opentype.Glyph({
    name,
    unicode,
    advanceWidth,
    path,
  });
}

/** Build the entire font, return an ArrayBuffer (.otf binary). */
export function buildFont(
  glyphMap: GlyphMap,
  options: { familyName?: string } = {}
): { font: opentype.Font; buffer: ArrayBuffer; blobUrl: string } {
  const glyphs: opentype.Glyph[] = [];

  // .notdef is required as glyph 0.
  glyphs.push(
    new opentype.Glyph({
      name: ".notdef",
      unicode: 0,
      advanceWidth: DEFAULT_ADVANCE,
      path: new opentype.Path(),
    })
  );

  // Add a space glyph at U+0020.
  glyphs.push(
    new opentype.Glyph({
      name: "space",
      unicode: 0x20,
      advanceWidth: 350,
      path: new opentype.Path(),
    })
  );

  // Add every captured glyph.
  const sortedChars = Object.keys(glyphMap).sort();
  for (const ch of sortedChars) {
    if (ch === " ") continue;
    const code = ch.codePointAt(0);
    if (!code) continue;
    glyphs.push(buildGlyph(`uni${code.toString(16).toUpperCase().padStart(4, "0")}`, code, glyphMap[ch]));
  }

  const familyName = options.familyName ?? "My Handwriting";
  const font = new opentype.Font({
    familyName,
    styleName: "Regular",
    unitsPerEm: UNITS_PER_EM,
    ascender: ASCENDER,
    descender: DESCENDER,
    glyphs,
  });

  // Add cap/x-height to OS/2 table for better rendering hints.
  // (opentype.js sets sensible defaults; these are just polish.)
  type FontWithTables = opentype.Font & { tables?: { os2?: Record<string, unknown> } };
  const f = font as FontWithTables;
  if (f.tables?.os2) {
    f.tables.os2.sCapHeight = CAP_HEIGHT;
    f.tables.os2.sxHeight = X_HEIGHT;
  }

  const buffer = font.toArrayBuffer();
  const blob = new Blob([buffer], { type: "font/otf" });
  const blobUrl = URL.createObjectURL(blob);
  return { font, buffer, blobUrl };
}

/** Trigger a browser download of the font. */
export function downloadFont(blobUrl: string, filename = "my-handwriting.otf") {
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
