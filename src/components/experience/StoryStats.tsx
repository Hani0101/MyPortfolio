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

/**
 * The story's high point, so the numbers are the biggest type in it: one per
 * row, number then label, which gives each label room to stay on one or two lines.
 */
export function StoryStats({ stats, revealed, animate }: Props) {
  return (
    <dl className="mt-6 grid gap-4">
      {stats.map((stat, index) => (
        // Number first visually, label first in the DOM (dt before dd). Phones stack them;
        // wider screens put the label beside a fixed-width number, so the labels line up.
        <div
          key={stat.label}
          className="story-stat flex flex-col-reverse pt-3 sm:flex-row-reverse sm:items-baseline sm:justify-end sm:gap-5"
        >
          <dt className="mt-1 text-muted sm:mt-0">{stat.label}</dt>
          <dd className="shrink-0 font-heading text-h1 font-semibold leading-none sm:w-[2.4em]">
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
