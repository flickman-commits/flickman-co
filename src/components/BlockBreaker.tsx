"use client";

import { useCallback } from "react";

const PARTICLE_COLORS = ["#7CB342", "#5D8C3E", "#8B6914", "#6B4F0E", "#A0522D", "#7F8C8D", "#95A5A6"];

export function useBlockBreak() {
  const spawnParticles = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add crack overlay
    const crack = document.createElement("div");
    crack.className = "block-crack";
    (e.currentTarget as HTMLElement).style.position = "relative";
    (e.currentTarget as HTMLElement).appendChild(crack);
    setTimeout(() => crack.remove(), 500);

    // Spawn particles
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.className = "block-particle";
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 20;
      const rotation = Math.random() * 360;

      particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        background-color: ${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]};
        --tx: ${tx}px;
        --ty: ${ty}px;
        --tr: ${rotation}deg;
        box-shadow: inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.3);
      `;

      (e.currentTarget as HTMLElement).appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    }
  }, []);

  return spawnParticles;
}
