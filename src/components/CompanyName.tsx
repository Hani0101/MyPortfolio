import type { CSSProperties } from "react";
import type { Company } from "@/content/companies";

/**
 * Company name with its logo: a mark before the name, or a wordmark in place of it.
 * `plain` shows the name alone, for lists where every company should look alike.
 */
export function CompanyName({ company, plain = false }: { company: Company; plain?: boolean }) {
  const { logo, name } = company;

  if (plain) return <>{name}</>;

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
      {/* Lazy: every logo sits below the hero, so it shouldn't compete with the first screen */}
      {logo && <img src={logo.src} width={logo.width} height={logo.height} alt="" loading="lazy" decoding="async" className="h-[0.8em] w-auto" />}
      {name}
    </>
  );
}
