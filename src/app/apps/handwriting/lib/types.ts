export type Point = { x: number; y: number };
export type Stroke = Point[];

/** A single user-drawn glyph: all strokes captured on the drawing canvas. */
export interface GlyphData {
  strokes: Stroke[];
  /** The canvas dimensions used when these strokes were captured. */
  canvas: { width: number; height: number };
  /** Y-coordinate of the baseline in canvas pixels. */
  baselineY: number;
  /** Stroke width used when drawing (canvas pixels). */
  strokeWidth: number;
}

/** Whole-font storage object keyed by character. */
export type GlyphMap = Record<string, GlyphData>;

export const STORAGE_KEY = "fm-handwriting:v1";
