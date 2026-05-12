"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  glyphs,
  TOTAL_GLYPHS,
  PHASES,
  phaseForChar,
  indexWithinPhase,
  type Zone,
} from "./lib/glyphs";
import type { GlyphMap, Point, Stroke } from "./lib/types";
import { STORAGE_KEY, getStorage } from "./lib/types";
import { buildFont, downloadFont } from "./lib/fontBuilder";
import { tokens, type } from "./lib/design";

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
    body: "We'll go in order: capitals → lowercase → numbers → punctuation. Skip what you want. You'll see a live preview when you're done.",
  },
];

export default function HandwritingApp() {
  const [step, setStep] = useState<Step>("onboarding");
  const [onbIndex, setOnbIndex] = useState(0);
  const [glyphMap, setGlyphMap] = useState<GlyphMap>({});
  const [currentGlyphIdx, setCurrentGlyphIdx] = useState(0);

  // Load saved progress on mount (sessionStorage — survives refresh, not tab close).
  useEffect(() => {
    try {
      const raw = getStorage().getItem(STORAGE_KEY);
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
          getStorage().setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const startOver = useCallback(() => {
    try {
      getStorage().removeItem(STORAGE_KEY);
      if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setGlyphMap({});
    setCurrentGlyphIdx(0);
    setOnbIndex(0);
    setStep("onboarding");
  }, []);

  const completedCount = Object.values(glyphMap).filter(
    (g) => g.strokes.length > 0
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.color.canvas,
        color: tokens.color.ink,
        fontFamily: tokens.fontFamily,
        paddingTop: "max(env(safe-area-inset-top), 8px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      <header
        style={{
          padding: "12px 20px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            ...type.captionSm,
            color: tokens.color.muted,
            textDecoration: "none",
          }}
        >
          ← flickman.co
        </a>
        {step === "drawing" && (
          <span style={{ ...type.captionSm, color: tokens.color.muted }}>
            {completedCount} / {TOTAL_GLYPHS}
          </span>
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
          onStartOver={startOver}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          glyphMap={glyphMap}
          onBack={() => setStep("drawing")}
          onCheckout={() => setStep("checkout")}
          onStartOver={startOver}
        />
      )}

      {step === "checkout" && <CheckoutStep onBack={() => setStep("preview")} />}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/* Shared primitives                                                   */
/* ────────────────────────────────────────────────────────────────── */

function PrimaryButton({
  children,
  onClick,
  disabled,
  type: btnType = "button",
  width = "full",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  width?: "full" | "auto";
}) {
  return (
    <button
      type={btnType}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...type.buttonMd,
        background: disabled ? tokens.color.primaryDisabled : tokens.color.primary,
        color: tokens.color.onPrimary,
        height: 48,
        padding: "0 24px",
        borderRadius: tokens.radius.sm,
        border: "none",
        width: width === "full" ? "100%" : "auto",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 120ms ease",
        fontFamily: tokens.fontFamily,
      }}
      onPointerDown={(e) => {
        if (!disabled) (e.currentTarget.style.background = tokens.color.primaryActive);
      }}
      onPointerUp={(e) => {
        if (!disabled) (e.currentTarget.style.background = tokens.color.primary);
      }}
      onPointerLeave={(e) => {
        if (!disabled) (e.currentTarget.style.background = tokens.color.primary);
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  width = "full",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  width?: "full" | "auto";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...type.buttonMd,
        background: tokens.color.canvas,
        color: tokens.color.ink,
        height: 48,
        padding: "0 24px",
        borderRadius: tokens.radius.sm,
        border: `1px solid ${tokens.color.ink}`,
        width: width === "full" ? "100%" : "auto",
        cursor: "pointer",
        fontFamily: tokens.fontFamily,
      }}
    >
      {children}
    </button>
  );
}

function TertiaryLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...type.bodySm,
        background: "transparent",
        color: tokens.color.ink,
        border: "none",
        padding: 0,
        textDecoration: "underline",
        cursor: "pointer",
        fontFamily: tokens.fontFamily,
      }}
    >
      {children}
    </button>
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
    <main
      style={{
        padding: "40px 24px 24px",
        maxWidth: 420,
        margin: "0 auto",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 24 }}>{card.icon}</div>
        <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 12px" }}>
          {card.title}
        </h1>
        <p
          style={{
            ...type.bodyMd,
            color: tokens.color.body,
            margin: 0,
            maxWidth: 320,
          }}
        >
          {card.body}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {ONBOARDING_CARDS.map((_, i) => (
          <span
            key={i}
            style={{
              display: "block",
              borderRadius: tokens.radius.full,
              transition: "all 200ms ease",
              width: i === index ? 24 : 8,
              height: 8,
              background: i === index ? tokens.color.ink : tokens.color.hairline,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {index > 0 && (
          <div style={{ flex: 1 }}>
            <SecondaryButton onClick={onBack}>← Back</SecondaryButton>
          </div>
        )}
        <div style={{ flex: 2 }}>
          <PrimaryButton onClick={onNext}>
            {isLast ? "Start drawing →" : "Next →"}
          </PrimaryButton>
        </div>
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
  onStartOver,
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
  onStartOver: () => void;
}) {
  const spec = glyphs[index];
  const [strokes, setStrokes] = useState<Stroke[]>(
    () => glyphMap[spec.char]?.strokes ?? []
  );

  const [showPhaseIntro, setShowPhaseIntro] = useState(false);
  const prevPhaseRef = useRef(phaseForChar(spec.char));
  useEffect(() => {
    const current = phaseForChar(spec.char);
    if (current !== prevPhaseRef.current && index !== 0) {
      setShowPhaseIntro(true);
    }
    prevPhaseRef.current = current;
  }, [index, spec.char]);

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

  const phaseInfo = indexWithinPhase(index);
  const phaseMeta = PHASES.find((p) => p.key === phaseInfo.phase)!;

  if (showPhaseIntro) {
    return (
      <PhaseIntro
        label={phaseInfo.label}
        emoji={phaseMeta.emoji}
        total={phaseInfo.total}
        onContinue={() => setShowPhaseIntro(false)}
      />
    );
  }

  const completedThis = (glyphMap[spec.char]?.strokes.length ?? 0) > 0;

  return (
    <main
      style={{
        padding: "0 16px 16px",
        maxWidth: 420,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Phase pill */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: tokens.radius.full,
            background: tokens.color.surfaceSoft,
            color: tokens.color.ink,
            ...type.uppercaseTag,
          }}
        >
          <span style={{ textTransform: "none", fontSize: 13 }}>{phaseMeta.emoji}</span>
          <span>{phaseInfo.label}</span>
          <span style={{ color: tokens.color.muted, textTransform: "none", fontWeight: 400 }}>
            · {phaseInfo.i} of {phaseInfo.total}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "0 4px",
        }}
      >
        <div style={{ ...type.bodySm, color: tokens.color.muted }}>
          Draw{" "}
          <span style={{ color: tokens.color.ink, ...type.titleMd }}>
            {spec.label ?? `“${spec.char}”`}
          </span>
        </div>
        <div
          style={{
            height: 4,
            width: 96,
            borderRadius: tokens.radius.full,
            background: tokens.color.hairlineSoft,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: tokens.color.ink,
              transition: "width 300ms ease",
              width: `${((index + 1) / TOTAL_GLYPHS) * 100}%`,
            }}
          />
        </div>
      </div>

      <DrawingCanvas
        glyphChar={spec.char}
        zone={spec.zone}
        initialStrokes={strokes}
        onStrokesChange={setStrokes}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{
            height: 48,
            padding: "0 16px",
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.color.hairline}`,
            background: tokens.color.canvas,
            color: tokens.color.ink,
            fontFamily: tokens.fontFamily,
            ...type.buttonMd,
            opacity: index === 0 ? 0.3 : 1,
            cursor: index === 0 ? "not-allowed" : "pointer",
          }}
        >
          ←
        </button>
        <button
          onClick={() => setStrokes([])}
          style={{
            height: 48,
            padding: "0 16px",
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.color.hairline}`,
            background: tokens.color.canvas,
            color: tokens.color.ink,
            fontFamily: tokens.fontFamily,
            ...type.buttonMd,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
        <button
          onClick={next}
          style={{
            height: 48,
            flex: 1,
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.color.hairline}`,
            background: tokens.color.canvas,
            color: tokens.color.muted,
            fontFamily: tokens.fontFamily,
            ...type.buttonMd,
            cursor: "pointer",
          }}
        >
          Skip →
        </button>
        <SaveButton
          strokes={strokes}
          completedThis={completedThis}
          onSave={handleSaveAndNext}
        />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
        }}
      >
        {glyphs.slice(Math.max(0, index - 4), index + 10).map((g, i) => {
          const realIdx = Math.max(0, index - 4) + i;
          const done = (glyphMap[g.char]?.strokes.length ?? 0) > 0;
          const isCurrent = realIdx === index;
          return (
            <button
              key={`${g.char}-${realIdx}`}
              onClick={() => setIndex(realIdx)}
              style={{
                width: 28,
                height: 28,
                borderRadius: tokens.radius.full,
                border: "none",
                background: isCurrent
                  ? tokens.color.ink
                  : done
                  ? tokens.color.surfaceStrong
                  : "transparent",
                color: isCurrent ? tokens.color.onPrimary : tokens.color.ink,
                ...type.bodySm,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: tokens.fontFamily,
              }}
            >
              {g.char}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {completedCountFor(glyphMap) >= 10 && (
          <TertiaryLink onClick={onDone}>Skip the rest & preview →</TertiaryLink>
        )}
        <button
          onClick={() => {
            if (confirm("Erase everything you've drawn and start over?")) onStartOver();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: tokens.color.muted,
            textDecoration: "underline",
            cursor: "pointer",
            fontFamily: tokens.fontFamily,
            ...type.captionSm,
          }}
        >
          Start over
        </button>
      </div>
    </main>
  );
}

function completedCountFor(glyphMap: GlyphMap): number {
  return Object.values(glyphMap).filter((g) => g.strokes.length > 0).length;
}

function PhaseIntro({
  label,
  emoji,
  total,
  onContinue,
}: {
  label: string;
  emoji: string;
  total: number;
  onContinue: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onContinue, 1400);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <main
      style={{
        padding: "0 24px",
        maxWidth: 420,
        margin: "0 auto",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 16 }}>{emoji}</div>
      <div
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: tokens.radius.full,
          background: tokens.color.surfaceSoft,
          color: tokens.color.muted,
          marginBottom: 12,
          ...type.uppercaseTag,
        }}
      >
        Next up
      </div>
      <h2 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
        {label}
      </h2>
      <p style={{ ...type.bodyMd, color: tokens.color.muted, margin: "0 0 32px" }}>
        {total} {total === 1 ? "character" : "characters"} to go
      </p>
      <div>
        <SecondaryButton onClick={onContinue} width="auto">
          Let&rsquo;s go →
        </SecondaryButton>
      </div>
    </main>
  );
}

/* Save button — reads canvas dims via DOM ref. */
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
      style={{
        height: 48,
        minWidth: 96,
        padding: "0 20px",
        borderRadius: tokens.radius.sm,
        background: hasContent ? tokens.color.primary : tokens.color.primaryDisabled,
        color: tokens.color.onPrimary,
        border: "none",
        fontFamily: tokens.fontFamily,
        ...type.buttonMd,
        cursor: "pointer",
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

  const [size, setSize] = useState<number>(360);
  const baselineY = useMemo(() => Math.round(size * 0.8), [size]);
  const capY = useMemo(() => Math.round(size * 0.2), [size]);
  const xY = useMemo(() => Math.round(size * 0.44), [size]);
  const descY = useMemo(() => Math.round(size * 0.92), [size]);
  const STROKE_WIDTH = useMemo(() => Math.max(8, Math.round(size * 0.025)), [size]);

  const strokesRef = useRef<Stroke[]>(initialStrokes);
  useEffect(() => {
    strokesRef.current = initialStrokes;
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStrokes, size, glyphChar]);

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

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = tokens.color.canvas;
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
      ctx.font = `11px ${tokens.fontFamily}`;
      ctx.textAlign = "right";
      ctx.fillText(label, c.width - 12, y - 4);
    };

    // Active zone: soft surface-soft band (Airbnb leans on neutrals, not the brand color).
    let top = capY,
      bottom = baselineY;
    if (zone === "x") {
      top = xY;
      bottom = baselineY;
    } else if (zone === "ascender") {
      top = capY;
      bottom = baselineY;
    } else if (zone === "descender") {
      top = xY;
      bottom = descY;
    } else if (zone === "punct") {
      top = baselineY - (baselineY - xY) * 0.3;
      bottom = baselineY;
    }
    ctx.fillStyle = tokens.color.surfaceSoft;
    ctx.fillRect(0, top, c.width, bottom - top);

    drawGuide(capY, "cap", tokens.color.hairline);
    drawGuide(xY, "x", tokens.color.hairline);
    drawGuide(baselineY, "baseline", tokens.color.muted, false);
    drawGuide(descY, "desc", tokens.color.hairline);

    ctx.strokeStyle = tokens.color.ink;
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
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
    onStrokesChange([...strokesRef.current]);
    redraw();
  };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
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
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.color.hairline}`,
          background: tokens.color.canvas,
          boxShadow: tokens.shadowSoft,
        }}
      />
      <div
        style={{
          textAlign: "center",
          marginTop: 8,
          color: tokens.color.muted,
          ...type.captionSm,
        }}
      >
        {zone === "descender"
          ? "Draw from x-line down past baseline"
          : zone === "ascender"
          ? "Draw from cap-line down to baseline"
          : zone === "x"
          ? "Draw between x-line and baseline"
          : zone === "punct"
          ? "Small, near baseline"
          : "Draw from cap-line down to baseline"}
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
  onStartOver,
}: {
  glyphMap: GlyphMap;
  onBack: () => void;
  onCheckout: () => void;
  onStartOver: () => void;
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
    <main
      style={{
        padding: "24px 24px 40px",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
        Try it out
      </h1>
      <p style={{ ...type.bodyMd, color: tokens.color.muted, margin: "0 0 24px" }}>
        Type below to see your handwriting in action.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: "14px 12px",
          borderRadius: tokens.radius.sm,
          border: `1px solid ${tokens.color.hairline}`,
          background: tokens.color.canvas,
          color: tokens.color.ink,
          ...type.bodyMd,
          fontSize: 16,
          marginBottom: 16,
          resize: "none",
          fontFamily: tokens.fontFamily,
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = tokens.color.ink;
          e.currentTarget.style.borderWidth = "2px";
          e.currentTarget.style.padding = "13px 11px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = tokens.color.hairline;
          e.currentTarget.style.borderWidth = "1px";
          e.currentTarget.style.padding = "14px 12px";
        }}
      />

      <div
        style={{
          padding: 20,
          borderRadius: tokens.radius.md,
          background: tokens.color.canvas,
          border: `1px solid ${tokens.color.hairline}`,
          boxShadow: tokens.shadowSoft,
          marginBottom: 24,
          minHeight: 140,
        }}
      >
        <div
          style={{
            fontFamily: fontReady ? `"${fontFamily}", sans-serif` : tokens.fontFamily,
            fontSize: 28,
            lineHeight: 1.3,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: tokens.color.ink,
            opacity: fontReady ? 1 : 0.3,
          }}
        >
          {text || "—"}
        </div>
        {!fontReady && (
          <div
            style={{
              ...type.captionSm,
              color: tokens.color.muted,
              marginTop: 8,
            }}
          >
            Generating your font…
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <PrimaryButton onClick={onCheckout}>Download my font — $15</PrimaryButton>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={onBack}>← Keep drawing</SecondaryButton>
        </div>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={handleDownloadPreview}>
            Download preview
          </SecondaryButton>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={() => {
            if (confirm("Erase everything you've drawn and start over?")) onStartOver();
          }}
          style={{
            background: "transparent",
            border: "none",
            color: tokens.color.muted,
            textDecoration: "underline",
            cursor: "pointer",
            fontFamily: tokens.fontFamily,
            ...type.captionSm,
          }}
        >
          Start over
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
    <main
      style={{
        padding: "40px 24px",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💸</div>
        <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
          $15 to download
        </h1>
        <p style={{ ...type.bodyMd, color: tokens.color.muted, margin: 0 }}>
          One-time. Yours forever. Use it anywhere.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: tokens.radius.sm,
            background: "#fff5f5",
            border: `1px solid ${tokens.color.primary}33`,
            color: tokens.color.errorText,
            ...type.bodySm,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <PrimaryButton onClick={handlePay} disabled={loading}>
          {loading ? "Opening checkout…" : "Pay $15 →"}
        </PrimaryButton>
      </div>

      <SecondaryButton onClick={onBack}>← Back to preview</SecondaryButton>

      <p
        style={{
          ...type.captionSm,
          color: tokens.color.mutedSoft,
          textAlign: "center",
          margin: "24px 0 0",
          lineHeight: 1.5,
        }}
      >
        Secure payment via Stripe. Your handwriting data never leaves your device —
        we generate the font right in your browser.
      </p>
    </main>
  );
}
