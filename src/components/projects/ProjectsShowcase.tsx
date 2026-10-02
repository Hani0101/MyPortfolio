"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { projects, projectsSection, type Project } from "@/content/projects";
import { useCompanyTheme } from "@/lib/useCompanyTheme";
import { ProjectMedia } from "./ProjectMedia";
import { LABEL, ProjectLinks, ProjectStack } from "./ProjectParts";

const pad = (n: number) => String(n).padStart(2, "0");
const LAST = projects.length - 1;

// Tabs pattern: arrows move through the projects (either axis, so it works
// whichever way the list lays out) and wrap around; Home/End jump to the ends
const KEY_TARGET: Record<string, (index: number) => number> = {
  ArrowDown: (i) => (i === LAST ? 0 : i + 1),
  ArrowRight: (i) => (i === LAST ? 0 : i + 1),
  ArrowUp: (i) => (i === 0 ? LAST : i - 1),
  ArrowLeft: (i) => (i === 0 ? LAST : i - 1),
  Home: () => 0,
  End: () => LAST,
};

/**
 * Projects, layout C: a showcase. Picking a project puts it on the stage and
 * themes the section in its color, the way a company themes the hero. One
 * screen tall whatever the number of projects; selection is by click or
 * keyboard, never by hover or scroll.
 */
export function ProjectsShowcase({ id = "projects" }: { id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState(0);
  const { activate } = useCompanyTheme(sectionRef, projects);

  useEffect(() => {
    activate(projects[selected].id);
  }, [activate, selected]);

  const tabId = (project: Project) => `${id}-tab-${project.id}`;
  const panelId = (project: Project) => `${id}-panel-${project.id}`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = KEY_TARGET[event.key];
    if (!target) return;
    event.preventDefault();
    const next = target(selected);
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section ref={sectionRef} id={id} aria-labelledby={`${id}-title`} className="projects-showcase">
      <div className="mx-auto grid max-w-content gap-y-10 px-gutter py-section lg:grid-cols-12 lg:gap-x-8">
        {/* Desktop: the heading tops the column and the list sits at its foot, level with the stage */}
        <div className="flex flex-col lg:col-span-5 lg:justify-between">
          <header>
            <h2 id={`${id}-title`} className="text-h2">
              {projectsSection.title}
            </h2>
            <p className="mt-4 max-w-prose text-lead text-muted">{projectsSection.lead}</p>
          </header>

          <div className="mt-10">
            {/* Says the list is a control, not just a list */}
            <p id={`${id}-hint`} className={`${LABEL} mb-4`}>
              {projectsSection.pick}
            </p>
            <div
              role="tablist"
              aria-label={projectsSection.title}
              aria-describedby={`${id}-hint`}
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="border-t border-border"
            >
              {projects.map((project, index) => {
                const isSelected = index === selected;
                return (
                  <button
                    key={project.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(project)}
                    aria-selected={isSelected}
                    aria-controls={panelId(project)}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setSelected(index)}
                    className="showcase-tab relative flex w-full items-baseline gap-5 border-b border-border py-5 pl-6 pr-2 text-left"
                  >
                    <span aria-hidden className="showcase-tab-marker absolute inset-y-4 left-0 w-[3px] rounded-pill" />
                    <span aria-hidden className="font-mono text-sm text-muted">
                      {pad(index + 1)}
                    </span>
                    <span className="min-w-0">
                      <span className="showcase-tab-title block font-heading text-h3 font-semibold">{project.title}</span>
                      <span className="mt-1 block text-sm text-muted">{project.meta}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Every panel stays in the page, stacked in one cell so switching never
            changes the section's height; the hidden ones are inert */}
        <div className="grid lg:col-span-7">
          {projects.map((project, index) => {
            const isSelected = index === selected;
            return (
              <div
                key={project.id}
                role="tabpanel"
                id={panelId(project)}
                aria-labelledby={tabId(project)}
                tabIndex={isSelected ? 0 : -1}
                inert={!isSelected}
                data-active={isSelected}
                className="showcase-panel col-start-1 row-start-1"
              >
                <h3 className="sr-only">{project.title}</h3>

                {/* The stage: a browser window rising from its bottom edge */}
                <div className="showcase-stage relative overflow-hidden rounded-card">
                  <div aria-hidden className="showcase-blob absolute -right-1/4 -top-1/2 aspect-square w-3/4" />
                  <p aria-hidden className="relative px-[var(--card-padding)] pt-5 font-mono text-sm text-muted">
                    {pad(index + 1)} / {pad(projects.length)}
                  </p>
                  <div className="showcase-window relative mx-[var(--card-padding)] mt-4 overflow-hidden rounded-t-control">
                    <div aria-hidden className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                      <span className="size-2.5 rounded-full bg-border" />
                      <span className="size-2.5 rounded-full bg-border" />
                      <span className="size-2.5 rounded-full bg-border" />
                      <span className="ml-3 h-2 w-1/3 rounded-pill bg-background" />
                    </div>
                    {project.media ? (
                      <ProjectMedia media={project.media} className="" playing={isSelected} />
                    ) : (
                      <WindowPlaceholder />
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="max-w-prose text-muted">{project.summary}</p>
                  <ProjectStack stack={project.stack} tone="story-chip" />
                  <ProjectLinks links={project.links} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Until the media is ready: a page sketch in the project's color, labelled as a placeholder */
function WindowPlaceholder() {
  return (
    <div aria-hidden className="aspect-[16/10] w-full p-[5%]">
      <div className="flex h-full flex-col gap-[5%]">
        <div className="showcase-sketch grid h-[40%] place-items-center rounded-control">
          <span className="rounded-pill bg-surface px-3 py-1 text-sm font-medium text-muted shadow-soft">Image or video</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="h-2.5 w-2/3 rounded-pill bg-background" />
          <span className="h-2.5 w-1/2 rounded-pill bg-background" />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-[4%]">
          <span className="rounded-control border border-dashed border-border-strong" />
          <span className="rounded-control border border-dashed border-border-strong" />
          <span className="rounded-control border border-dashed border-border-strong" />
        </div>
      </div>
    </div>
  );
}
