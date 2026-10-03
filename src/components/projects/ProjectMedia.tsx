"use client";

import { useEffect, useRef } from "react";
import type { ProjectMedia as Media } from "@/content/projects";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ExpandableImage } from "./ImageLightbox";

type Props = {
  media?: Media;
  /** Corner rounding of the frame; a frame inside another frame passes "" */
  className?: string;
  /** A video pauses while false, such as a project that isn't selected */
  playing?: boolean;
};

/** A project's image or video, or a placeholder until the file is ready */
export function ProjectMedia({ media, className = "rounded-control", playing = true }: Props) {
  // false on the server and during hydration, so videos start as their poster
  const animate = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const videoRef = useRef<HTMLVideoElement>(null);
  const frame = `aspect-[16/10] w-full overflow-hidden ${className}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (animate && playing) video.play().catch(() => {}); // a blocked autoplay just leaves the poster
    else video.pause();
  }, [animate, playing]);

  if (!media) {
    return (
      <div aria-hidden className={`${frame} grid place-items-center border border-dashed border-border-strong bg-background`}>
        <span className="text-sm font-medium text-muted">Image or video</span>
      </div>
    );
  }

  if (media.kind === "image") return <ExpandableImage media={media} className={frame} />;

  if (media.kind === "youtube") {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${media.id}`}
          title={media.label}
          loading="lazy"
          allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
    );
  }

  return (
    <div className={frame}>
      <video
        ref={videoRef}
        src={media.src}
        poster={media.poster}
        aria-label={media.label}
        muted
        loop
        playsInline
        preload={animate && playing ? "auto" : "none"}
        className="size-full object-cover"
      />
    </div>
  );
}
