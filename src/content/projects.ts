/**
 * Projects showcase: every project is shown at once, each in a browser window
 * tinted by its accent. Put media files in /public/projects.
 */

export type ProjectMedia =
  | { kind: "image"; src: string; alt: string; width: number; height: number }
  /** Muted and looping; under reduced motion only the poster shows. `label` describes the clip. */
  | { kind: "video"; src: string; poster?: string; label: string }
  /** A YouTube embed; `id` is the part after youtu.be/. `label` is the iframe title. */
  | { kind: "youtube"; id: string; label: string };

export type Project = {
  id: string;
  title: string;
  /** Small line above the title, such as "2026 · Web app" */
  meta: string;
  /** Two or three sentences: the problem, what you built, the result */
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** One or more items (several show as tabs); leave out to show a placeholder until the file is ready */
  media?: ProjectMedia[];
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
    title: "Achilles Ecommerce",
    meta: "2022 · Ecommerce Website",
    summary:
      "The following project includes a Wireframe, Mockup and a functional ecommerce website (No payment gateway integration). The project has features like guards to protect pages from unauthrized users, and it has a full support for categories, cart and checkout pages.",
    stack: ["Angular", "Figma", "SCSS", ".NET", "Docker", "Github Actions", "Service Workers", "PWA", "Responsive Design"],
    links: [
      { label: "Source code", href: "https://github.com/Hani0101/ecommerce-inmind/tree/development" },
    ],
    media: [
      { kind: "video", src: "/project_videos/Ecommerce.mp4", label: "Walkthrough of the e-commerce site" },
      { kind: "image", src: "/project_images/ecom_mockup.png", alt: "Final mockup of the e-commerce site", width: 2880, height: 6164 },
      { kind: "image", src: "/project_images/ecom-wireframe.png", alt: "Wireframe of the e-commerce site", width: 4096, height: 5238 },
    ],
    accent: "var(--project-one)",
  },
  {
    id: "project-two",
    title: "Lora and Debiasing",
    meta: "2026 · Research Project",
    summary: "The following project is a research project that explores the use of Lora and Debiasing in the context of machine learning. The project is a proof of concept that shows how Lora and Debiasing can be used to improve the performance of machine learning models.",
    stack: ["Python", "Pytorch", "Transformers", "Fine Tuning", "LLMs"],
    links: [
      { label: "Source code", href: "https://github.com/Hani0101/Lora-fairness" },
    ],
    media: [{ kind: "youtube", id: "okFQIKKUwFQ", label: "Project two demo video" }],
    accent: "var(--project-two)",
  },
  {
    id: "project-three",
    title: "Truck Loading Simulator",
    meta: "2025 · 3D visualizer",
    summary: "The project allows users to load trucks using island Genetic Algorithm, Bin packing algorithm and Max rects algorithm. The project also includes a 3D visualizer that shows the truck and the items inside it.",
    stack: ["Angular", "Fast API", "Three.js", "Web Workers"],
    links: [
      { label: "Source code", href: "https://github.com/Hani0101/Logistics-Truck-Loading" },
    ],
    media: [{ kind: "video", src: "/project_videos/truck_loading.mp4", label: "Truck loading demo" }],
    accent: "var(--project-three)",
  },
];
