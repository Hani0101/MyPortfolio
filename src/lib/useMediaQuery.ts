"use client";

import { useCallback, useSyncExternalStore } from "react";

// One live list per query, shared by every component that asks
const lists = new Map<string, MediaQueryList>();
const list = (query: string) => {
  let mql = lists.get(query);
  if (!mql) lists.set(query, (mql = window.matchMedia(query)));
  return mql;
};

/** Subscribes to a media query. Returns false during SSR. */
export function useMediaQuery(query: string): boolean {
  // Stable per query, so React subscribes once instead of again on every render
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = list(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => list(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
