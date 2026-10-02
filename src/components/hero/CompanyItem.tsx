"use client";

import { useEffect, useRef, type CSSProperties, type FocusEvent, type PointerEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import type { Company } from "@/content/companies";
import { useMediaQuery } from "@/lib/useMediaQuery";

// Per-item speed: 1 = moves with the page, others drift up to ~30px either way
const SPEEDS = [0.92, 1.06, 0.97, 1.1, 0.95];
const DRIFT_PER_SPEED = 300; // px of travel per 1.0 of speed difference
const ZIGZAG = 32; // px offset at the viewport edges, 0 at center
const ZIGZAG_NARROW = 12; // phones: stays inside the 16px gutter
const EDGE_OPACITY = 0.5; // keeps large names >= 3:1 even when dimmed
const HOVER_CALM = 0.15; // fraction of drift kept on the hovered item
const ENGAGE_PX = 240; // page scroll over which the effect fades in from the aligned top state

type Props = {
  company: Company;
  index: number;
  active: boolean;
  animate: boolean;
  // The "Action" suffix marks these as server-action-style props, which Next's
  // "use client" serializable-props check (ts 71007) allows to be functions
  onActivateAction: (id: string) => void;
  onFocusItemAction: (el: HTMLElement) => void;
  onBlurItemAction: (e: FocusEvent<HTMLAnchorElement>) => void;
};

export function CompanyItem({
  company,
  index,
  active,
  animate,
  onActivateAction: onActivate,
  onFocusItemAction: onFocusItem,
  onBlurItemAction: onBlurItem,
}: Props) {
  const ref = useRef<HTMLLIElement>(null);

  // 0 = item just entered at the bottom, 0.5 = centered, 1 = leaving at the top
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const speed = SPEEDS[index % SPEEDS.length];
  const drift = (speed - 1) * DRIFT_PER_SPEED;
  const side = index % 2 === 0 ? -1 : 1; // odd items (1st, 3rd...) start left, even start right
  const zigzag = useMediaQuery("(min-width: 640px)") ? ZIGZAG : ZIGZAG_NARROW;

  const baseY = useTransform(scrollYProgress, [0, 1], [drift, -drift]);
  const baseX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [side * zigzag, 0, 0, side * zigzag]);
  const baseOpacity = useTransform(scrollYProgress, [0.05, 0.35, 0.65, 0.95], [EDGE_OPACITY, 1, 1, EDGE_OPACITY]);

  // At the top of the page the list rests aligned and fully opaque; the
  // effect eases in as you scroll and back out when you return to the top
  const { scrollY } = useScroll();
  const engage = useTransform(scrollY, [0, ENGAGE_PX], [0, 1], { clamp: true });

  // Ease the hovered item toward rest instead of letting it slide under the cursor
  const calmTarget = useMotionValue(1);
  const calm = useSpring(calmTarget, { stiffness: 140, damping: 22 });
  useEffect(() => calmTarget.set(active ? HOVER_CALM : 1), [active, calmTarget]);

  const x = useTransform(() => baseX.get() * calm.get() * engage.get());
  const y = useTransform(() => baseY.get() * calm.get() * engage.get());
  const opacity = useTransform(() => 1 - (1 - baseOpacity.get()) * engage.get());

  const handlePointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== "touch") onActivate(company.id);
  };

  return (
    // The <li> never moves, so its hit area stays still while the content drifts
    <li ref={ref} data-company={company.id} data-active={active} onPointerEnter={handlePointerEnter}>
      <a
        href={company.href}
        className="block py-7 text-foreground no-underline outline-offset-[-2px] hover:text-foreground lg:py-10"
        onFocus={(e) => {
          onActivate(company.id);
          onFocusItem(e.currentTarget);
        }}
        onBlur={onBlurItem}
      >
        {/* Remount on preference change: motion keeps scroll-linked animations attached otherwise */}
        <motion.div
          key={animate ? "animated" : "static"}
          style={animate ? { x, y } : undefined}
          className={animate ? "will-change-transform" : undefined}
        >
          <motion.span
            style={animate ? { opacity } : undefined}
            className="hero-company-name flex items-center gap-4 font-heading text-h1 font-semibold"
          >
            <CompanyName company={company} />
          </motion.span>
          {(company.role || company.period) && (
            <span className="mt-2 block text-sm text-muted">
              {[company.role, company.period].filter(Boolean).join(" · ")}
            </span>
          )}
        </motion.div>
      </a>
    </li>
  );
}

function CompanyName({ company }: { company: Company }) {
  const { logo, name } = company;

  if (logo?.kind === "wordmark") {
    // Painted with currentColor through the logo's shape, so it tracks the
    // text color and the active company color like the serif names do
    return (
      <>
        <span
          aria-hidden
          className="logo-wordmark"
          style={{ "--logo-src": `url("${logo.src}")`, aspectRatio: `${logo.width} / ${logo.height}`, height: `${0.8 * (logo.scale ?? 1)}em` } as CSSProperties}
        />
        <span className="sr-only">{name}</span>
      </>
    );
  }

  return (
    <>
      {logo && <img src={logo.src} width={logo.width} height={logo.height} alt="" className="h-[0.8em] w-auto" />}
      {name}
    </>
  );
}
