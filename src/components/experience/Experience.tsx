"use client";

import { useCallback, useRef, useState } from "react";
import { motionValue } from "motion/react";
import { companies } from "@/content/companies";
import { earlierRolesSection, experiences, experienceSection } from "@/content/experiences";
import { projectsSection } from "@/content/projects";
import { useCompanyTheme } from "@/lib/useCompanyTheme";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { EarlierRoles, earlierRolesAnchor } from "./EarlierRoles";
import { ExperienceStory, type StageState } from "./ExperienceStory";
import { StoryStage, StoryStageLayer } from "./StoryStage";

const pad = (n: number) => String(n).padStart(2, "0");

const companiesById = new Map(companies.map((c) => [c.id, c]));
const stories = experiences.flatMap((experience) => {
  const company = companiesById.get(experience.companyId);
  return company ? [{ experience, company }] : [];
});

// Where the pinned "Next" control leads from each story: the next story, then whatever follows the stories
const afterStories = earlierRolesAnchor
  ? { href: earlierRolesAnchor, label: earlierRolesSection.title }
  : { href: "#projects", label: projectsSection.title };
const nextOf = new Map(
  stories.map(({ company }, i) => {
    const next = stories[i + 1]?.company;
    return [company.id, next ? { href: next.href, label: next.name } : afterStories];
  }),
);

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  // Same hook as the hero hover, with scroll as the trigger: the story at the
  // center of the screen owns the section theme
  const { activate, release } = useCompanyTheme(sectionRef, companies);

  // false on the server and during hydration, so the static HTML is the
  // reduced-motion layout
  const animate = useMediaQuery("(prefers-reduced-motion: no-preference)");

  // The story on stage. Unlike the theme it never goes blank: between stories
  // (or past the last one) the last story stays on stage until the next arrives.
  const [onStageId, setOnStageId] = useState(stories[0]?.company.id);
  const handleActivate = useCallback(
    (id: string) => {
      activate(id);
      setOnStageId(id);
    },
    [activate],
  );

  // Each story reports its step here, and writes its scroll progress into its own motion value
  const [stages, setStages] = useState<Record<string, StageState>>(() =>
    Object.fromEntries(
      stories.map(({ experience, company }) => [
        company.id,
        { activeStep: 0, stepStarts: experience.steps.map((_, i) => i / experience.steps.length) },
      ]),
    ),
  );
  const handleStage = useCallback((id: string, state: StageState) => setStages((all) => ({ ...all, [id]: state })), []);
  const [progress] = useState(() => new Map(stories.map(({ company }) => [company.id, motionValue(0)])));

  // Stories that have come within a screen; their stage visuals load then. Every
  // story shares the one pinned stage, so the stage being on screen can't tell
  // them apart. One-way: a loaded visual stays loaded.
  const [near, setNear] = useState<ReadonlySet<string>>(() => new Set());
  const handleNear = useCallback((id: string) => setNear((all) => (all.has(id) ? all : new Set(all).add(id))), []);

  const onStage = stories.find(({ company }) => company.id === onStageId);
  const next = onStage && nextOf.get(onStage.company.id);

  return (
    <section ref={sectionRef} id="experience" aria-labelledby="experience-title" className="experience relative isolate">
      <header className="mx-auto max-w-content px-gutter pt-section">
        <h2 id="experience-title" className="text-h2">
          {experienceSection.title}
        </h2>
        <p className="mt-4 max-w-prose text-lead text-muted">{experienceSection.lead}</p>
      </header>

      <div className="mx-auto grid max-w-content px-gutter lg:grid-cols-12 lg:gap-8">
        {/* Phones: pinned behind the steps. Desktop: pinned in its own column. */}
        <StoryStage className="col-start-1 row-start-1 lg:col-span-6 lg:col-start-7">
          {stories.map(({ experience, company }) => (
            <StoryStageLayer
              key={company.id}
              steps={experience.steps}
              activeStep={stages[company.id].activeStep}
              visuals={experience.visuals}
              stepStarts={stages[company.id].stepStarts}
              progress={progress.get(company.id)!}
              animate={animate}
              active={company.id === onStageId}
              load={near.has(company.id)}
            />
          ))}
        </StoryStage>

        <div className="relative z-10 col-start-1 row-start-1 lg:col-span-5">
          {stories.map(({ experience, company }) => (
            <ExperienceStory
              key={company.id}
              experience={experience}
              company={company}
              animate={animate}
              progress={progress.get(company.id)!}
              onActivateAction={handleActivate}
              onReleaseAction={release}
              onStageAction={handleStage}
              onNearAction={handleNear}
            />
          ))}

          {onStage && next && (
            // Sticks to the bottom of the screen while the stories scroll, then settles
            // under the last one: where the reader is, and a way past a long story
            <div className="story-hud sticky bottom-6 z-20 ml-8 mt-12 flex w-fit items-center gap-1 rounded-pill p-1 pl-4 text-sm sm:ml-10">
              <span aria-hidden className="pr-2 font-medium tabular-nums text-muted">
                {pad(stages[onStage.company.id].activeStep + 1)} / {pad(onStage.experience.steps.length)}
              </span>
              <a href={next.href} className="story-skip rounded-pill px-3 py-1.5 font-medium">
                {experienceSection.next}: {next.label} <span aria-hidden>↓</span>
              </a>
            </div>
          )}
        </div>
      </div>

      <EarlierRoles />
    </section>
  );
}
