"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { PointerTarget } from "./HoverObject";

const SPACING = 30; // px between dots
const BASE_RADIUS = 1;
const RADIUS = 140; // cursor influence radius in px
const PUSH = 14; // max px a dot is pushed away
const GROW = 1.4; // extra radius right next to the cursor
const LERP = 0.12; // how fast the influence follows the cursor (per 60fps frame)
const FRAME_MS = 1000 / 60;
const TAU = Math.PI * 2;

type Props = {
  cursorRef: RefObject<PointerTarget>;
  /** Cursor repel on (fine pointer, motion allowed). Off = static grid. */
  interactive: boolean;
  /** Only run the loop while the hero is on screen. */
  inView: boolean;
};

/** Evenly spaced dots on one canvas; dots near the cursor push away and grow, then settle. */
export function DotGrid({ cursorRef, interactive, inView }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !probe || !ctx || !inView) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let color = "";
    let dirty = true;
    let frame = 0;
    let last = performance.now();
    const influence = { x: 0, y: 0, strength: 0 };

    const styles = getComputedStyle(canvas);
    const baseAlpha = parseFloat(styles.getPropertyValue("--hero-dot-alpha")) || 0.2;
    const maxAlpha = parseFloat(styles.getPropertyValue("--hero-dot-alpha-max")) || 0.55;

    // The resting grid is built once per size; each redraw is a single fill
    let grid = new Path2D();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      grid = new Path2D();
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          grid.moveTo(x + BASE_RADIUS, y);
          grid.arc(x, y, BASE_RADIUS, 0, TAU);
        }
      }
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.globalAlpha = baseAlpha;
      ctx.fill(grid);
      if (influence.strength < 0.01) return;

      // Only the ~60 dots inside the cursor radius: erase them, redraw displaced
      const near: [number, number, number, number][] = [];
      const erase = new Path2D();
      const first = (v: number) => Math.max(SPACING / 2, Math.ceil((v - RADIUS - SPACING / 2) / SPACING) * SPACING + SPACING / 2);
      for (let y = first(influence.y); y < Math.min(height, influence.y + RADIUS); y += SPACING) {
        for (let x = first(influence.x); x < Math.min(width, influence.x + RADIUS); x += SPACING) {
          const dx = x - influence.x;
          const dy = y - influence.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= RADIUS) continue;
          const f = (1 - dist / RADIUS) ** 2 * influence.strength;
          const d = dist || 1;
          erase.moveTo(x + BASE_RADIUS + 1, y);
          erase.arc(x, y, BASE_RADIUS + 1, 0, TAU);
          near.push([x + (dx / d) * PUSH * f, y + (dy / d) * PUSH * f, BASE_RADIUS + GROW * f, f]);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill(erase);
      ctx.globalCompositeOperation = "source-over";
      for (const [x, y, r, f] of near) {
        ctx.globalAlpha = baseAlpha + (maxAlpha - baseAlpha) * f;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
    };

    let colorChanging = false;
    const readColor = () => {
      const next = getComputedStyle(probe).color;
      if (next !== color) {
        color = next;
        dirty = true;
      }
    };
    const onTransitionRun = () => (colorChanging = true);
    const onTransitionEnd = () => {
      colorChanging = false;
      readColor(); // land exactly on the final color
    };
    probe.addEventListener("transitionrun", onTransitionRun);
    probe.addEventListener("transitionend", onTransitionEnd);
    probe.addEventListener("transitioncancel", onTransitionEnd);
    readColor();

    const tick = (now: number) => {
      const k = 1 - Math.pow(1 - LERP, (now - last) / FRAME_MS);
      last = now;

      // Follows the theme transition frame by frame, in sync with the CSS layers.
      // Reading computed style forces a style recalc, so only poll while it runs.
      if (colorChanging) readColor();

      const cursor = interactive ? cursorRef.current : null;
      const before = { ...influence };
      if (cursor) {
        const rect = canvas.getBoundingClientRect();
        const tx = cursor.clientX - rect.left;
        const ty = cursor.clientY - rect.top;
        // Jump to the cursor when coming from rest instead of sweeping across
        if (influence.strength < 0.01) {
          influence.x = tx;
          influence.y = ty;
        }
        influence.x += (tx - influence.x) * k;
        influence.y += (ty - influence.y) * k;
      }
      const targetStrength = cursor ? 1 : 0;
      influence.strength += (targetStrength - influence.strength) * k;
      if (influence.strength < 0.001) influence.strength = 0;
      const moved =
        Math.abs(influence.x - before.x) > 0.05 ||
        Math.abs(influence.y - before.y) > 0.05 ||
        Math.abs(influence.strength - before.strength) > 0.001;
      if (moved) dirty = true;

      if (dirty) {
        draw();
        dirty = false;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      probe.removeEventListener("transitionrun", onTransitionRun);
      probe.removeEventListener("transitionend", onTransitionEnd);
      probe.removeEventListener("transitioncancel", onTransitionEnd);
    };
  }, [cursorRef, interactive, inView]);

  return (
    <>
      <span ref={probeRef} aria-hidden className="hero-color-probe" />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
    </>
  );
}
