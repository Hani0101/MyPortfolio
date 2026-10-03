"use client";

import { useEffect, useRef, type RefObject } from "react";

export type PointerTarget = { clientX: number; clientY: number } | null;

const LERP = 0.1; // share of the remaining distance covered per 60fps frame
const FRAME_MS = 1000 / 60;

type Props = {
  activeId: string | null;
  /** Fine pointer and motion allowed. Otherwise nothing renders. */
  enabled: boolean;
  /** Hero on screen. The rAF loop only runs while true. */
  inView: boolean;
  heroRef: RefObject<HTMLElement | null>;
  targetRef: RefObject<PointerTarget>;
};

/**
 * A soft glow in the active company's color that trails the cursor over the
 * list. It has no word or hard edge of its own, so it never competes with the
 * names it passes behind.
 */
export function HoverObject({ activeId, enabled, inView, heroRef, targetRef }: Props) {
  const objectRef = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 0, y: 0, placed: false });
  const wasActive = useRef(false);

  // Coming from idle: appear at the cursor rather than flying in from the last position
  useEffect(() => {
    const isActive = activeId !== null;
    if (isActive && !wasActive.current) state.current.placed = false;
    wasActive.current = isActive;
  }, [activeId]);

  useEffect(() => {
    if (!enabled || !inView) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const hero = heroRef.current;
      const el = objectRef.current;
      const target = targetRef.current;
      const s = state.current;
      // Frame-rate independent lerp so 120Hz screens feel the same as 60Hz
      const k = 1 - Math.pow(1 - LERP, (now - last) / FRAME_MS);
      last = now;

      if (hero && el && target) {
        const rect = hero.getBoundingClientRect();
        const tx = target.clientX - rect.left;
        const ty = target.clientY - rect.top;
        if (!s.placed) {
          s.x = tx;
          s.y = ty;
          s.placed = true;
        }
        s.x += (tx - s.x) * k;
        s.y += (ty - s.y) * k;
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, inView, heroRef, targetRef]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div
        ref={objectRef}
        className="absolute left-0 top-0 size-[min(34rem,60vw)] will-change-transform"
        style={{
          opacity: activeId ? "var(--hero-shape-opacity)" : 0,
          transition: "opacity var(--theme-duration) var(--theme-ease)",
        }}
      >
        <div className="hero-object-glow size-full" />
      </div>
    </div>
  );
}
