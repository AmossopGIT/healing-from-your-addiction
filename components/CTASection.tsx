import { RevealDiv } from "@/components/MotionReveal";
import { TrackedLink } from "@/components/TrackedLink";

type CTASectionProps = {
  title: string;
  body: string;
  button: string;
  href?: string;
};

export function CTASection({ title, body, button, href = "#enquiry" }: CTASectionProps) {
  return (
    <section className="section cta-band" aria-labelledby="cta-heading">
      <div className="container cta-inner">
        <RevealDiv>
          <p className="eyebrow">Next step</p>
          <h2 id="cta-heading">{title}</h2>
          <p>{body}</p>
        </RevealDiv>
        <RevealDiv delay={0.08}>
          <TrackedLink
            href={href}
            className="button button-primary"
            tracking={{ ctaName: button, payload: { cta_location: "section_cta" } }}
          >
            {button}
          </TrackedLink>
        </RevealDiv>
      </div>
    </section>
  );
}
