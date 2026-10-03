/**
 * Site-wide links. The sticky nav uses all of them; the footer shares the
 * résumé link, so it only needs updating here.
 */

export type NavLink = { label: string; href: string };

// TODO: placeholder résumé link, point it at your PDF (for example /resume.pdf in /public).
export const site = {
  owner: "Hani",
  /** Sections in page order; each href is the section's id */
  nav: [
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ] satisfies NavLink[],
  resume: { label: "Résumé", href: "#" } satisfies NavLink,
};
