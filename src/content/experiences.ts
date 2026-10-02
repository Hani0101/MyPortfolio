/**
 * Scrollytelling content. Each experience is one story rendered by the
 * generic ExperienceStory component; adding a company means adding data here.
 *
 * Name, logo, role, period and theme come from companies.ts (matched by
 * companyId), so the hero list and the story never disagree.
 *
 * Template, same for every story: arrival, context, what I did (2 or 3),
 * result, stack and takeaway. Keep each step to 1 to 3 lines.
 */

/** What the stage shows during one step */
export type SceneFrame = {
  /** Key of the story's visual on stage; steps without a scene show only the stage word */
  visual: string;
  /**
   * Groups (top-level Blender empties) shown in this step; they drop in and lift
   * out between steps. Omit to show the whole model. A group listed in no step
   * of the story is always visible.
   */
  show?: string[];
  /** Drawn in the company accent; usually the group this step adds */
  highlight?: string[];
  /** Seconds of the model's baked animation, scrubbed by scroll from the step's start to its end */
  time?: [number, number];
};

type StepBase = {
  /** Big faded word on the stage while this step is active. Keep it short (<= 9 chars). */
  word: string;
  scene?: SceneFrame;
};

export type StoryStep =
  /** Company, role and dates, taken from companies.ts */
  | (StepBase & { kind: "arrival" })
  /** Consecutive steps with the same label get numbered ("What I did · 1/3") */
  | (StepBase & { kind: "text"; label: string; title: string; body: string })
  /** Numbers count up when the step arrives. Keep them honest: prefix "~" for approximations. */
  | (StepBase & { kind: "result"; label: string; title: string; stats: Stat[] })
  | (StepBase & { kind: "stack"; label: string; items: string[]; takeaway: string });

export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

/** A 3D model pinned on the stage. Export from Blender to assets/models, then npm run models. */
export type StoryVisual = {
  kind: "model";
  /** Compressed .glb in /public/models */
  src: string;
  /** Blender material name to CSS color token; unlisted materials keep the file's color */
  colors: Record<string, string>;
  /** Meshes drawn see-through, so what's inside stays visible */
  ghost?: string[];
  /** Nodes left out, such as a floor that would show as a hard-edged square */
  hide?: string[];
  /** Degrees: the camera swings from azimuth[0] to azimuth[1] across the story */
  camera?: { azimuth: [number, number]; elevation: number };
  /** Where groups' pieces come from: "above" drops them in (default), "front" lands them on a surface facing the camera */
  enter?: "above" | "front";
  /** Key light from "above" (default, lights tops) or the "front" (lights a surface facing the camera at full color) */
  light?: "above" | "front";
};

export type Experience = {
  companyId: string;
  /** Visuals by key, picked per step with scene.visual */
  visuals?: Record<string, StoryVisual>;
  location?: string;
  intro?: string;
  steps: StoryStep[];
};

export const experienceSection = {
  title: "Experience",
  lead: "Where I've worked, what I built there and what it taught me.",
};

