"use client";

import { useEffect, useState } from "react";

const WINDOW_MS = 1200; // judge the median of each 1.2s window
const BUDGET_MS = 25; // median frame time above this (< 40fps) = struggling
const WARMUP_MS = 1500; // ignore hydration and font loading jank

/**
 * Watches frame times while `active` and returns true once the device can't
 * keep up. One-way: once tripped it stays true, so effects don't flicker
 * back on and off.
 */
export function useFrameBudget(active: boolean): boolean {
  const [overBudget, setOverBudget] = useState(false);

  useEffect(() => {
    if (!active || overBudget) return;
    const frames: number[] = [];
    const start = performance.now();
    let windowStart = start + WARMUP_MS;
    let last = start;
    let raf = 0;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      // Skip warmup and gaps from a hidden tab or a paused loop
      if (now > windowStart && delta < 1000) frames.push(delta);
      if (now - windowStart >= WINDOW_MS && frames.length > 0) {
        const median = [...frames].sort((a, b) => a - b)[frames.length >> 1];
        if (median > BUDGET_MS) {
          setOverBudget(true);
          return;
        }
        frames.length = 0;
        windowStart = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, overBudget]);

  return overBudget;
}
