"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEY, getStorage, type GlyphMap } from "../lib/types";
import { buildFont, downloadFont } from "../lib/fontBuilder";

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

      // Auto-trigger download once.
      const t = setTimeout(() => downloadFont(blobUrl, "my-handwriting.otf"), 600);
      return () => clearTimeout(t);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#2C2C2C] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">{status === "ready" ? "🎉" : status === "missing" ? "🤔" : "✍️"}</div>
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Building your font…</h1>
            <p className="opacity-60">One sec.</p>
          </>
        )}
        {status === "ready" && blobUrl && (
          <>
            <h1 className="text-2xl font-bold mb-2">It&rsquo;s yours.</h1>
            <p className="opacity-60 mb-6">
              Download starting automatically. Install on your phone, Mac, or PC and use it anywhere.
            </p>
            <button
              onClick={() => downloadFont(blobUrl, "my-handwriting.otf")}
              className="w-full h-14 rounded-xl font-bold text-white text-base mb-3"
              style={{
                background: "#5D9C30",
                boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.15)",
              }}
            >
              Download again
            </button>
            <a href="/apps" className="text-sm opacity-60 hover:opacity-100 underline">
              ← back to flickman.co/apps
            </a>
          </>
        )}
        {status === "missing" && (
          <>
            <h1 className="text-2xl font-bold mb-2">We can&rsquo;t find your drawings</h1>
            <p className="opacity-60 mb-6">
              Your font is saved on the device you drew it on. Open this page in the same browser
              you used to draw your letters, and try again.
            </p>
            <a
              href="/apps/handwriting"
              className="inline-block px-5 py-3 rounded-xl bg-white border-2 border-black/10 font-semibold text-sm"
            >
              Start over
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
            <p className="opacity-60 mb-6">Try refreshing this page.</p>
          </>
        )}
      </div>
    </main>
  );
}
