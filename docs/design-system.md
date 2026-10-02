# Design System

Soft, professional and welcoming. Single light theme.

## Files

| File | Role |
|------|------|
| `src/styles/tokens.css` | Source of truth: primitive, semantic and component tokens |
| `src/styles/globals.css` | Tailwind v4 entry: maps semantic tokens to utilities and sets base styles |
| `src/lib/fonts.ts` | `next/font` loaders for Playfair Display (local) and Inter (Google) |
| `src/fonts/` | Playfair Display variable fonts and their OFL license |

## Setup (Next.js App Router)

```tsx
// src/app/layout.tsx
import "@/styles/globals.css";
import { fontVariables } from "@/lib/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
```

## Rules

1. Components use **semantic utilities** (`bg-surface`, `text-muted`) or **component tokens** (`var(--card-bg)`). Primitives (`--violet-600`) are never referenced outside `tokens.css`.
2. Tailwind's default color palette is disabled (`--color-*: initial`), so `bg-white` or `text-gray-500` will not compile. To add a color, add a primitive, alias it semantically, then map it in `@theme`.
3. `border` (#988686) is for decorative dividers only. Inputs and controls use `border-strong` so they meet the 3:1 non-text contrast requirement.

## Tokens

### Color

| Utility | Token | Value | Use | Contrast on bg |
|---------|-------|-------|-----|----------------|
| `bg-background` | `--bg` | #D1D0D0 | Page background | — |
| `bg-surface` | `--surface` | #E4E3E3 | Cards, nav, raised areas | — |
| `text-foreground` | `--fg` | #000000 | Primary text | 13.64 |
| `text-muted` | `--fg-muted` | #4F4545 | Secondary text, metadata | 6.01 |
| `bg-accent` / `text-accent` | `--accent` | #5B4B8A | Primary actions, links | 4.84 |
| `bg-accent-hover` | `--accent-hover` | #4A3B78 | Hover/pressed accent | 6.24 |
| `text-on-accent` | `--accent-fg` | #FFFFFF | Text on accent | 7.45 on accent |
| `bg-accent-subtle` | `--accent-subtle` | #DDD8EB | Tag chips, selection *(derived)* | — |
| `border-border` | `--border` | #988686 | Dividers | 2.24 (decorative) |
| `border-border-strong` | `--border-strong` | #6F6262 | Inputs, outline buttons *(derived)* | 3.79 |
| `text-danger` | `--danger` | #9B2C2C | Form errors *(derived)* | 4.89 |
| `text-success` | `--success` | #275A35 | Form success *(derived)* | 5.25 |

*Derived* colors were added to fill gaps in the brand palette. All text pairs meet WCAG AA, and every pair also passes on `surface`.

### Typography

| Utility | Font | Size | Use |
|---------|------|------|-----|
| `text-display` | Playfair Display | 44 to 80px fluid | Hero name / headline |
| `text-h1` | Playfair Display | 36 to 56px | Page titles |
| `text-h2` | Playfair Display | 28 to 40px | Section titles (About, Projects, Experience) |
| `text-h3` | Playfair Display | 20 to 26px | Card titles, job roles |
| `text-lead` | Inter | 18 to 21px | Intro paragraph under the hero |
| `text-base` / `text-sm` | Inter | 16 / 14px | Body, metadata |

`h1` to `h4` automatically use `font-heading` at weight 600. Body defaults to Inter (`font-sans`).

### Layout, shape, elevation, motion

| Utility | Value |
|---------|-------|
| `max-w-content` / `max-w-prose` | 72rem / 42rem |
| `px-gutter` | 16 to 32px fluid |
| `py-section` | 64 to 128px fluid |
| `rounded-control` / `rounded-card` / `rounded-pill` | 10px / 16px / full |
| `shadow-soft` / `shadow-raised` / `shadow-lifted` | Warm, taupe-tinted elevations 1 to 3 |
| `ease-standard` / `ease-emphasized` | Default curve / slight overshoot for reveals |

## Component specs

### Button (primary)

| Property | Default | Hover | Active | Focus | Disabled |
|----------|---------|-------|--------|-------|----------|
| Background | `--button-bg` | `--button-bg-hover` | `--button-bg-hover` | `--button-bg` | `--button-bg` at 50% opacity |
| Text | `--button-fg` | same | same | same | same |
| Shadow | `--button-shadow` | `--button-shadow-hover` | none | `--button-shadow` | none |
| Transform | none | translateY(-1px) | translateY(0) | none | none |
| Outline | none | none | none | 2px `--ring`, 3px offset | none |

Shape: `rounded-pill`, padding 12 x 24px, Inter 500.

### Button (secondary)

Transparent background, 1px `--button-secondary-border`, text `--fg`. On hover the background becomes `--surface`.

### Card (project / experience)

| Property | Default | Hover (if linked) |
|----------|---------|-------------------|
| Background | `--card-bg` | same |
| Border | 1px `--card-border` | same |
| Shadow | `--card-shadow` | `--card-shadow-hover` |
| Transform | none | translateY(-4px), `--transition-base` |

Radius `rounded-card`, padding `--card-padding`. The title is `text-h3`, the description is `text-muted`.

### Tag (tech stack)

`bg-accent-subtle text-accent rounded-pill`, padding 4 x 12px, `text-sm` at weight 500. Tags are not interactive.

### Input (contact form)

| Property | Default | Focus | Error | Disabled |
|----------|---------|-------|-------|----------|
| Border | 1px `--input-border` | 1px `--input-border-focus` + ring | 1px `--input-border-error` | `--border` |
| Background | `--input-bg` | same | same | `--bg` |
| Helper text | `text-muted` | same | `text-danger` | `text-muted` |

### Nav

Sticky header `--nav-height` (64px), background `--nav-bg` with `backdrop-blur`. Links use `--nav-link-fg`, darken to `--nav-link-fg-hover` on hover, and use `--nav-link-fg-active` with `aria-current="page"` for the active section.

### Hero (company theming)

`useCompanyTheme` (`src/lib`) is the only code that writes `--accent-color`, on the hero (hover) and on the experience section (scroll). Everything in the hero derives its color from it: the background tint, the backdrop layers, the hover object and the active company name. All of them share `--theme-duration` / `--theme-ease`, so they change together.

| Token | Value | Why |
|-------|-------|-----|
| `--company-*` | `--blue-800`, `--teal-800`, `--wine-800`, `--rust-800` | Darkened so names stay at 4.1:1 or above as large text |
| `--company-inmind` | `--blue-500` (#2953F6) | inmind.ai brand blue. Its logo is shown instead of text and logos are exempt from WCAG contrast, so it sits at 3.45:1 on the tinted hero |
| `--hero-tint` | 3% | Base accent tint. Kept low because muted text has little headroom; the blobs carry the color instead |
| `--hero-shape-opacity` | 0.12 | Caps the hover object |

### Hero backdrop (parallax layers)

Three layers with consistent depth cues: farther layers move less, look softer and are fainter.

| Layer | Contents | Scroll / cursor movement | Tokens |
|-------|----------|--------------------------|--------|
| Far | 2 soft blobs (radial mask, no blur filter), static grain | Lags the content by 260px; shifts 6px with the cursor | `--hero-blob-mix` 14%, `--hero-grain-opacity` 0.3 |
| Far/mid | Dot grid on one canvas; dots near the cursor push away and grow | 150px / 10px | `--hero-dot-alpha` 0.2, `--hero-dot-alpha-max` 0.55 |
| Mid | 8 thin shapes: rings, crosses, `{ }`, `</>`, ✓ (tilt toward the cursor, idle float) | 80px / 18px, ±6° tilt | `--hero-ring-mix` 28% |
| Mid | 3 concentric rings behind the name that ripple on company change (desktop only) | Move with the name | `--hero-ripple-mix` 20% |
| Near | 6 dust specks drifting in front of the content | Outruns the content by 180px; shifts 34px with the cursor | `--hero-speck-mix` 30% |

Rules this follows:

- **Text contrast.** It is checked on rendered pixels, not only on paper. Muted text stays at 4.5:1 or above (5th percentile of the pixels behind it) in every hover state, including with the hover object dragged next to the text. Fills stay away from text, and only thin lines may cross it.
- **Reduced motion.** Nothing moves, but the composition and theme colors stay.
- **Touch devices.** Scroll parallax and idle float only. There is no cursor effect and no hover object.
- **Weak devices.** `useFrameBudget` watches frame times. If the median drops below about 40fps, it turns off idle float, cursor parallax and dot repel for that visit. Scroll parallax, themes and the hover object stay.

To add a company: add a primitive, add a `--company-<id>` alias, then add an entry to `src/content/companies.ts`. Then re-run the pixel contrast check in every hover state.


### Experience stories (scrollytelling)

Each experience is a list of scrolling steps, rendered by one generic `ExperienceStory` from data in `src/content/experiences.ts`. All stories share one pinned stage (`StoryStage`): each story has a layer in it (word, visual, step counter), and the layers crossfade when the next story reaches the center, so the stage never unpins between stories. Name, logo, role, period, anchor and theme come from `src/content/companies.ts`, matched by `companyId`, so the hero list and the story always agree. To add a story, add an entry to `experiences`; no new component is needed.

Roles without a story go in `earlierRoles`: one compact row each after the stories (name, role and period, one-line summary, stack chips). Each row is its company's anchor and is tinted by its own `--role-accent`, never `--accent-color`.

Every story uses the same template: arrival, context, what I did (2 or 3 steps), result, then stack and takeaway. Keep each step to 1 to 3 lines. Consecutive steps with the same label are numbered automatically ("What I did · 1/3").

| Piece | Behavior |
|-------|----------|
| Theme takeover | The section calls `useCompanyTheme` on its own root. The story crossing the center of the screen activates its company, and the background and accents crossfade with `--theme-duration`. |
| Active step | One `IntersectionObserver` per story, with a thin band at the vertical center. This changes only a few times per story, so it lives in state. A jump past a story (hero link, End key) settles it on its first or last step from its scroll progress. |
| Progress line | A static track plus a fill driven by `useScroll` (a motion value, so no re-renders). Each step has a dot that fills as it is reached. |
| Stage | Pinned. On desktop it has its own column; on phones it is pinned above the active step. A faded word per step crossfades in place, with an `01 / 07` counter on desktop. Experience-specific visuals go in the stage slot. |
| Result numbers | A `result` step with `stats` shows up to three numbers that count up when the step arrives, with an accent rule above each. Use a `~` prefix for approximate values. Screen readers get the final value once, and the server HTML and reduced motion show the final numbers. |
| Stack chips | Pop in one by one when the stack step arrives (`--story-chip-stagger`). |
| 3D stage (optional) | `visuals` on an experience: named models, each with its own colors and camera. Each step's `scene.visual` picks which one is on stage, and the stage crossfades between them; a step without a scene shows only the stage word. Three.js and the models load only when the story is about a screen away, and only the visual on stage renders. A scene can drop groups in and out (`show`, highlighted ones turn `--accent-color`) or scrub the model's baked animation with scroll (`time`, in seconds, from the step's start to its end). On phones the stage word gives way to the visual, and step text gets a backdrop in the section color so it stays readable where it passes over the visual. |

Rules:

- **Contrast.** Company accents are used only for lines, dots, chip outlines and the decorative stage, never for small text. The inmind.ai blue is below 4.5:1, and this keeps every company safe. Chip text stays `--fg`.
- **Seamless boundary.** `--story-tint` equals `--hero-tint` and the default accent is the same, so there is no seam where the hero ends.
- **Reduced motion.** No fill animation and no chip pop-in (the chips are always visible). The theme, dots and stage word still follow the scroll but switch instantly. The server HTML is this static layout.
- **No scroll-jacking.** Everything is `position: sticky` and native scrolling.
- **3D models.** Export from Blender to `assets/models/` (top-level empties for groups that come and go, or one baked animation to scrub). Then run `npm run models` to write meshopt-compressed copies of every model to `public/models/`. Colors come from tokens, mapped per Blender material name in the visual's `colors`, never from the file. `hide` drops nodes such as a floor plane. Pieces drop in from above by default; `enter: "front"` lands them on a surface facing the camera instead, in reading order (for screens and cards). Scroll may scrub progress (assembly, flips, the camera) but never oscillation such as a wobble, which speeds up, freezes or reverses with the scroll. Under reduced motion, steps switch instantly and the camera is fixed. Without WebGL, the stage words remain.

## Example

```tsx
<article className="rounded-card border border-border bg-surface p-[var(--card-padding)] shadow-soft
                    transition-[translate,box-shadow] duration-250 ease-standard
                    hover:-translate-y-1 hover:shadow-lifted">
  <h3 className="text-h3">Project name</h3>
  <p className="mt-2 text-muted">One-line description of the problem and outcome.</p>
  <ul className="mt-4 flex flex-wrap gap-2">
    <li className="rounded-pill bg-accent-subtle px-3 py-1 text-sm font-medium text-accent">React</li>
  </ul>
</article>
```
