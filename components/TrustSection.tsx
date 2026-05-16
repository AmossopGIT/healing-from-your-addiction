import { siteConfig } from "@/lib/constants";
import { RevealDiv } from "@/components/MotionReveal";

type TrustSectionProps = {
  title?: string;
  body?: string;
};

export function TrustSection({
  title = "A confidential, non-judgemental place to begin",
  body = "Gerald Crawford works with hypnotherapy, EFT, subconscious pattern work and emotional awareness. The focus is on understanding the addiction loop and supporting behaviour change without shame or unrealistic promises.",
}: TrustSectionProps) {
  return (
    <section className="section trust-section" aria-labelledby="trust-heading">
      <div className="container split-grid">
        <RevealDiv>
          <p className="eyebrow">About {siteConfig.owner}</p>
          <h2 id="trust-heading">{title}</h2>
        </RevealDiv>
        <RevealDiv className="prose" delay={0.08}>
          <p>{body}</p>
          <ul className="check-list">
            <li>Certified Clinical Hypnosis Practitioner positioning</li>
            <li>Pattern-focused hypnotherapy and EFT support</li>
            <li>Private enquiry process with clear safety boundaries</li>
          </ul>
        </RevealDiv>
      </div>
    </section>
  );
}
