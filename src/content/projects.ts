/**
 * Projects showcase: every project is shown at once, each in a browser window
 * tinted by its accent. Put media files in /public/projects.
 */

export type ProjectMedia =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  /** Muted and looping; under reduced motion only the poster shows. `label` describes the clip. */
  | { kind: "video"; src: string; poster: string; label: string };

export type Project = {
  id: string;
  title: string;
  /** Small line above the title, such as "2026 · Web app" */
  meta: string;
  /** Two or three sentences: the problem, what you built, the result */
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** Leave out to show a placeholder until the file is ready */
  media?: ProjectMedia;
  /** Tints the project's stage, chips and links; a --project-* token from tokens.css (>= 4.5:1, it colors link text) */
  accent?: string;
};

export const projectsSection = {
  title: "Projects",
  lead: "A few things I've built, and what each one taught me.",
};

// TODO: placeholder copy and links, replace with your own. Add `media` once the files are in /public/projects.
export const projects: Project[] = [
  {
    id: "project-one",
    title: "Project one",
    meta: "Year · Type of project",
    summary:
      "Two or three sentences on this project: the problem it solves, what you built and how, and the result or what you learned.",
    stack: ["Tech one", "Tech two", "Tech three", "Tech four"],
    links: [
      { label: "Live site", href: "#" },
      { label: "Source code", href: "#" },
    ],
    accent: "var(--project-one)",
  },
  {
    id: "project-two",
    title: "Project two",
    meta: "Year · Type of project",
    summary: "Two sentences on this project: the problem it solves and what you built.",
    stack: ["Tech one", "Tech two", "Tech three"],
    links: [
      { label: "Live site", href: "#" },
      { label: "Source code", href: "#" },
    ],
    accent: "var(--project-two)",
  },
  {
    id: "project-three",
    title: "Project three",
    meta: "Year · Type of project",
    summary: "Two sentences on this project: the problem it solves and what you built.",
    stack: ["Tech one", "Tech two", "Tech three"],
    links: [
      { label: "Live site", href: "#" },
      { label: "Source code", href: "#" },
    ],
    accent: "var(--project-three)",
  },
];
