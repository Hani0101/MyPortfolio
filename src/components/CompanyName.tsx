import type { CSSProperties } from "react";
import type { Company } from "@/content/companies";

/** Company name with its logo: a mark before the name, or a wordmark in place of it. */
export function CompanyName({ company }: { company: Company }) {
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
