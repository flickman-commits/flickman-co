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

/**
 * Per-tab storage so different visitors on the same device get a clean slate.
 * A refresh inside the same tab keeps progress; closing the tab clears it.
 * The Stripe Checkout redirect stays in the same tab, so post-payment
 * download still has access to the user's strokes.
 */
function memoryFallback(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear() { m.clear(); },
    getItem(k) { return m.get(k) ?? null; },
    setItem(k, v) { m.set(k, String(v)); },
    removeItem(k) { m.delete(k); },
    key(i) { return Array.from(m.keys())[i] ?? null; },
  };
}

export function getStorage(): Storage {
  if (typeof window === "undefined") return memoryFallback();
  try {
    // Touch sessionStorage to make sure it's accessible (Safari private mode
    // can throw on access).
    window.sessionStorage.setItem("__fm_probe", "1");
    window.sessionStorage.removeItem("__fm_probe");
    return window.sessionStorage;
  } catch {
    return memoryFallback();
  }
}
