"use client";

import type { ReactNode } from "react";
import { LazyMotion, domMin } from "motion/react";

/**
 * Supplies the renderer for the slim `m.*` components (from "motion/react-m").
 * They render nothing live without it: motion values only show their first
 * value. domMin is the smallest feature set that includes the DOM renderer; the
 * full `motion.*` components would pull in gestures, drag and layout as well.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMin}>{children}</LazyMotion>;
}
