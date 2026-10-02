"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import type { StoryStep, StoryVisual } from "@/content/experiences";
import type { ModelScene, SceneColors } from "./modelScene";

// Always read, on top of the visual's own material colors
const BASE_TOKENS: SceneColors = { accent: "--accent-color", shadow: "--story-model-shadow" };
const STATIC_ORBIT = 0.5; // reduced motion: one fixed camera angle

type Props = {
  /** Key of this visual in the story; steps pick it with scene.visual */
  id: string;
  visual: StoryVisual;
  steps: StoryStep[];
  activeStep: number;
  /** Where each step starts, as a share of the steps' total height (0..1) */
  stepStarts: number[];
  /** Scroll progress through the story's steps, 0..1 */
  progress: MotionValue<number>;
  animate: boolean;
};

export function ModelVisual({ id, visual, steps, activeStep, stepStarts, progress, animate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probesRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<ModelScene | null>(null);
  const [ready, setReady] = useState(false);

  const { src, ghost, hide, camera, enter, light } = visual;
  const tokens = useMemo(() => ({ ...visual.colors, ...BASE_TOKENS }), [visual.colors]);
  const onStage = steps[activeStep]?.scene?.visual === id;

  // Stable string key, so the scene only reloads when the groups really change
  const animatedKey = useMemo(
    () => [...new Set(steps.flatMap((step) => (step.scene?.visual === id && step.scene.show) || []))].join(","),
    [steps, id],
  );

  const readColors = useCallback(() => {
    const probes = probesRef.current?.children;
    if (!probes) return null;
    return Object.fromEntries(Object.keys(tokens).map((key, i) => [key, getComputedStyle(probes[i]).color]));
  }, [tokens]);

  // Scroll position to animation time: the step at the center line, and how far through it
  const syncTime = useCallback(
    (value: number, instant: boolean) => {
      const scene = sceneRef.current;
      if (!scene) return;
      let index = 0;
      while (index < stepStarts.length - 1 && value >= stepStarts[index + 1]) index++;
      const frame = steps[index]?.scene;
      if (frame?.visual !== id || !frame.time) return;
      const start = stepStarts[index] ?? 0;
      const end = stepStarts[index + 1] ?? 1;
      const local = animate ? Math.min(1, Math.max(0, (value - start) / (end - start || 1))) : 1;
      scene.setTime(frame.time[0] + (frame.time[1] - frame.time[0]) * local, instant);
    },
    [steps, stepStarts, id, animate],
  );

  // Load Three.js and the model only when the story is about a screen away
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    let scene: ModelScene | null = null;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const { createModelScene } = await import("./modelScene");
          if (disposed) return;
          const animated = animatedKey ? animatedKey.split(",") : [];
          scene = await createModelScene({ canvas, src, animated, ghost, hide, camera, enter, light });
        } catch {
          return; // no WebGL or the model failed: the stage words still work
        }
        if (disposed) return scene.dispose();
        sceneRef.current = scene;
        setReady(true);
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(wrap);

    return () => {
      disposed = true;
      observer.disconnect();
      scene?.dispose();
      sceneRef.current = null;
      setReady(false);
    };
  }, [src, ghost, hide, camera, enter, light, animatedKey]);

  // First paint after loading: colors and size
  useEffect(() => {
    const scene = sceneRef.current;
    const wrap = wrapRef.current;
    if (!ready || !scene || !wrap) return;

    const colors = readColors();
    if (colors) scene.setColors(colors, true);
    const resize = () => scene.resize(wrap.clientWidth, wrap.clientHeight);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [ready, readColors]);

  // Step changes: groups drop in or lift out (instantly under reduced motion).
  // Off stage, the last state is kept; coming back on stage jumps to the current one.
  const wasOnStage = useRef(false);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!ready || !scene) return;
    const arriving = onStage && !wasOnStage.current;
    wasOnStage.current = onStage;
    if (!onStage) return;

    const frame = steps[activeStep]?.scene ?? { visual: id };
    scene.setState(frame, !animate || arriving);
    scene.setOrbit(animate ? progress.get() : STATIC_ORBIT, !animate || arriving);
    syncTime(progress.get(), !animate || arriving);
  }, [ready, onStage, steps, activeStep, animate, id, progress, syncTime]);

  // Scroll swings the camera and scrubs the animation; a motion value, so
  // React never re-renders for it. Off stage, nothing renders.
  useMotionValueEvent(progress, "change", (value) => {
    if (!onStage || !animate) return;
    sceneRef.current?.setOrbit(value, false);
    syncTime(value, false);
  });

  // Theme crossfades: follow the probes' color transition to its end
  useEffect(() => {
    const probes = probesRef.current;
    if (!ready || !probes) return;
    const sync = () => {
      const colors = readColors();
      if (colors) sceneRef.current?.setColors(colors, false);
    };
    probes.addEventListener("transitionend", sync);
    probes.addEventListener("transitioncancel", sync);
    sync();
    return () => {
      probes.removeEventListener("transitionend", sync);
      probes.removeEventListener("transitioncancel", sync);
    };
  }, [ready, readColors]);

  return (
    <div ref={wrapRef} className="story-model relative aspect-[16/10] w-full">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" data-ready={ready} />
      <span ref={probesRef} className="story-model-probes">
        {Object.values(tokens).map((token, i) => (
          <span key={i} style={{ color: `var(${token})` } as CSSProperties} />
        ))}
      </span>
    </div>
  );
}
