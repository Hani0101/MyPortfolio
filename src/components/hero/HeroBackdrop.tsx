"use client";

import { useScroll, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { memo, type CSSProperties, type ReactNode, type RefObject } from "react";
import { DotGrid } from "./DotGrid";
import type { PointerTarget } from "./HoverObject";

/*
 * Three depth layers, consistent signals:
 *   far   moves least, softest, faintest  (blobs, grain, dot grid)
 *   mid   moderate, crisp thin lines      (rings, crosses)
 *   near  moves most, sparse, over text   (dust specks, see HeroForeground)
 *
 * Scroll: y is relative to the content, which scrolls at speed 1. A positive
 * y lags behind the content (feels farther), a negative y outruns it (nearer).
 * Pointer: layers shift away from the cursor, nearer ones further.
 */

export type Pointer = { x: MotionValue<number>; y: MotionValue<number> };

type LayerProps = {
  heroRef: RefObject<HTMLElement | null>;
  pointer: Pointer;
  animate: boolean;
  /** Idle float on. Turned off on weak devices (see useFrameBudget). */
  idle: boolean;
  /** Hero on screen. Off screen nothing moves, so the layers give up their GPU memory. */
  inView: boolean;
};

type Depth = { scroll: number; drift: number };

const FAR: Depth = { scroll: 260, drift: 6 };
const GRID: Depth = { scroll: 150, drift: 10 };
const MID: Depth = { scroll: 80, drift: 18 };
const NEAR: Depth = { scroll: -180, drift: 34 };

const MID_TILT = 6; // degrees toward the cursor at the hero edge

/**
 * Applies scroll + pointer parallax for one depth. The style stays bound to the
 * same motion values whether or not motion is allowed, so turning it on after
 * hydration (or off later) never needs a remount: off, they just rest at 0.
 */
function Parallax({
  progress,
  pointer,
  depth,
  speed = 1,
  tilt = 0,
  animate,
  inView,
  className,
  children,
}: {
  progress: MotionValue<number>;
  pointer: Pointer;
  depth: Depth;
  speed?: number;
  tilt?: number;
  animate: boolean;
  inView: boolean;
  className: string;
  children?: ReactNode;
}) {
  // A transform only subscribes to the values it reads, so at rest it follows nothing
  const y = useTransform(() => (animate ? progress.get() * depth.scroll * speed - pointer.y.get() * depth.drift : 0));
  const x = useTransform(() => (animate ? -pointer.x.get() * depth.drift : 0));
  const rotate = useTransform(() => (animate && tilt ? pointer.x.get() * tilt : 0));

  return (
    // will-change: own GPU layer, so moving masked blobs and big rings never repaints.
    // Only while the hero is on screen; past it nothing moves and the layer can go.
    <m.div style={{ x, y, rotate, willChange: animate && inView ? "transform" : "auto" }} className={className}>
      {children}
    </m.div>
  );
}

function Float({ animate, kind = "float", duration, delay, children }: {
  animate: boolean;
  kind?: "float" | "drift";
  duration: number;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div
      className={animate ? `size-full hero-${kind}` : "size-full"}
      style={{ "--float-duration": `${duration}s`, "--float-delay": `${-delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- shapes

// Geometric only: rings and registration-style crosses. No code symbols, which
// read as generic developer decoration rather than part of this design.
type ShapeKind = "ring" | "cross";

const CROSS = { viewBox: "0 0 20 20", d: "M10 2V18M2 10H18" };

function Shape({ kind }: { kind: ShapeKind }) {
  if (kind === "ring") return <div className="hero-ring size-full" />;
  return (
    <svg viewBox={CROSS.viewBox} className="size-full overflow-visible" fill="none">
      <path d={CROSS.d} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Positioned around the edges, away from the text columns. Mobile keeps the
// two big rings and one cross in the corners; the rest are desktop only.
const MID_SHAPES: { kind: ShapeKind; className: string; speed: number; float: number; delay: number }[] = [
  { kind: "ring", className: "-right-[11rem] -top-[9rem] size-[20rem] lg:-right-[6rem] lg:-top-[10rem] lg:size-[36rem]", speed: 0.8, float: 16, delay: 0 },
  { kind: "ring", className: "-bottom-[14rem] -left-[10rem] size-[28rem]", speed: 1.2, float: 18, delay: 6 },
  { kind: "cross", className: "bottom-[6%] right-[6%] size-4", speed: 0.9, float: 8, delay: 4 },
  { kind: "cross", className: "hidden lg:block left-[4%] top-[16%] size-5", speed: 0.7, float: 11, delay: 5 },
  { kind: "ring", className: "hidden lg:block left-[46%] top-[9%] size-8", speed: 1.4, float: 8, delay: 2.5 },
];

const SPECKS: { className: string; speed: number; float: number; delay: number }[] = [
  { className: "left-[8%] top-[40%] size-1.5", speed: 0.8, float: 14, delay: 0 },
  { className: "left-[38%] top-[8%] size-1", speed: 1.2, float: 18, delay: 5 },
  { className: "left-[52%] top-[30%] size-1.5", speed: 1, float: 16, delay: 9 },
  { className: "left-[18%] top-[62%] size-1", speed: 1.3, float: 20, delay: 3 },
  { className: "left-[90%] top-[20%] size-1", speed: 0.9, float: 15, delay: 7 },
  { className: "left-[70%] top-[86%] size-1.5", speed: 1.1, float: 17, delay: 11 },
];

// ---------------------------------------------------------------- layers

type BackdropProps = LayerProps & {
  cursorRef: RefObject<PointerTarget>;
  interactive: boolean;
};

/** Far and mid layers, behind the content. Memoized: hovering a company changes the theme, not these. */
export const HeroBackdrop = memo(function HeroBackdrop({ heroRef, pointer, animate, idle, inView, cursorRef, interactive }: BackdropProps) {
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const layer = { progress: scrollYProgress, pointer, animate, inView };

  return (
    // Fades out toward the bottom, so the grain and blobs never end in a line where the experience section starts
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    >
      {/* Far */}
      <Parallax {...layer} depth={FAR} className="absolute -right-[12rem] top-[55%] size-[28rem] lg:-right-[10rem] lg:top-[35%] lg:size-[44rem]">
        <Float animate={animate && idle} duration={22} delay={0}>
          <div className="hero-blob size-full" />
        </Float>
      </Parallax>
      <Parallax {...layer} depth={FAR} speed={0.8} className="absolute -bottom-[8rem] -left-[10rem] size-[24rem] lg:-bottom-[12rem] lg:-left-[14rem] lg:size-[40rem]">
        <Float animate={animate && idle} duration={26} delay={8}>
          <div className="hero-blob size-full" />
        </Float>
      </Parallax>
      <div className="hero-grain absolute inset-0" />

      <Parallax {...layer} depth={GRID} className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
        <DotGrid heroRef={heroRef} cursorRef={cursorRef} interactive={interactive} inView={inView} />
      </Parallax>

      {/* Mid */}
      {MID_SHAPES.map((shape, i) => (
        <Parallax
          key={i}
          {...layer}
          depth={MID}
          speed={shape.speed}
          tilt={MID_TILT}
          className={`hero-line absolute ${shape.className}`}
        >
          <Float animate={animate && idle} duration={shape.float} delay={shape.delay}>
            <Shape kind={shape.kind} />
          </Float>
        </Parallax>
      ))}
    </div>
  );
});

/** Near layer: a few faint specks drifting in front of the content. Memoized like the backdrop. */
export const HeroForeground = memo(function HeroForeground({ heroRef, pointer, animate, idle, inView }: LayerProps) {
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const layer = { progress: scrollYProgress, pointer, animate, inView };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {SPECKS.map((speck, i) => (
        <Parallax key={i} {...layer} depth={NEAR} speed={speck.speed} className={`absolute ${speck.className}`}>
          <Float animate={animate && idle} kind="drift" duration={speck.float} delay={speck.delay}>
            <div className="hero-speck size-full" />
          </Float>
        </Parallax>
      ))}
    </div>
  );
});
