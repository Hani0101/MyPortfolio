"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import type { Company } from "@/content/companies";

/**
 * The only place that writes a company theme. The hero (hover) and the
 * experience section (scroll) each call it on their own root; components
 * call activate/release/reset and never touch --accent-color themselves.
 */
export function useCompanyTheme(rootRef: RefObject<HTMLElement | null>, companies: Company[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const accent = companies.find((c) => c.id === activeId)?.accent;
    if (accent) root.style.setProperty("--accent-color", accent);
    else root.style.removeProperty("--accent-color"); // falls back to the root's CSS default
  }, [rootRef, companies, activeId]);

  const activate = useCallback((id: string) => setActiveId(id), []);
  const reset = useCallback(() => setActiveId(null), []);
  // Resets only if `id` still owns the theme, so a section leaving never
  // clobbers the next one when both observer events land in the same frame
  const release = useCallback((id: string) => setActiveId((current) => (current === id ? null : current)), []);

  return { activeId, activate, release, reset };
}
