/**
 * Footer. It is also the page's contact section: the hero's "Get in touch"
 * button links to its `#contact` anchor.
 */

import { site } from "./site";

export type FooterLink = { label: string; href: string };

// TODO: placeholder email and profile links, replace with your own.
export const footer = {
  eyebrow: "Contact",
  title: "Let's build something together.",
  lead: "Have a role, a project or just a question? My inbox is open, and I usually reply within a couple of days.",
  email: "hello@example.com",
  emailCta: "Email me",
  /** Next to the email button: the other thing a hiring manager looks for */
  resumeCta: { label: "Download résumé", href: site.resume.href },
  sections: [
    {
      title: "On this page",
      links: [
        { label: "Experience", href: "#experience" },
        { label: "Projects", href: "#projects" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Elsewhere",
      links: [
        { label: "GitHub", href: "#" },
        { label: "LinkedIn", href: "#" },
        { label: "Résumé (PDF)", href: site.resume.href },
      ],
    },
  ] satisfies { title: string; links: FooterLink[] }[],
  owner: "Hani",
  backToTop: "Back to top",
};
