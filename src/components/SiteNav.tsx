"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

// The section crossing the middle of the screen is the current one
const CENTER_LINE = "-50% 0px -50% 0px";
const SCROLLED_PX = 8;

/** Sticky header: the owner's name, the page's sections and the résumé, on every screen */
export function SiteNav() {
  const [current, setCurrent] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = site.nav.flatMap((link) => document.querySelector<HTMLElement>(link.href) ?? []);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `#${entry.target.id}`;
          // Clear only if this section still owns it, so leaving one never clobbers the next
          setCurrent((now) => (entry.isIntersecting ? href : now === href ? null : now));
        }
      },
      { rootMargin: CENTER_LINE },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLLED_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header data-scrolled={scrolled} className="site-nav fixed inset-x-0 top-0 z-50">
      <nav aria-label="Main" className="mx-auto flex h-[var(--nav-height)] max-w-content items-center gap-5 px-gutter sm:gap-8">
        <a href="#top" className="site-nav-home mr-auto font-heading text-xl font-semibold">
          {site.owner}
        </a>
        <ul className="flex items-center gap-5 text-sm font-medium sm:gap-8">
          {site.nav.map((link, index) => (
            // Phones: the first link is dropped for room; the hero's company list already leads there
            <li key={link.href} className={index === 0 ? "hidden sm:block" : undefined}>
              <a
                href={link.href}
                aria-current={current === link.href ? "location" : undefined}
                className="site-nav-link inline-block py-2"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={site.resume.href} className="btn btn-secondary btn-sm">
          {site.resume.label}
        </a>
      </nav>
    </header>
  );
}
