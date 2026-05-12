"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { glyphs, TOTAL_GLYPHS, type Zone } from "./lib/glyphs";
import type { GlyphMap, Point, Stroke } from "./lib/types";
import { STORAGE_KEY } from "./lib/types";
import { buildFont, downloadFont } from "./lib/fontBuilder";

type Step = "onboarding" | "drawing" | "preview" | "checkout";

const ONBOARDING_CARDS = [
  {
    icon: "✍️",
    title: "Make your handwriting a real font",
    body: "Draw each letter once. Get back a font file that types in your own handwriting.",
  },
  {
    icon: "📱",
    title: "Use it everywhere",
    body: "Captions on your IG videos. Notes. Docs. Your résumé. Birthday cards. Anywhere you can pick a font.",
  },
  {
    icon: "👆",
    title: "Just use your finger",
    body: "Letter by letter. Skip what you want. You'll see a live preview in your own handwriting when you're done.",
  },
];

export default function HandwritingApp() {
  const [step, setStep] = useState<Step>("onboarding");
  const [onbIndex, setOnbIndex] = useState(0);
  const [glyphMap, setGlyphMap] = useState<GlyphMap>({});
  const [currentGlyphIdx, setCurrentGlyphIdx] = useState(0);

  // Load saved progress on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GlyphMap;
        setGlyphMap(parsed);
      }
    } catch {}
  }, []);

  const saveGlyph = useCallback(
    (
      ch: string,
      strokes: Stroke[],
      canvas: { width: number; height: number },
      baselineY: number,
      strokeWidth: number
    ) => {
      setGlyphMap((prev) => {
        const next = {
          ...prev,
          [ch]: { strokes, canvas, baselineY, strokeWidth },
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const completedCount = Object.values(glyphMap).filter(
    (g) => g.strokes.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#2C2C2C]" style={{
      paddingTop: "max(env(safe-area-inset-top), 8px)",
      paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
    }}>
      <header className="px-5 pt-4 pb-2 flex items-center justify-between text-xs">
        <a href="/" className="opacity-50 hover:opacity-100 font-mono">← flickman.co</a>
        {step === "drawing" && (
          <span className="opacity-50 font-mono">{completedCount} / {TOTAL_GLYPHS}</span>
        )}
      </header>

      {step === "onboarding" && (
        <Onboarding
          index={onbIndex}
          onBack={() => setOnbIndex((i) => Math.max(0, i - 1))}
          onNext={() => {
            if (onbIndex < ONBOARDING_CARDS.length - 1) setOnbIndex(onbIndex + 1);
            else setStep("drawing");
          }}
        />
      )}

      {step === "drawing" && (
        <DrawingFlow
          index={currentGlyphIdx}
          setIndex={setCurrentGlyphIdx}
          glyphMap={glyphMap}
          onSave={saveGlyph}
          onDone={() => setStep("preview")}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          glyphMap={glyphMap}
          onBack={() => setStep("drawing")}
          onCheckout={() => setStep("checkout")}
        />
      )}

      {step === "checkout" && (
        <CheckoutStep
          onBack={() => setStep("preview")}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Onboarding                                                          */
/* ────────────────────────────────────────────────────────────────── */

function Onboarding({
  index,
  onBack,
  onNext,
}: {
  index: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const card = ONBOARDING_CARDS[index];
  const isLast = index === ONBOARDING_CARDS.length - 1;
  return (
    <main className="px-6 pt-10 pb-6 max-w-md mx-auto flex flex-col min-h-[80vh]">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-7xl mb-6">{card.icon}</div>
        <h1 className="text-2xl font-bold mb-3">{card.title}</h1>
        <p className="text-base opacity-70 leading-relaxed max-w-xs">{card.body}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {ONBOARDING_CARDS.map((_, i) => (
          <span
            key={i}
            className="block rounded-full transition-all"
            style={{
              width: i === index ? 24 : 8,
              height: 8,
              background: i === index ? "#5D9C30" : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {index > 0 && (
          <button
            onClick={onBack}
            className="flex-1 h-14 rounded-xl border-2 border-black/10 text-base font-semibold bg-white"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-[2] h-14 rounded-xl text-base font-bold text-white"
          style={{
            background: "#5D9C30",
            boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
          }}
        >
          {isLast ? "Start drawing →" : "Next →"}
        </button>
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Drawing flow                                                        */
/* ────────────────────────────────────────────────────────────────── */

function DrawingFlow({
  index,
  setIndex,
  glyphMap,
  onSave,
  onDone,
}: {
  index: number;
  setIndex: (i: number | ((p: number) => number)) => void;
  glyphMap: GlyphMap;
  onSave: (
    ch: string,
    strokes: Stroke[],
    canvas: { width: number; height: number },
    baselineY: number,
    strokeWidth: number
  ) => void;
  onDone: () => void;
}) {
  const spec = glyphs[index];
  const [strokes, setStrokes] = useState<Stroke[]>(
    () => glyphMap[spec.char]?.strokes ?? []
  );

  // Reset strokes when moving to a new glyph.
  useEffect(() => {
    setStrokes(glyphMap[spec.char]?.strokes ?? []);
  }, [index, spec.char, glyphMap]);

  const next = () => {
    if (index < TOTAL_GLYPHS - 1) setIndex((i) => i + 1);
    else onDone();
  };

  const handleSaveAndNext = (
    finalStrokes: Stroke[],
    canvas: { width: number; height: number },
    baselineY: number,
    strokeWidth: number
  ) => {
    if (finalStrokes.length > 0) {
      onSave(spec.char, finalStrokes, canvas, baselineY, strokeWidth);
    }
    next();
  };

  const completedThis = (glyphMap[spec.char]?.strokes.length ?? 0) > 0;

  return (
    <main className="px-4 pb-4 max-w-md mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-sm opacity-60 font-mono">
          Draw <span className="opacity-100 text-base font-bold">{spec.label ?? `“${spec.char}”`}</span>
        </div>
        <div className="flex gap-1.5">
          {/* mini progress */}
          <div className="h-2 w-32 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full bg-[#5D9C30] transition-all"
              style={{ width: `${((index + 1) / TOTAL_GLYPHS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <DrawingCanvas
        glyphChar={spec.char}
        zone={spec.zone}
        initialStrokes={strokes}
        onStrokesChange={setStrokes}
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="h-14 px-4 rounded-xl border-2 border-black/10 bg-white font-semibold disabled:opacity-30"
        >
          ←
        </button>
        <button
          onClick={() => setStrokes([])}
          className="h-14 px-4 rounded-xl border-2 border-black/10 bg-white font-semibold text-sm"
        >
          Clear
        </button>
        <button
          onClick={next}
          className="h-14 flex-1 rounded-xl border-2 border-black/10 bg-white font-semibold text-sm opacity-70"
        >
          Skip →
        </button>
        <SaveButton
          strokes={strokes}
          completedThis={completedThis}
          onSave={handleSaveAndNext}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1 justify-center opacity-60">
        {glyphs.slice(Math.max(0, index - 4), index + 10).map((g, i) => {
          const realIdx = Math.max(0, index - 4) + i;
          const done = (glyphMap[g.char]?.strokes.length ?? 0) > 0;
          const isCurrent = realIdx === index;
          return (
            <button
              key={`${g.char}-${realIdx}`}
              onClick={() => setIndex(realIdx)}
              className="w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center transition-colors"
              style={{
                background: isCurrent ? "#5D9C30" : done ? "rgba(93,156,48,0.18)" : "rgba(0,0,0,0.04)",
                color: isCurrent ? "white" : "inherit",
              }}
            >
              {g.char}
            </button>
          );
        })}
      </div>

      {completedCountFor(glyphMap) >= 10 && (
        <button
          onClick={onDone}
          className="mt-4 mx-auto text-sm underline opacity-60 hover:opacity-100"
        >
          Skip the rest & preview my font →
        </button>
      )}
    </main>
  );
}

function completedCountFor(glyphMap: GlyphMap): number {
  return Object.values(glyphMap).filter((g) => g.strokes.length > 0).length;
}

/* Tiny wrapper so the Save button gets fresh canvas size when clicked. */
function SaveButton({
  strokes,
  completedThis,
  onSave,
}: {
  strokes: Stroke[];
  completedThis: boolean;
  onSave: (
    s: Stroke[],
    canvas: { width: number; height: number },
    baselineY: number,
    strokeWidth: number
  ) => void;
}) {
  const handleClick = () => {
    // We rely on the canvas component having broadcast its current size via
    // a global cached read. Simpler: defer to DrawingCanvas by reading from
    // the canvas element directly.
    const c = document.getElementById("hw-canvas") as HTMLCanvasElement | null;
    if (!c) return;
    const baselineY = parseFloat(c.dataset.baseliney ?? "0");
    const strokeWidth = parseFloat(c.dataset.strokewidth ?? "10");
    onSave(strokes, { width: c.width, height: c.height }, baselineY, strokeWidth);
  };
  const hasContent = strokes.length > 0;
  return (
    <button
      onClick={handleClick}
      className="h-14 px-5 rounded-xl font-bold text-white text-sm"
      style={{
        background: hasContent ? "#5D9C30" : "#9BB58A",
        boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
        minWidth: 80,
      }}
    >
      {hasContent ? "Save →" : completedThis ? "Next →" : "Skip →"}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Drawing canvas                                                      */
/* ────────────────────────────────────────────────────────────────── */

function DrawingCanvas({
  glyphChar,
  zone,
  initialStrokes,
  onStrokesChange,
}: {
  glyphChar: string;
  zone: Zone;
  initialStrokes: Stroke[];
  onStrokesChange: (s: Stroke[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas sizing — square, fits container width.
  const [size, setSize] = useState<number>(360);
  const baselineY = useMemo(() => Math.round(size * 0.8), [size]);
  const capY = useMemo(() => Math.round(size * 0.2), [size]);
  const xY = useMemo(() => Math.round(size * 0.44), [size]);
  const descY = useMemo(() => Math.round(size * 0.92), [size]);
  const STROKE_WIDTH = useMemo(() => Math.max(8, Math.round(size * 0.025)), [size]);

  // Track current local strokes — re-rendered to canvas on every change.
  const strokesRef = useRef<Stroke[]>(initialStrokes);
  // Keep ref in sync if React state above resets us.
  useEffect(() => {
    strokesRef.current = initialStrokes;
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStrokes, size, glyphChar]);

  // Measure container to set canvas size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const next = Math.max(280, Math.min(480, Math.floor(w)));
      setSize(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // Background + guides.
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, c.width, c.height);

    const drawGuide = (y: number, label: string, color: string, dashed = true) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash(dashed ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(c.width - 8, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = "9px ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.fillText(label, c.width - 12, y - 4);
    };

    // Highlight the active zone with a soft band.
    let top = capY, bottom = baselineY;
    if (zone === "x") { top = xY; bottom = baselineY; }
    else if (zone === "ascender") { top = capY; bottom = baselineY; }
    else if (zone === "descender") { top = xY; bottom = descY; }
    else if (zone === "punct") { top = baselineY - (baselineY - xY) * 0.3; bottom = baselineY; }
    ctx.fillStyle = "rgba(93,156,48,0.07)";
    ctx.fillRect(0, top, c.width, bottom - top);

    drawGuide(capY, "cap", "rgba(0,0,0,0.18)");
    drawGuide(xY, "x", "rgba(0,0,0,0.18)");
    drawGuide(baselineY, "baseline", "rgba(0,0,0,0.5)", false);
    drawGuide(descY, "desc", "rgba(0,0,0,0.18)");

    // Strokes.
    ctx.strokeStyle = "#2C2C2C";
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      if (stroke.length === 1) {
        // Dot
        ctx.arc(stroke[0].x, stroke[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
  }, [STROKE_WIDTH, baselineY, capY, descY, xY, zone]);

  useEffect(() => {
    redraw();
  }, [redraw, size]);

  // Pointer handling.
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke>([]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (c.width / rect.width);
    const y = (e.clientY - rect.top) * (c.height / rect.height);
    return { x, y };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    currentStrokeRef.current = [getPoint(e)];
    strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
    onStrokesChange([...strokesRef.current]);
    redraw();
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    currentStrokeRef.current.push(getPoint(e));
    redraw();
  };
  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch {}
    onStrokesChange([...strokesRef.current]);
    redraw();
  };

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        id="hw-canvas"
        ref={canvasRef}
        width={size}
        height={size}
        data-baseliney={baselineY}
        data-strokewidth={STROKE_WIDTH}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          width: "100%",
          height: "auto",
          touchAction: "none",
          borderRadius: 14,
          border: "2px solid rgba(0,0,0,0.08)",
          background: "white",
          boxShadow:
            "inset 2px 2px 6px rgba(255,255,255,0.5), inset -2px -2px 6px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.08)",
        }}
      />
      <div className="text-center text-[11px] opacity-50 mt-2">
        Draw {zone === "descender" ? "from x-line down past baseline" :
              zone === "ascender" ? "from cap-line down to baseline" :
              zone === "x" ? "between x-line and baseline" :
              zone === "punct" ? "small, near baseline" :
              "from cap-line down to baseline"}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Preview                                                             */
/* ────────────────────────────────────────────────────────────────── */

function PreviewStep({
  glyphMap,
  onBack,
  onCheckout,
}: {
  glyphMap: GlyphMap;
  onBack: () => void;
  onCheckout: () => void;
}) {
  const [text, setText] = useState("Hello, world! This is my own handwriting.");
  const [fontReady, setFontReady] = useState(false);
  const fontFamily = "MyHandwritingPreview";

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    (async () => {
      try {
        const { blobUrl } = buildFont(glyphMap, { familyName: fontFamily });
        url = blobUrl;
        const ff = new FontFace(fontFamily, `url(${blobUrl})`);
        await ff.load();
        if (cancelled) return;
        (document.fonts as FontFaceSet).add(ff);
        setFontReady(true);
      } catch (err) {
        console.error("Failed to build preview font:", err);
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [glyphMap]);

  const handleDownloadPreview = () => {
    const { blobUrl } = buildFont(glyphMap, { familyName: "My Handwriting (Preview)" });
    downloadFont(blobUrl, "my-handwriting-preview.otf");
  };

  return (
    <main className="px-6 pt-6 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Try it out</h1>
      <p className="opacity-60 mb-6">Type below to see your handwriting in action.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full p-3 rounded-xl border-2 border-black/10 bg-white text-sm mb-4 resize-none"
        style={{ fontSize: 16 }}
      />

      <div
        className="p-5 rounded-xl bg-white border-2 border-black/10 mb-6 min-h-[140px]"
        style={{
          boxShadow:
            "inset 2px 2px 6px rgba(255,255,255,0.5), inset -2px -2px 6px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontFamily: fontReady ? `"${fontFamily}", sans-serif` : "system-ui",
            fontSize: 28,
            lineHeight: 1.3,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            opacity: fontReady ? 1 : 0.3,
          }}
        >
          {text || "—"}
        </div>
        {!fontReady && (
          <div className="text-xs opacity-50 mt-2">Generating your font…</div>
        )}
      </div>

      <button
        onClick={onCheckout}
        className="w-full h-14 rounded-xl font-bold text-white text-base mb-3"
        style={{
          background: "#5D9C30",
          boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
        }}
      >
        Download my font — $15
      </button>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-12 rounded-xl border-2 border-black/10 bg-white text-sm font-semibold"
        >
          ← Keep drawing
        </button>
        <button
          onClick={handleDownloadPreview}
          className="flex-1 h-12 rounded-xl border-2 border-black/10 bg-white text-sm font-semibold opacity-60"
          title="Free, lower-quality preview"
        >
          Download preview
        </button>
      </div>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Checkout                                                            */
/* ────────────────────────────────────────────────────────────────── */

function CheckoutStep({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/handwriting/checkout", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${res.status})`);
      }
      const { url } = await res.json();
      if (!url) throw new Error("Stripe didn't return a checkout URL.");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <main className="px-6 pt-10 pb-10 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💸</div>
        <h1 className="text-2xl font-bold mb-2">$15 to download</h1>
        <p className="opacity-60">One-time. Yours forever. Use it anywhere.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-14 rounded-xl font-bold text-white text-base mb-3 disabled:opacity-60"
        style={{
          background: "#5D9C30",
          boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
        }}
      >
        {loading ? "Opening checkout…" : "Pay $15 →"}
      </button>

      <button
        onClick={onBack}
        className="w-full h-12 rounded-xl border-2 border-black/10 bg-white text-sm font-semibold"
      >
        ← Back to preview
      </button>

      <p className="text-[11px] text-center opacity-40 mt-6 leading-relaxed">
        Secure payment via Stripe. Your handwriting data never leaves your device —
        we generate the font right in your browser.
      </p>
    </main>
  );
}
