"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import type { Company } from "@/content/companies";

export type PointerTarget = { clientX: number; clientY: number } | null;

const LERP = 0.1; // share of the remaining distance covered per 60fps frame
const TILT_PER_PX = 0.5; // degrees of rotation per px/frame of horizontal speed
const MAX_TILT = 8;
const FRAME_MS = 1000 / 60;

// One organic shape for every company; only the keyword changes
const BLOB =
  "M206 30C300 22 378 100 370 200C362 296 292 378 196 370C98 362 24 300 32 198C40 102 116 38 206 30Z";

type Props = {
  companies: Company[];
  activeId: string | null;
  /** Fine pointer and motion allowed. Otherwise nothing renders. */
  enabled: boolean;
  /** Hero on screen. The rAF loop only runs while true. */
  inView: boolean;
  heroRef: RefObject<HTMLElement | null>;
  targetRef: RefObject<PointerTarget>;
};

export function HoverObject({ companies, activeId, enabled, inView, heroRef, targetRef }: Props) {
  const objectRef = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 0, y: 0, rotation: 0, placed: false });
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
        const dx = (tx - s.x) * k;
        s.x += dx;
        s.y += (ty - s.y) * k;
        const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * TILT_PER_PX));
        s.rotation += (tilt - s.rotation) * k;
        el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) rotate(${s.rotation}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, inView, heroRef, targetRef]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {/* Outer opacity caps everything at --hero-shape-opacity, even mid-crossfade */}
      <div
        ref={objectRef}
        className="absolute left-0 top-0 size-[min(26rem,60vw)] will-change-transform"
        style={{ opacity: "var(--hero-shape-opacity)" }}
      >
        {companies.map((company) => (
          <Mark key={company.id} keyword={company.keyword} visible={company.id === activeId} />
        ))}
      </div>
    </div>
  );
}

function Mark({ keyword, visible }: { keyword: string; visible: boolean }) {
  const maskId = useId();
  // Fit the word inside the blob: ~0.55em per character, 290 units of width
  const fontSize = Math.min(150, 290 / (0.55 * keyword.length));

  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 size-full"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity var(--theme-duration) var(--theme-ease)",
      }}
    >
      <defs>
        <mask id={maskId}>
          <rect width="400" height="400" fill="white" />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="central"
            fill="black"
            style={{ fontFamily: "var(--type-heading)", fontWeight: 700, fontSize }}
          >
            {keyword}
          </text>
        </mask>
      </defs>
      <path d={BLOB} mask={`url(#${maskId})`} className="hero-object-fill" />
    </svg>
  );
}
