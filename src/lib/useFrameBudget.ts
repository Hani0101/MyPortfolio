"use client";

import { useEffect, useRef, useState } from "react";

const WINDOW_FRAMES = 60; // judge the median of every 60 busy frames (about a second)
const BUDGET_MS = 25; // median frame time above this (< 40fps) = struggling
const WARMUP_MS = 1500; // ignore hydration and font loading jank
const BUSY_MS = 400; // keep sampling this long after the last scroll or pointer move
const TRUSTED_AFTER = 5; // healthy windows before the device is trusted and measuring stops

/**
 * Watches frame times while `active` and returns true once the device can't
 * keep up. Frames are only sampled while the reader scrolls or moves the
 * pointer, since that's when the effects cost something, so an idle page runs
 * no loop. One-way: once tripped it stays true, so effects don't flicker back
 * on and off; once the device has kept up for a while, measuring stops for good.
 */
export function useFrameBudget(active: boolean): boolean {
  const [overBudget, setOverBudget] = useState(false);
  const trusted = useRef(false);

  useEffect(() => {
    if (!active || overBudget || trusted.current) return;
    const start = performance.now();
    const frames: number[] = [];
    let healthy = 0;
    let lastInput = 0;
    let last = 0;
    let raf = 0;

    const tick = (now: number) => {
      raf = 0;
      if (last) frames.push(now - last);
      last = now;
      if (frames.length >= WINDOW_FRAMES) {
        const median = [...frames].sort((a, b) => a - b)[frames.length >> 1];
        frames.length = 0;
        if (median > BUDGET_MS) return setOverBudget(true);
        if (++healthy >= TRUSTED_AFTER) {
          trusted.current = true;
          return stop();
        }
      }
      // Gone quiet: stop sampling, and don't count the gap until the next input as a frame
      if (now - lastInput < BUSY_MS) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const onInput = () => {
      lastInput = performance.now();
      if (!raf && lastInput - start > WARMUP_MS) raf = requestAnimationFrame(tick);
    };

    function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onInput);
      window.removeEventListener("scroll", onInput);
    }

    window.addEventListener("pointermove", onInput, { passive: true });
    window.addEventListener("scroll", onInput, { passive: true });
    return stop;
  }, [active, overBudget]);

  return overBudget;
}
