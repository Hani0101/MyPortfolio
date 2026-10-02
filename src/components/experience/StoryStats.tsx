"use client";

import { useEffect } from "react";
import { animate as animateValue, motion, useMotionValue, useTransform } from "motion/react";
import type { Stat } from "@/content/experiences";

const COUNT_SECONDS = 1.2;
const COUNT_STAGGER = 0.15;
const EASE = [0.2, 0, 0, 1] as const; // --curve-standard

type Props = {
  stats: Stat[];
  /** Count up while true; back to zero when the reader scrolls above the step */
  revealed: boolean;
  animate: boolean;
};

export function StoryStats({ stats, revealed, animate }: Props) {
  return (
    <dl className="mt-6 grid grid-cols-3 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        // Number first visually, label first in the DOM (dt before dd); justify-end keeps numbers aligned at the top
        <div key={stat.label} className="story-stat flex flex-col-reverse justify-end pt-3">
          <dt className="mt-1 text-sm text-muted">{stat.label}</dt>
          <dd className="font-heading text-h2 font-semibold">
            <Counter stat={stat} run={revealed} animate={animate} delay={index * COUNT_STAGGER} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Counter({ stat, run, animate, delay }: { stat: Stat; run: boolean; animate: boolean; delay: number }) {
  const { value, prefix = "", suffix = "" } = stat;
  // Starts at the final value so the server HTML and reduced motion show real numbers
  const count = useMotionValue(value);
  const text = useTransform(count, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!animate) return count.set(value);
    if (!run) return count.set(0);
    const controls = animateValue(count, value, { duration: COUNT_SECONDS, delay, ease: EASE });
    return () => controls.stop();
  }, [animate, run, value, delay, count]);

  return (
    <>
      {/* The ticking number is visual only; screen readers get the final value once */}
      <motion.span aria-hidden className="lining-nums tabular-nums">
        {text}
      </motion.span>
      <span className="sr-only">{`${prefix}${value}${suffix}`}</span>
    </>
  );
}
