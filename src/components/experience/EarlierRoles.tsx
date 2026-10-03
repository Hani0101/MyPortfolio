import type { CSSProperties } from "react";
import { CompanyName } from "@/components/CompanyName";
import { companies } from "@/content/companies";
import { earlierRoles, earlierRolesSection } from "@/content/experiences";

const companiesById = new Map(companies.map((c) => [c.id, c]));
const rows = earlierRoles.flatMap((role) => {
  const company = companiesById.get(role.companyId);
  return company ? [{ role, company }] : [];
});

/** Anchor for the stories' "Next" control; undefined when there are no rows to show */
export const earlierRolesAnchor = rows.length ? "#earlier-roles" : undefined;

/**
 * Roles without a story: one compact row each, so the section ends with
 * something that reads in seconds. Each row is the hero list's anchor for its company.
 */
export function EarlierRoles() {
  if (!rows.length) return null;

  return (
    <div id="earlier-roles" className="mx-auto max-w-content px-gutter pb-section pt-section">
      <h3 id="earlier-roles-title" className="text-h3">
        {earlierRolesSection.title}
      </h3>

      <ul aria-labelledby="earlier-roles-title" className="mt-6 border-t border-border">
        {rows.map(({ role, company }) => (
          <li
            key={company.id}
            id={company.href.replace(/^#/, "")}
            // Its own variable, not --accent-color, which only useCompanyTheme writes
            style={{ "--role-accent": company.accent } as CSSProperties}
            className="grid gap-x-8 gap-y-3 border-b border-border py-6 lg:grid-cols-12 lg:items-center"
          >
            <div className="lg:col-span-3">
              <h4 className="flex items-center gap-3 text-h3">
                <CompanyName company={company} />
              </h4>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <span aria-hidden className="role-dot size-2 shrink-0 rounded-full" />
                {[company.role, company.period].filter(Boolean).join(" · ")}
              </p>
            </div>

            <p className="max-w-prose text-muted lg:col-span-5">{role.summary}</p>

            <ul aria-label="Tech stack" className="flex flex-wrap gap-2 lg:col-span-4 lg:justify-end">
              {role.stack.map((item) => (
                <li key={item} className="role-chip rounded-pill px-3 py-1 text-sm font-medium">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
