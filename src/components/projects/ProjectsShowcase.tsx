import type { CSSProperties } from "react";
import { projects, projectsSection, type Project } from "@/content/projects";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectLinks, ProjectStack } from "./ProjectParts";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Projects: every project on the page at once, text beside its media in a
 * browser window tinted by the project's own color. Nothing to click to see
 * one, so a skim down the page shows them all.
 */
export function ProjectsShowcase({ id = "projects" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="projects-showcase">
      <div className="mx-auto max-w-content px-gutter py-section">
        <header>
          <h2 id={`${id}-title`} className="text-h2">
            {projectsSection.title}
          </h2>
          <p className="mt-4 max-w-prose text-lead text-muted">{projectsSection.lead}</p>
        </header>

        <ol className="mt-12 grid gap-16 lg:gap-24">
          {projects.map((project, index) => (
            <ProjectRow key={project.id} project={project} number={pad(index + 1)} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProjectRow({ project, number }: { project: Project; number: string }) {
  return (
    <li
      // Its own variable, not --accent-color, which only useCompanyTheme writes
      style={{ "--project-accent": project.accent ?? "var(--accent)" } as CSSProperties}
      className="grid gap-8 border-t border-border pt-8 lg:grid-cols-12 lg:items-center"
    >
      <div className="lg:col-span-5">
        <p className="text-sm font-medium tabular-nums text-muted">{number}</p>
        <h3 className="mt-3 text-h2">{project.title}</h3>
        <p className="mt-2 text-sm text-muted">{project.meta}</p>
        <p className="mt-5 max-w-prose text-muted">{project.summary}</p>
        <ProjectStack stack={project.stack} tone="project-chip" />
        <ProjectLinks links={project.links} className="project-links" />
      </div>

      {/* The stage: a browser window rising from its bottom edge */}
      <div className="showcase-stage relative overflow-hidden rounded-card pt-[var(--card-padding)] lg:col-span-7">
        <div aria-hidden className="showcase-blob absolute -right-1/4 -top-1/2 aspect-square w-3/4" />
        <div className="showcase-window relative mx-[var(--card-padding)] overflow-hidden rounded-t-control">
          <div aria-hidden className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="ml-3 h-2 w-1/3 rounded-pill bg-background" />
          </div>
          {project.media?.length ? <ProjectGallery items={project.media} /> : <WindowPlaceholder />}
        </div>
      </div>
    </li>
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
