"use client";

import { useEffect, useRef, useState } from "react";
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

  if (media.kind === "youtube") return <YouTubeEmbed id={media.id} label={media.label} className={frame} />;

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

const thumbnail = (id: string, size: "maxresdefault" | "hqdefault") => `https://i.ytimg.com/vi/${id}/${size}.jpg`;

/**
 * A YouTube video as its thumbnail and a play button. The player itself (a
 * large script bundle per embed) only loads once it's asked for.
 */
function YouTubeEmbed({ id, label, className }: { id: string; label: string; className: string }) {
  const [started, setStarted] = useState(false);
  const [poster, setPoster] = useState(thumbnail(id, "maxresdefault"));
  const playerRef = useRef<HTMLIFrameElement>(null);

  // Not every video has the 1280px thumbnail: YouTube sends a 120px stand-in
  // instead, so fall back to the 480px one that every video has
  const fallBack = () => setPoster(thumbnail(id, "hqdefault"));

  // The button is replaced by the player, so keep keyboard focus there
  useEffect(() => {
    if (started) playerRef.current?.focus();
  }, [started]);

  if (started) {
    return (
      <div className={className}>
        <iframe
          ref={playerRef}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={label}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStarted(true)}
      aria-label={`Play video: ${label}`}
      className={`group relative block focus-visible:outline-offset-[-3px] ${className}`}
    >
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={(e) => e.currentTarget.naturalWidth <= 120 && fallBack()}
        onError={fallBack}
        className="size-full object-cover"
      />
      <span
        aria-hidden
        className="project-play absolute inset-0 m-auto grid size-16 place-items-center rounded-pill transition-transform duration-200 ease-standard group-hover:scale-110"
      >
        <PlayIcon />
      </span>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
