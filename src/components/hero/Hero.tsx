"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { companies } from "@/content/companies";
import { hero } from "@/content/hero";
import { useFrameBudget } from "@/lib/useFrameBudget";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { CompanyList } from "./CompanyList";
import { HeroBackdrop, HeroForeground } from "./HeroBackdrop";
import { HoverObject, type PointerTarget } from "./HoverObject";
import { NameRipples } from "./NameRipples";
import { useCompanyTheme } from "@/lib/useCompanyTheme";

const POINTER_SPRING = { stiffness: 60, damping: 20, mass: 0.6 };

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const targetRef = useRef<PointerTarget>(null); // hover object: list cursor or focused item
  const cursorRef = useRef<PointerTarget>(null); // dot grid: cursor anywhere in the hero

  const { activeId, activate, reset } = useCompanyTheme(heroRef, companies);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const inView = useInView(heroRef);

  // false on the server and during hydration, so static HTML never carries
  // scroll transforms; turns on after hydration only if motion is allowed
  const animate = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const hoverEffects = animate && finePointer;

  // Weak device: drop the continuous extras (idle float, cursor parallax, dot
  // repel) but keep scroll parallax, themes and the hover object
  const lite = useFrameBudget(animate && inView);
  const interactive = hoverEffects && !lite;

  // Cursor position in the hero, -1..1 from the center, smoothed. Motion
  // values, not state: moving the mouse never re-renders.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointer = { x: useSpring(rawX, POINTER_SPRING), y: useSpring(rawY, POINTER_SPRING) };

  useEffect(() => {
    if (!lite) return;
    cursorRef.current = null;
    rawX.set(0);
    rawY.set(0);
  }, [lite, rawX, rawY]);

  const handlePointerMove = (e: PointerEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!interactive || e.pointerType === "touch" || !rect) return;
    cursorRef.current = { clientX: e.clientX, clientY: e.clientY };
    rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handlePointerLeave = () => {
    cursorRef.current = null;
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-title"
      className="hero relative isolate min-h-svh overflow-clip"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <HeroBackdrop
        heroRef={heroRef}
        pointer={pointer}
        animate={animate}
        idle={!lite}
        cursorRef={cursorRef}
        interactive={interactive}
        inView={inView}
      />
      <HoverObject
        activeId={activeId}
        enabled={hoverEffects}
        inView={inView}
        heroRef={heroRef}
        targetRef={targetRef}
      />

      {/* Desktop: fits one screen, both columns centered on it, so nothing is cut at the fold */}
      <div className="relative z-10 mx-auto grid min-h-svh max-w-content content-center gap-16 px-gutter pb-12 pt-[calc(var(--nav-height)+2rem)] lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="relative lg:col-span-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">{hero.eyebrow}</p>
          <div className="relative mt-4 w-fit">
            <NameRipples activeId={activeId} animate={animate} />
            <h1 id="hero-title" className="text-display">
              {hero.greeting}
            </h1>
          </div>
          <p className="mt-6 max-w-prose text-lead text-muted">{hero.lead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={hero.primaryCta.href} className="btn btn-primary">
              {hero.primaryCta.label}
            </a>
            <a href={hero.secondaryCta.href} className="btn btn-secondary">
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="mb-6 font-sans text-sm font-medium uppercase tracking-[0.2em] text-muted">
            {hero.companiesLabel}
          </h2>
          <CompanyList
            companies={companies}
            activeId={activeId}
            onActivateAction={activate}
            onResetAction={reset}
            finePointer={finePointer}
            animate={animate}
            targetRef={targetRef}
          />
        </div>
      </div>

      <HeroForeground heroRef={heroRef} pointer={pointer} animate={animate} idle={!lite} />
    </section>
  );
}
