"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const YOUTUBE_VIDEO_ID = "yJ6Lbsmb1lY";

// Declare YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (vol: number) => void;
  getVolume: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTPlayerConstructor {
  new (elementId: string, config: Record<string, unknown>): YTPlayer;
}

declare global {
  interface Window {
    YT: { Player: YTPlayerConstructor; PlayerState: { PLAYING: number; PAUSED: number; ENDED: number } };
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Jukebox() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showVolume, setShowVolume] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const initialized = useRef(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  const initPlayer = useCallback(() => {
    if (!apiReady || playerRef.current) return;

    playerRef.current = new window.YT.Player("yt-jukebox-player", {
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID, // Required for loop to work
        controls: 0,
        showinfo: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: { target: YTPlayer }) => {
          event.target.setVolume(volume);
          event.target.playVideo();
          setIsPlaying(true);
        },
        onStateChange: (event: { data: number }) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            // Restart for looping
            playerRef.current?.playVideo();
          }
        },
      },
    } as unknown as Record<string, unknown>);
  }, [apiReady, volume]);

  const togglePlay = () => {
    if (!playerRef.current) {
      // First click — initialize player
      initPlayer();
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleVolume = (newVol: number) => {
    setVolume(newVol);
    playerRef.current?.setVolume(newVol);
  };

  return (
    <>
      {/* Hidden YouTube player */}
      <div className="fixed -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div id="yt-jukebox-player" />
      </div>

      {/* Jukebox button — fixed top-right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Volume slider */}
        <AnimatePresence>
          {showVolume && (
            <motion.div
              initial={{ opacity: 0, x: 10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: 10, width: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-sm"
                style={{
                  backgroundColor: "rgba(44,44,44,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "2px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                <span className="text-[10px] text-cream/50 font-[family-name:var(--font-pixel)]">
                  🔈
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => handleVolume(Number(e.target.value))}
                  className="w-20 h-1 accent-grass cursor-pointer"
                />
                <span className="text-[10px] text-cream/50 font-[family-name:var(--font-pixel)]">
                  🔊
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main jukebox toggle */}
        <button
          onClick={togglePlay}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
          className="relative group"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          <div
            className="w-11 h-11 flex items-center justify-center rounded-sm transition-all duration-200"
            style={{
              backgroundColor: isPlaying ? "rgba(44,44,44,0.85)" : "rgba(44,44,44,0.6)",
              backdropFilter: "blur(8px)",
              border: isPlaying ? "2px solid rgba(106,175,53,0.5)" : "2px solid rgba(255,255,255,0.1)",
              boxShadow: isPlaying
                ? "0 0 12px rgba(106,175,53,0.3), 0 4px 16px rgba(0,0,0,0.3)"
                : "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <span className="text-lg">
              {isPlaying ? "🎵" : "🎶"}
            </span>

            {/* Playing indicator — spinning disc */}
            {isPlaying && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-grass rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ boxShadow: "0 0 6px rgba(106,175,53,0.6)" }}
              />
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="font-[family-name:var(--font-pixel)] text-[7px] text-cream bg-coal/90 px-2 py-1 whitespace-nowrap rounded-sm border border-cream/10">
              {isPlaying ? "Jukebox ON" : "Play music"}
            </span>
          </div>
        </button>
      </div>
    </>
  );
}