export const experiences: Experience[] = [
  {
    companyId: "bmw",
    location: "Germany",
    visuals: {
      truck: {
        kind: "model",
        src: "/models/truck-loading.glb",
        colors: { base: "--story-model-body", cargo: "--story-model-cargo" },
        ghost: ["trailer-walls"],
        camera: { azimuth: [55, -30], elevation: 28 },
      },
    },
    steps: [
      { kind: "arrival", word: "2025", scene: { visual: "truck", show: [] } },
      {
        kind: "text",
        word: "Logistics",
        scene: { visual: "truck", show: ["step-2"], highlight: ["step-2"] },
        label: "Context",
        title: "Software that plans how trucks get loaded",
        body: "On the logistics team I worked on internal 2D and 3D tools for truck loading. The goal was to support more ways to load a truck, with new layouts.",
      },
      {
        kind: "text",
        word: "Loading",
        scene: { visual: "truck", show: ["step-2", "step-3"], highlight: ["step-3"] },
        label: "What I did",
        title: "New ways to load",
        body: "Extended the loading algorithm so cargo can be loaded in new ways and placed along axes it didn't support before.",
      },
      {
        kind: "text",
        word: "Inventory",
        scene: { visual: "truck", show: ["step-2", "step-3", "step-4"], highlight: ["step-4"] },
        label: "What I did",
        title: "Reusable operations",
        body: "Added an inventory system so frequently used internal operations can be saved and reused when needed.",
      },
      {
        kind: "text",
        word: "Strategy",
        scene: { visual: "truck", show: ["step-2", "step-4", "step-5"], highlight: ["step-5"] },
        label: "What I did",
        title: "Code that's easier to maintain",
        body: "Refactored growing logic with the strategy pattern, and migrated three applications and their dependencies to the latest Angular.",
      },
      {
        kind: "text",
        word: "Result",
        scene: { visual: "truck", show: ["step-2", "step-4", "step-5", "step-6"], highlight: ["step-2", "step-5", "step-6"] },
        label: "Result",
        title: "More layouts, cleaner code",
        body: "The tool now handles loading layouts it couldn't before, on a codebase that's easier to extend.",
      },
      {
        kind: "stack",
        word: "Stack",
        scene: { visual: "truck", show: ["step-2", "step-4", "step-5", "step-6"] },
        label: "Stack and takeaway",
        items: ["Angular", "Three.js", ".NET"],
        takeaway: "It taught me to deliver on demand, own my work and talk about it clearly.",
      },
    ],
  },
  {
    companyId: "cybermeshwork",
    location: "Remote",
    visuals: {
      // One browser window whose content changes per step: the early page, the test
      // runner, the researched search page. Simplified, not the real product.
      card: {
        kind: "model",
        src: "/models/Cmeshcards.glb",
        colors: {
          Mat_Tile: "--story-model-body",
          Mat_Line: "--story-model-line",
          Mat_Ink: "--story-model-ink",
          Mat_Pass: "--accent-color",
          Mat_Fail: "--danger",
        },
        enter: "front",
        light: "front",
        // Nearly head-on, so the labels on the card stay readable
        camera: { azimuth: [14, -10], elevation: 12 },
      },
    },
    steps: [
      { kind: "arrival", word: "2026", scene: { visual: "card", show: [] } },
      {
        kind: "text",
        word: "Startup",
        // Half-built page, "0 tests"
        scene: { visual: "card", show: ["p_early", "badge_zero"] },
        label: "Context",
        title: "A platform still being built, with no tests",
        body: "Cybermeshwork is an early-stage startup building a digital experience platform. When I joined, it had no automated tests.",
      },
      {
        kind: "text",
        word: "Tests",
        // The window turns into the test runner: one column per project, and room for the next
        scene: { visual: "card", show: ["t_suite", "t_grow"] },
        label: "What I did",
        title: "Test infrastructure from scratch",
        body: "Built the Playwright test infrastructure and wrote the tests, split into projects that grow with the platform.",
      },
      {
        kind: "text",
        word: "Ownership",
        // A run catches a bug and becomes a ticket; runs get faster
        scene: { visual: "card", show: ["t_suite", "t_bug", "t_ticket", "t_speed"] },
        label: "What I did",
        title: "Owning quality",
        body: "I own the speed and reliability of the tests and their infrastructure, report bugs, and draft new features in Jira for the backend team.",
      },
      {
        kind: "text",
        word: "Research",
        // The window turns into the researched search page
        scene: { visual: "card", show: ["p_ux"] },
        label: "What I did",
        title: "UX research, then implementation",
        body: "Researched UX concepts and implemented them on the landing and search pages, across different verticals and business logic.",
      },
      {
        kind: "result",
        word: "Result",
        // "200+ passed" lands where "0 tests" was
        scene: { visual: "card", show: ["p_ux", "t_summary"] },
        label: "Result",
        title: "Bugs caught before users see them",
        stats: [
          { value: 200, suffix: "+", label: "automated tests across projects" },
          { value: 9, prefix: "~", suffix: "×", label: "faster runs than when first written" },
          { value: 70, prefix: "~", label: "bugs caught before release" },
        ],
      },
      {
        kind: "stack",
        word: "Stack",
        scene: { visual: "card", show: ["p_ux", "t_summary"] },
        label: "Stack and takeaway",
        items: ["Playwright", "TypeScript", "React", "i18n"],
        takeaway: "It taught me how much a product's reliability depends on its tests.",
      },
    ],
  },
];

/**
 * Roles shown as one compact row each after the stories, instead of a story.
 * Name, logo, role, period, anchor and color come from companies.ts, like the stories.
 */
export type EarlierRole = {
  companyId: string;
  /** One line: what you built and what it changed */
  summary: string;
  stack: string[];
};

export const earlierRolesSection = {
  title: "Earlier roles",
};

// TODO: placeholder copy, replace with your own
export const earlierRoles: EarlierRole[] = [
  {
    companyId: "ids",
    summary: "One line on what you built there and what it changed.",
    stack: ["Tech one", "Tech two", "Tech three"],
  },
  {
    companyId: "inmind",
    summary: "One line on what you built there and what it changed.",
    stack: ["Tech one", "Tech two", "Tech three"],
  },
  {
    companyId: "geek-express",
    summary: "One line on what you built there and what it changed.",
    stack: ["Tech one", "Tech two", "Tech three"],
  },
];
