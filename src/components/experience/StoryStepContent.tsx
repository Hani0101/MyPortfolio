import type { CSSProperties } from "react";
import { CompanyName } from "@/components/CompanyName";
import type { Company } from "@/content/companies";
import type { StoryStep } from "@/content/experiences";
import { StoryStats } from "./StoryStats";

const LABEL = "text-sm font-medium uppercase tracking-[0.2em] text-muted";

type Props = {
  step: StoryStep;
  label?: string;
  company: Company;
  location?: string;
  /** Id for the story heading, rendered by the arrival step */
  titleId: string;
  /** Stack chips pop in and result numbers count up once their step arrives */
  revealed: boolean;
  animate: boolean;
};

export function StoryStepContent({ step, label, company, location, titleId, revealed, animate }: Props) {
  switch (step.kind) {
    case "arrival":
      return (
        <>
          <p className={LABEL}>{[company.period, location].filter(Boolean).join(" · ")}</p>
          <h3 id={titleId} className="mt-4 flex items-center gap-4 text-h1">
            <CompanyName company={company} />
          </h3>
          {company.role && <p className="mt-3 text-lead text-muted">{company.role}</p>}
        </>
      );

    case "text":
      return (
        <>
          <p className={LABEL}>{label}</p>
          <h4 className="mt-3 text-h3">{step.title}</h4>
          <p className="mt-3 max-w-prose text-muted">{step.body}</p>
        </>
      );

    case "result":
      return (
        <>
          <p className={LABEL}>{label}</p>
          <h4 className="mt-3 text-h3">{step.title}</h4>
          <StoryStats stats={step.stats} revealed={revealed} animate={animate} />
        </>
      );

    case "stack":
      return (
        <>
          <p className={LABEL}>{label}</p>
          <ul aria-label="Tech stack" data-revealed={revealed} className="story-chips mt-4 flex flex-wrap gap-2">
            {step.items.map((item, index) => (
              <li
                key={item}
                style={{ "--i": index } as CSSProperties}
                className="story-chip rounded-pill px-3 py-1 text-sm font-medium"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-prose font-heading text-h3 italic">{step.takeaway}</p>
        </>
      );
  }
}
