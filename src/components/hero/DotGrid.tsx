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
  /** The hero: its pointer events wake the canvas */
  heroRef: RefObject<HTMLElement | null>;
  cursorRef: RefObject<PointerTarget>;
  /** Cursor repel on (fine pointer, motion allowed). Off = static grid. */
  interactive: boolean;
  /** Only draw while the hero is on screen. */
  inView: boolean;
};

/**
 * Evenly spaced dots on one canvas; dots near the cursor push away and grow, then settle.
 * Draws on demand: frames run only while the cursor's influence eases, the theme color
 * transitions or the canvas resizes, then the loop sleeps until the next event.
 */
export function DotGrid({ heroRef, cursorRef, interactive, inView }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  // Read by the loop, so turning the repel on or off wakes it instead of rebuilding the canvas
  const interactiveRef = useRef(interactive);
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    interactiveRef.current = interactive;
    wakeRef.current?.();
  }, [interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    const hero = heroRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !probe || !hero || !ctx || !inView) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let color = "";
    let dirty = true;
    let frame = 0;
    let last = 0;
    const influence = { x: 0, y: 0, strength: 0 };

    const styles = getComputedStyle(canvas);
    const baseAlpha = parseFloat(styles.getPropertyValue("--hero-dot-alpha")) || 0.2;
    const maxAlpha = parseFloat(styles.getPropertyValue("--hero-dot-alpha-max")) || 0.55;

    // The resting grid, drawn once per size as an alpha mask. Each frame copies and
    // tints it, which is far cheaper than filling a couple of thousand arcs again.
    const dots = document.createElement("canvas");
    const dotsCtx = dots.getContext("2d")!;

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = dots.width = Math.round(width * dpr);
      canvas.height = dots.height = Math.round(height * dpr);
      dotsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dotsCtx.beginPath();
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          dotsCtx.moveTo(x + BASE_RADIUS, y);
          dotsCtx.arc(x, y, BASE_RADIUS, 0, TAU);
        }
      }
      dotsCtx.fill();
      dirty = true;
      wake();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = () => {
      // Resting grid: copy the mask, then paint the color into it (source-in keeps its alpha)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(dots, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.globalAlpha = baseAlpha;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    const onTransitionRun = () => {
      colorChanging = true;
      wake();
    };
    const onTransitionEnd = () => {
      colorChanging = false;
      readColor(); // land exactly on the final color
      wake();
    };
    probe.addEventListener("transitionrun", onTransitionRun);
    probe.addEventListener("transitionend", onTransitionEnd);
    probe.addEventListener("transitioncancel", onTransitionEnd);
    readColor();

    function tick(now: number) {
      frame = 0;
      // Waking from rest: one 60fps step, not the whole idle gap
      const k = last ? 1 - Math.pow(1 - LERP, (now - last) / FRAME_MS) : LERP;

      // Follows the theme transition frame by frame, in sync with the CSS layers.
      // Reading computed style forces a style recalc, so only poll while it runs.
      if (colorChanging) readColor();

      const cursor = interactiveRef.current ? cursorRef.current : null;
      const { x: beforeX, y: beforeY, strength: beforeStrength } = influence;
      if (cursor) {
        const rect = canvas!.getBoundingClientRect();
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
        Math.abs(influence.x - beforeX) > 0.05 ||
        Math.abs(influence.y - beforeY) > 0.05 ||
        Math.abs(influence.strength - beforeStrength) > 0.001;
      if (moved) dirty = true;

      if (dirty) {
        draw();
        dirty = false;
      }

      // Keep going while the influence eases or the color transitions; otherwise sleep
      if (moved || colorChanging) {
        last = now;
        wake();
      } else last = 0;
    }

    // Wake on anything that moves the cursor relative to the canvas: the pointer
    // itself, leaving the hero (the dots settle back) and scrolling under a still cursor
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "touch") wake();
    };
    const onScroll = () => {
      if (interactiveRef.current && cursorRef.current) wake();
    };
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerleave", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      observer.disconnect();
      probe.removeEventListener("transitionrun", onTransitionRun);
      probe.removeEventListener("transitionend", onTransitionEnd);
      probe.removeEventListener("transitioncancel", onTransitionEnd);
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerleave", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroRef, cursorRef, inView]);

  return (
    <>
      <span ref={probeRef} aria-hidden className="hero-color-probe" />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
    </>
  );
}
