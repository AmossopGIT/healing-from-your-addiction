import { SiteLink } from "@/components/SiteLink";

export function CaseStudyDisclaimer() {
  return (
    <aside className="case-study-disclaimer" aria-label="Case study disclaimer">
      <p>
        <strong>Educational illustration only.</strong> These case studies describe patterns and support approaches in
        general terms. They are not medical advice, do not guarantee outcomes, and individual experiences vary. Urgent or
        severe dependence may need medical or specialist care first.
      </p>
      <p>
        <SiteLink href="/medical-disclaimer/">Read the medical disclaimer</SiteLink>
      </p>
    </aside>
  );
}
