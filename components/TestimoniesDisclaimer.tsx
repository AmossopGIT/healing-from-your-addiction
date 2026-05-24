import { SiteLink } from "@/components/SiteLink";

export function TestimoniesDisclaimer() {
  return (
    <aside className="case-study-disclaimer testimony-disclaimer" aria-label="Testimonies disclaimer">
      <p>
        <strong>Educational illustrations only.</strong> These testimonies describe patterns and support approaches in
        general terms. They are anonymised, not medical advice, do not guarantee outcomes, and individual experiences
        vary. For structured examples, see the{" "}
        <SiteLink href="/case-studies/">case studies library</SiteLink>.
      </p>
      <p>
        <SiteLink href="/medical-disclaimer/">Read the medical disclaimer</SiteLink>
      </p>
    </aside>
  );
}
