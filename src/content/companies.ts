export type Company = {
  id: string;
  name: string;
  /** Where the list item links to; anchors in the future Experience section. */
  href: string;
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

// TODO: fill in role/period.
export const companies: Company[] = [
  {
    id: "bmw",
    name: "BMW",
    href: "#experience-bmw",
    accent: "var(--company-bmw)",
    logo: { src: "/logos/BMW_logo_(gray).svg", width: 1, height: 1, kind: "mark" },
    role: "Software Engineering Intern",
    period: "Sep 2025 – Feb 2026",
  },
  {
    id: "cybermeshwork",
    name: "Cybermeshwork",
    href: "#experience-cybermeshwork",
    accent: "var(--company-cybermeshwork)",
    role: "Software Engineer",
    period: "Jul 2026 – Present",
  },
  {
    id: "ids",
    name: "IDS",
    href: "#experience-ids",
    accent: "var(--company-ids)",
    logo: { src: "/logos/ids-white.svg", width: 89.27, height: 29.38, kind: "wordmark" },
    role: "Software Engineering Intern",
    period: "Dec 2024 – Jan 2025",
  },
  {
    id: "inmind",
    name: "inmind.ai",
    href: "#experience-inmind",
    accent: "var(--company-inmind)",
    logo: { src: "/logos/inmind-logo.svg", width: 626.67, height: 160.26, kind: "wordmark", scale: 1.25 },
    role: "Software Engineering Intern",
    period: "Feb 2025 – Mar 2025",
  },
  {
    id: "geek-express",
    name: "Geek Express",
    href: "#experience-geek-express",
    accent: "var(--company-geek-express)",
    role: "Coding Tutor",
    period: "Nov 2022 – Sep 2025",
  },
];
