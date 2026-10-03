"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { ProjectMedia as Media } from "@/content/projects";

type Image = Extract<Media, { kind: "image" }>;

/** A cropped preview that opens the full image; the picture and its expand badge are one button */
export function ExpandableImage({ media, className }: { media: Image; className: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View full image: ${media.alt}`}
        aria-haspopup="dialog"
        className={`group relative block cursor-zoom-in focus-visible:outline-offset-[-3px] ${className}`}
      >
        <img
          src={media.src}
          alt=""
          width={media.width}
          height={media.height}
          loading="lazy"
          className="size-full object-cover object-top transition-transform duration-500 ease-standard group-hover:scale-[1.02]"
        />
        <span
          aria-hidden
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-pill bg-surface/90 text-foreground shadow-raised transition-transform duration-200 ease-standard group-hover:scale-110"
        >
          <ExpandIcon />
        </span>
      </button>
      {open && <Lightbox media={media} onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * The full image in a modal dialog, at full width so tall mockups scroll at
 * readable size. Esc, the close button or a click outside closes it.
 */
function Lightbox({ media, onClose }: { media: Image; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Clicks on the empty space around the image, not on the image or the close button
  const closeOnBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={closeOnBackdrop} aria-label={media.alt} className="lightbox">
      <div className="flex h-full flex-col">
        <div onClick={closeOnBackdrop} className="flex items-center gap-3 px-gutter py-3">
          <p className="lightbox-caption min-w-0 flex-1 truncate text-sm font-medium">{media.alt}</p>
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-pill bg-surface text-foreground"
          >
            <CloseIcon />
          </button>
        </div>

        <div onClick={closeOnBackdrop} className="min-h-0 flex-1 overflow-auto px-gutter pb-gutter">
          <img
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            style={{ maxWidth: media.width }}
            className="mx-auto h-auto w-full rounded-control"
          />
        </div>
      </div>
    </dialog>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
