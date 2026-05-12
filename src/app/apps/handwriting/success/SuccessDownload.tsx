"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEY, getStorage, type GlyphMap } from "../lib/types";
import { buildFont, downloadFont } from "../lib/fontBuilder";
import { tokens, type } from "../lib/design";

export default function SuccessDownload() {
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = getStorage().getItem(STORAGE_KEY);
      if (!raw) {
        setStatus("missing");
        return;
      }
      const map = JSON.parse(raw) as GlyphMap;
      const drawn = Object.values(map).filter((g) => g.strokes.length > 0).length;
      if (drawn === 0) {
        setStatus("missing");
        return;
      }
      const { blobUrl } = buildFont(map, { familyName: "My Handwriting" });
      setBlobUrl(blobUrl);
      setStatus("ready");

      const t = setTimeout(() => downloadFont(blobUrl, "my-handwriting.otf"), 600);
      return () => clearTimeout(t);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: tokens.color.canvas,
        color: tokens.color.ink,
        fontFamily: tokens.fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {status === "ready" ? "🎉" : status === "missing" ? "🤔" : "✍️"}
        </div>
        {status === "loading" && (
          <>
            <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
              Building your font…
            </h1>
            <p style={{ ...type.bodyMd, color: tokens.color.muted, margin: 0 }}>One sec.</p>
          </>
        )}
        {status === "ready" && blobUrl && (
          <>
            <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
              It&rsquo;s yours.
            </h1>
            <p
              style={{
                ...type.bodyMd,
                color: tokens.color.muted,
                margin: "0 0 24px",
              }}
            >
              Download starting automatically. Install on your phone, Mac, or PC and use it
              anywhere.
            </p>
            <button
              onClick={() => downloadFont(blobUrl, "my-handwriting.otf")}
              style={{
                ...type.buttonMd,
                background: tokens.color.primary,
                color: tokens.color.onPrimary,
                width: "100%",
                height: 48,
                padding: "0 24px",
                borderRadius: tokens.radius.sm,
                border: "none",
                marginBottom: 12,
                cursor: "pointer",
                fontFamily: tokens.fontFamily,
              }}
            >
              Download again
            </button>
            <a
              href="/apps"
              style={{
                ...type.captionSm,
                color: tokens.color.muted,
                textDecoration: "underline",
              }}
            >
              ← back to flickman.co/apps
            </a>
          </>
        )}
        {status === "missing" && (
          <>
            <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
              We can&rsquo;t find your drawings
            </h1>
            <p
              style={{
                ...type.bodyMd,
                color: tokens.color.muted,
                margin: "0 0 24px",
              }}
            >
              Your font is saved on the device you drew it on. Open this page in the same
              browser you used to draw your letters, and try again.
            </p>
            <a
              href="/apps/handwriting"
              style={{
                display: "inline-block",
                ...type.buttonMd,
                color: tokens.color.ink,
                background: tokens.color.canvas,
                border: `1px solid ${tokens.color.ink}`,
                padding: "0 24px",
                lineHeight: "48px",
                height: 48,
                borderRadius: tokens.radius.sm,
                textDecoration: "none",
              }}
            >
              Start over
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h1 style={{ ...type.displayXl, color: tokens.color.ink, margin: "0 0 8px" }}>
              Something went wrong.
            </h1>
            <p style={{ ...type.bodyMd, color: tokens.color.muted, margin: 0 }}>
              Try refreshing this page.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
