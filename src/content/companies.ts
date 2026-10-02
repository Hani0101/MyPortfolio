export type Company = {
  id: string;
  name: string;
  /** Where the list item links to; anchors in the future Experience section. */
  href: string;
  /** Big word knocked out of the hover object. Keep it short (<= 10 chars). */
  keyword: string;
  /** Theme color, always a token from tokens.css. */
  accent: string;
  /**
   * Logo in /public/logos (width/height = the SVG viewBox ratio). Leave undefined
   * for text-only companies.
   * - "mark": a symbol shown in full color before the name (BMW roundel)
   * - "wordmark": replaces the name and is tinted with the text color via CSS
   *   mask, so white or light logos still show on the light background
   */
  logo?: { src: string; width: number; height: number; kind: "mark" | "wordmark"; /** size tweak, 1 = 0.8em */ scale?: number };
  role?: string;
  period?: string;
};

// TODO: fill in role/period and swap keywords for what you did there.
export const companies: Company[] = [
  {
    id: "bmw",
    name: "BMW",
    href: "#experience-bmw",
    keyword: "Logistics",
    accent: "var(--company-bmw)",
    logo: { src: "/logos/BMW_logo_(gray).svg", width: 1, height: 1, kind: "mark" },
    role: "Software Engineering Intern",
    period: "Sep 2025 – Feb 2026",
  },
  {
    id: "cybermeshwork",
    name: "Cybermeshwork",
    href: "#experience-cybermeshwork",
    keyword: "CMW",
    accent: "var(--company-cybermeshwork)",
    role: "Software Engineer",
    period: "Jul 2026 – Present",
  },
  {
    id: "ids",
    name: "IDS",
    href: "#experience-ids",
    keyword: "IDS",
    accent: "var(--company-ids)",
    logo: { src: "/logos/ids-white.svg", width: 89.27, height: 29.38, kind: "wordmark" },
    // TODO: placeholder, replace
    role: "Role title",
    period: "Start – End",
  },
  {
    id: "inmind",
    name: "inmind.ai",
    href: "#experience-inmind",
    keyword: "inmind",
    accent: "var(--company-inmind)",
    // Lowercase wordmark reads small next to the caps logos
    logo: { src: "/logos/inmind-logo.svg", width: 626.67, height: 160.26, kind: "wordmark", scale: 1.25 },
    // TODO: placeholder, replace
    role: "Role title",
    period: "Start – End",
  },
  {
    id: "geek-express",
    name: "Geek Express",
    href: "#experience-geek-express",
    keyword: "Geek",
    accent: "var(--company-geek-express)",
    // TODO: placeholder, replace
    role: "Role title",
    period: "Start – End",
  },
];
