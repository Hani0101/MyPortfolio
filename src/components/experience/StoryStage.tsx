import type { ReactNode } from "react";
import type { MotionValue } from "motion/react";
import type { StoryStep, StoryVisual } from "@/content/experiences";
import { ModelVisual } from "./visuals/ModelVisual";

/**
 * The pinned stage, shared by every story in the section: it stays put from the
 * first story to the last, and the stories' layers crossfade inside it, so moving
 * to the next story never unpins it. Decorative only: everything it shows is also
 * in the steps, so it is hidden from assistive tech.
 */
export function StoryStage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={`story-stage pointer-events-none sticky top-0 grid h-svh self-start pl-8 sm:pl-10 lg:pl-0 ${className}`}
    >
      <div className="story-blob absolute inset-x-0 top-1/2 hidden aspect-square -translate-y-1/2 lg:block" />
      {children}
    </div>
  );
}

type LayerProps = {
  steps: StoryStep[];
  activeStep: number;
  visuals?: Record<string, StoryVisual>;
  /** Where each step starts, as a share of the steps' total height */
  stepStarts: number[];
  /** Scroll progress through the steps, for visuals that follow the scroll */
  progress: MotionValue<number>;
  animate: boolean;
  /** The story on stage; the others fade out but keep their state */
  active: boolean;
  /** The story is within a screen, so its visuals can load */
  load: boolean;
};

/** One story's word and visual, in the shared stage's single cell. The step counter is in the section's pinned control. */
export function StoryStageLayer({ steps, activeStep, visuals = {}, stepStarts, progress, animate, active, load }: LayerProps) {
  const entries = Object.entries(visuals);
  const current = steps[activeStep]?.scene?.visual;
  // Phones: pinned in the band above the active step; a visual needs more room
  const phoneTop = entries.length ? "pt-[10svh]" : "pt-[18svh]";

  return (
    <div
      data-active={active}
      className={`story-layer col-start-1 row-start-1 flex items-start lg:items-center lg:pt-0 ${phoneTop}`}
    >
      {/* Desktop: word above the visual slot. Phones: they share one cell and the
          word only shows while the step has no visual. */}
      <div className="relative grid w-full items-center">
        <div data-yield={!!current} className="story-words col-start-1 row-start-1 grid">
          {/* All words share one grid cell and crossfade in place */}
          {steps.map((step, index) => (
            <span
              key={index}
              data-active={index === activeStep}
              className="story-word col-start-1 row-start-1 font-heading font-semibold leading-none"
            >
              {step.word}
            </span>
          ))}
        </div>

        {entries.length > 0 && (
          <div className="col-start-1 row-start-1 grid lg:row-start-2 lg:mt-4">
            {entries.map(([id, visual]) => (
              <div key={id} data-active={id === current} className="story-visual col-start-1 row-start-1">
                <ModelVisual
                  id={id}
                  visual={visual}
                  steps={steps}
                  activeStep={activeStep}
                  stepStarts={stepStarts}
                  progress={progress}
                  animate={animate}
                  load={load}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
