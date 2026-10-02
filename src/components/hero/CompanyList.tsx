"use client";

import { useEffect, useRef, type FocusEvent, type PointerEvent, type RefObject } from "react";
import type { Company } from "@/content/companies";
import { CompanyItem } from "./CompanyItem";
import type { PointerTarget } from "./HoverObject";

type Props = {
  companies: Company[];
  activeId: string | null;
  // The "Action" suffix marks these as server-action-style props, which Next's
  // "use client" serializable-props check (ts 71007) allows to be functions
  onActivateAction: (id: string) => void;
  onResetAction: () => void;
  /** Mouse/pen device: hover drives the theme. Otherwise the centered item does. */
  finePointer: boolean;
  animate: boolean;
  targetRef: RefObject<PointerTarget>;
};

export function CompanyList({
  companies,
  activeId,
  onActivateAction: onActivate,
  onResetAction: onReset,
  finePointer,
  animate,
  targetRef,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null);

  // Touch: theme follows the item crossing the middle of the screen
  useEffect(() => {
    const list = listRef.current;
    if (finePointer || !list) return;

    const center = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.company;
          if (entry.isIntersecting && id) onActivate(id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const leave = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) onReset();
    });

    list.querySelectorAll("[data-company]").forEach((item) => center.observe(item));
    leave.observe(list);
    return () => {
      center.disconnect();
      leave.disconnect();
    };
  }, [finePointer, onActivate, onReset]);

  const handlePointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "touch") targetRef.current = { clientX: e.clientX, clientY: e.clientY };
  };

  // Reset only when leaving the whole list, so moving between items never flickers
  // (unless a keyboard user is focused inside it)
  const handlePointerLeave = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const focused = document.activeElement;
    const keyboardFocusInside = !!focused && listRef.current?.contains(focused) && focused.matches(":focus-visible");
    if (!keyboardFocusInside) onReset();
  };

  // Keyboard: aim the object at the focused item instead of the cursor
  const handleFocusItem = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    targetRef.current = { clientX: rect.left + rect.width * 0.7, clientY: rect.top + rect.height / 2 };
  };

  const handleBlurItem = (e: FocusEvent<HTMLAnchorElement>) => {
    if (!listRef.current?.contains(e.relatedTarget as Node | null)) onReset();
  };

  return (
    <ul
      ref={listRef}
      className="divide-y divide-border border-y border-border"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {companies.map((company, index) => (
        <CompanyItem
          key={company.id}
          company={company}
          index={index}
          active={company.id === activeId}
          animate={animate}
          onActivateAction={onActivate}
          onFocusItemAction={handleFocusItem}
          onBlurItemAction={handleBlurItem}
        />
      ))}
    </ul>
  );
}
