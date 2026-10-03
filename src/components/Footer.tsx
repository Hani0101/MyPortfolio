import { footer, type FooterLink } from "@/content/footer";

const LABEL = "text-sm font-medium uppercase tracking-[0.2em] text-muted";

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Closing contact call to action, page links and the copyright line */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" aria-labelledby="contact-title" className="site-footer">
      <div className="mx-auto grid max-w-content gap-x-6 gap-y-12 px-gutter py-section grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="col-span-2 lg:col-span-6 xl:col-span-7">
          <p className={LABEL}>{footer.eyebrow}</p>
          {/* Display size, so the page closes as strongly as the hero opens */}
          <h2 id="contact-title" className="mt-4 text-display">
            {footer.title}
          </h2>
          <p className="mt-6 max-w-prose text-lead text-muted">{footer.lead}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
            <a href={`mailto:${footer.email}`} className="btn btn-primary">
              {footer.emailCta}
            </a>
            <a href={footer.resumeCta.href} className="btn btn-secondary">
              {footer.resumeCta.label}
            </a>
            <a href={`mailto:${footer.email}`} className="footer-link ml-3 py-2 font-medium">
              {footer.email}
            </a>
          </div>
        </div>

        {footer.sections.map((section, i) => (
          <nav
            key={section.title}
            aria-labelledby={`footer-nav-${i}`}
            className={i === 0 ? "lg:col-span-3 lg:col-start-7 xl:col-span-2 xl:col-start-9" : "lg:col-span-3 xl:col-span-2"}
          >
            <h3 id={`footer-nav-${i}`} className={`${LABEL} font-sans`}>
              {section.title}
            </h3>
            <ul className="mt-4 space-y-1">
              {section.links.map((link) => (
                <li key={link.label}>
                  <FooterNavLink link={link} />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto max-w-content px-gutter">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border py-6 text-sm text-muted">
          <p>
            © {year} {footer.owner}
          </p>
          <a href="#" className="footer-link inline-flex items-center gap-2 py-2">
            {footer.backToTop} <span aria-hidden>↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterNavLink({ link }: { link: FooterLink }) {
  const external = isExternal(link.href);
  return (
    <a
      href={link.href}
      className="footer-link inline-flex items-center gap-1.5 py-2"
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {link.label}
      {external && (
        <>
          <span aria-hidden>↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
