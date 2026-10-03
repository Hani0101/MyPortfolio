"use client";

import { useState } from "react";
import type { ProjectMedia as Media } from "@/content/projects";
import { ProjectMedia } from "./ProjectMedia";

const tabLabel = (item: Media) => {
  if (item.kind === "image") return item.alt.toLowerCase().includes("wireframe") ? "Wireframe" : "Mockup";
  return item.kind === "video" ? "Video" : "Media";
};

/** A project's media; with several items, tabs switch between them and only the shown one plays */
export function ProjectGallery({ items }: { items: Media[] }) {
  const [active, setActive] = useState(0);

  if (items.length === 1) return <ProjectMedia media={items[0]} className="" />;

  return (
    <div>
      <div role="tablist" aria-label="Project media" className="flex gap-2 border-b border-border px-4 py-2">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-pill px-3 py-1 text-sm font-medium ${i === active ? "bg-background text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {tabLabel(item)}
          </button>
        ))}
      </div>
      <ProjectMedia key={active} media={items[active]} className="" />
    </div>
  );
}
