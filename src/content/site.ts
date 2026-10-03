/**
 * Site-wide links. The sticky nav uses all of them; the footer shares the
 * résumé link, so it only needs updating here.
 */

export type NavLink = { label: string; href: string };

export const site = {
  owner: "Hani",
  /** Sections in page order; each href is the section's id */
  nav: [
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ] satisfies NavLink[],
  resume: { label: "Résumé", href: "/Hani_CV.pdf" } satisfies NavLink,
};
