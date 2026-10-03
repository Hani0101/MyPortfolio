"use client";

import { useEffect, useRef, type RefObject } from "react";

export type PointerTarget = { clientX: number; clientY: number } | null;

const LERP = 0.1; // share of the remaining distance covered per 60fps frame
const FRAME_MS = 1000 / 60;

type Props = {
  activeId: string | null;
  /** Fine pointer and motion allowed. Otherwise nothing renders. */
  enabled: boolean;
  /** Hero on screen. The glow only moves while true. */
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
  const wakeRef = useRef<(() => void) | null>(null);

  // Coming from idle: appear at the cursor rather than flying in from the last position
  useEffect(() => {
    const isActive = activeId !== null;
    if (isActive && !wasActive.current) {
      state.current.placed = false;
      wakeRef.current?.();
    }
    wasActive.current = isActive;
  }, [activeId]);

  // Moves on demand: frames run while the glow catches up with its target, then
  // the loop sleeps until the pointer, keyboard focus or page moves again
  useEffect(() => {
    const hero = heroRef.current;
    if (!enabled || !inView || !hero) return;
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = 0;
      const el = objectRef.current;
      const target = targetRef.current;
      const s = state.current;
      if (!el || !target) return;
      // Frame-rate independent lerp so 120Hz screens feel the same as 60Hz;
      // waking from rest, one 60fps step instead of the whole idle gap
      const k = last ? 1 - Math.pow(1 - LERP, (now - last) / FRAME_MS) : LERP;

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
      // Close enough: land on the target and sleep
      const settled = Math.abs(tx - s.x) < 0.1 && Math.abs(ty - s.y) < 0.1;
      if (settled) {
        s.x = tx;
        s.y = ty;
      }
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%)`;

      if (settled) last = 0;
      else {
        last = now;
        frame = requestAnimationFrame(tick);
      }
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    // The target is in screen coordinates, so a scroll under a still cursor moves it too
    hero.addEventListener("pointermove", wake, { passive: true });
    hero.addEventListener("focusin", wake);
    window.addEventListener("scroll", wake, { passive: true });
    wake();
    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      hero.removeEventListener("pointermove", wake);
      hero.removeEventListener("focusin", wake);
      window.removeEventListener("scroll", wake);
    };
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
