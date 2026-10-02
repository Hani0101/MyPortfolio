import type { Project } from "@/content/projects";

/** Small pieces of the projects showcase */
export const LABEL = "text-sm font-medium uppercase tracking-[0.2em] text-muted";

/** Tag spec by default; the showcase passes chips tinted by the selected project instead */
const TAG = "bg-accent-subtle text-accent";

export function ProjectStack({ stack, tone = TAG }: { stack: string[]; tone?: string }) {
  return (
    <ul aria-label="Tech stack" className="mt-5 flex flex-wrap gap-2">
      {stack.map((item) => (
        <li key={item} className={`rounded-pill px-3 py-1 text-sm font-medium ${tone}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ProjectLinks({ links, className = "" }: { links: Project["links"]; className?: string }) {
  if (!links.length) return null;
  return (
    <p className={`flex flex-wrap gap-x-6 gap-y-2 pt-6 font-medium ${className}`}>
      {links.map((link) => (
        <a key={link.label} href={link.href}>
          {link.label} <span aria-hidden>↗</span>
        </a>
      ))}
    </p>
  );
}
