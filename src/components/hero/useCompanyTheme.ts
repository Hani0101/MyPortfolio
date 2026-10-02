"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import type { Company } from "@/content/companies";

/**
 * The only place that writes the hero theme. Components call activate/reset
 * and never touch --accent-color themselves.
 */
export function useCompanyTheme(rootRef: RefObject<HTMLElement | null>, companies: Company[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const accent = companies.find((c) => c.id === activeId)?.accent;
    if (accent) root.style.setProperty("--accent-color", accent);
    else root.style.removeProperty("--accent-color"); // falls back to --hero-accent-default
  }, [rootRef, companies, activeId]);

  const activate = useCallback((id: string) => setActiveId(id), []);
  const reset = useCallback(() => setActiveId(null), []);

  return { activeId, activate, reset };
}
