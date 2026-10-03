"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import type { Company } from "@/content/companies";
import type { Experience, StoryStep } from "@/content/experiences";
import { StoryStepContent } from "./StoryStepContent";

/** What the section's shared stage needs from a story */
export type StageState = { activeStep: number; stepStarts: number[] };

// A thin band at the vertical center: the step crossing it is the active one.
// The progress line uses the same line ("center"), so dots and fill agree.
const CENTER_BAND = "-49.5% 0px -49.5% 0px";

type Props = {
  experience: Experience;
  company: Company;
  animate: boolean;
  /** Owned by the section; this story writes its scroll progress into it for the shared stage */
  progress: MotionValue<number>;
  // The "Action" suffix marks these as server-action-style props, which Next's
  // "use client" serializable-props check (ts 71007) allows to be functions
  onActivateAction: (id: string) => void;
  onReleaseAction: (id: string) => void;
  onStageAction: (id: string, state: StageState) => void;
  /** Called once, when the story comes within a screen of the viewport */
  onNearAction: (id: string) => void;
};

export function ExperienceStory({
  experience,
  company,
  animate,
  progress,
  onActivateAction: onActivate,
  onReleaseAction: onRelease,
  onStageAction: onStage,
  onNearAction: onNear,
}: Props) {
  const storyRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  // Changes a handful of times per story, so state is fine here
  const [activeStep, setActiveStep] = useState(0);

  const { steps } = experience;
  const anchorId = company.href.replace(/^#/, ""); // the hero list links here
  const titleId = `${anchorId}-title`;
  const labels = numberLabels(steps);
  const stepCount = steps.length;

  // Where each step starts within the list (0..1), so visuals can tell how far
  // through a step the reader is. Measured, since steps can differ in height.
  const [stepStarts, setStepStarts] = useState(() => steps.map((_, i) => i / steps.length));
  useEffect(() => {
    const list = stepsRef.current;
    if (!list) return;
    const measure = () => {
      const height = list.offsetHeight || 1;
      setStepStarts([...list.querySelectorAll<HTMLElement>("[data-step]")].map((step) => step.offsetTop / height));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // One observer per story: the story itself drives the theme, its steps
  // drive the active step
  useEffect(() => {
    const story = storyRef.current;
    const list = stepsRef.current;
    if (!story || !list) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === story) {
            if (entry.isIntersecting) onActivate(company.id);
            else onRelease(company.id);
          } else if (entry.isIntersecting) {
            setActiveStep(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      { rootMargin: CENTER_BAND },
    );

    observer.observe(story);
    list.querySelectorAll("[data-step]").forEach((step) => observer.observe(step));
    return () => {
      observer.disconnect();
      onRelease(company.id);
    };
  }, [company.id, onActivate, onRelease]);

  // About a screen away: time for the section to load this story's stage visual
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        onNear(company.id);
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(story);
    return () => observer.disconnect();
  }, [company.id, onNear]);

  // The stage lives in the section, so it hears about step changes from here
  useEffect(() => onStage(company.id, { activeStep, stepStarts }), [onStage, company.id, activeStep, stepStarts]);

  // Motion value, not state: the fill follows the scroll without re-rendering
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start center", "end center"] });
  useEffect(() => progress.set(scrollYProgress.get()), [progress, scrollYProgress]);

  // A jump (hero link, End key) can skip steps without any crossing the
  // center, so settle on the matching end once the story is fully passed or ahead
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progress.set(value);
    if (value >= 1) setActiveStep(stepCount - 1);
    else if (value <= 0) setActiveStep(0);
  });

  // Phones: steps scroll over the section's pinned stage. Desktop: the stage has its own column.
  return (
    <article ref={storyRef} id={anchorId} aria-labelledby={titleId} className="pt-section">
      <ol ref={stepsRef} className="relative">
        <span aria-hidden className="story-track absolute inset-y-0 left-0 w-px" />
        {animate && (
          <motion.span
            aria-hidden
            style={{ scaleY: scrollYProgress }}
            className="story-fill absolute inset-y-0 left-0 w-px origin-top"
          />
        )}

        {steps.map((step, index) => (
          <li
            key={index}
            data-step={index}
            data-state={index < activeStep ? "passed" : index === activeStep ? "active" : "upcoming"}
            // Desktop: short enough that the next step is already in view, since the stage
            // has its own pinned column. Phones: tall enough that the previous step has
            // scrolled clear of the visual pinned above by the time the next one arrives.
            // The bottom padding keeps a gap after tall steps, such as the result numbers.
            className="story-step relative min-h-[65svh] pb-16 pl-8 sm:pl-10 lg:min-h-[40svh]"
          >
            <span aria-hidden className="story-dot absolute left-0 top-1 size-3 -translate-x-1/2 rounded-full" />
            <div className="story-step-body">
              <StoryStepContent
                step={step}
                label={labels[index]}
                company={company}
                location={experience.location}
                titleId={titleId}
                // Numbers count up on arrival; stack chips pop in one step early, while
                // their step is already in view below, so it never shows an empty gap
                revealed={!animate || index <= activeStep + (step.kind === "stack" ? 1 : 0)}
                animate={animate}
              />
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

/** Numbers runs of steps that share a label: "What I did · 1/3", "2/3"... */
function numberLabels(steps: StoryStep[]): (string | undefined)[] {
  const labelOf = (step: StoryStep) => (step.kind === "arrival" ? undefined : step.label);
  return steps.map((step, index) => {
    const label = labelOf(step);
    if (!label) return undefined;

    let start = index;
    while (start > 0 && labelOf(steps[start - 1]) === label) start--;
    let end = index;
    while (end < steps.length - 1 && labelOf(steps[end + 1]) === label) end++;

    const count = end - start + 1;
    return count > 1 ? `${label} · ${index - start + 1}/${count}` : label;
  });
}
