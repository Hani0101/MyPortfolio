"use client";

import { useEffect, useRef } from "react";

const RINGS = [
  { size: "16rem", scale: 1.06 },
  { size: "24rem", scale: 1.09 },
  { size: "32rem", scale: 1.12 },
];
const STAGGER_MS = 70;

/**
 * Concentric rings centered on the name. Each company change sends a ripple
 * outward; they settle slightly enlarged while a company is active.
 * Place inside a `relative` box that wraps the name.
 */
export function NameRipples({ activeId, animate }: { activeId: string | null; animate: boolean }) {
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Our own animations only: getAnimations() would also return the CSS color transition
  const running = useRef<(Animation | null)[]>([]);

  useEffect(() => {
    if (!animate) return;
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const current = getComputedStyle(ring).scale;
      const from = current === "none" ? "1" : current;
      const rest = activeId ? RINGS[i].scale : 1;
      const keyframes = activeId
        ? [{ scale: from }, { scale: String(rest + 0.05) }, { scale: String(rest) }]
        : [{ scale: from }, { scale: "1" }];
      running.current[i]?.cancel();
      running.current[i] = ring.animate(keyframes, {
        duration: activeId ? 900 : 600,
        delay: i * STAGGER_MS,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "both", // hold the start scale during the stagger delay instead of snapping
      });
    });
  }, [activeId, animate]);

  return (
    // Desktop only: on phones the rings would cross the intro text, and the
    // name is off screen by the time a company activates there
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden size-0 lg:block">
      {RINGS.map((ring, i) => (
        <div
          key={ring.size}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          className="hero-ripple absolute -translate-x-1/2 -translate-y-1/2"
          style={{ width: ring.size, height: ring.size }}
        />
      ))}
    </div>
  );
}
