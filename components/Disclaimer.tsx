import { standardDisclaimer } from "@/lib/constants";

type DisclaimerProps = {
  title?: string;
};

export function Disclaimer({ title = "Important medical and crisis disclaimer" }: DisclaimerProps) {
  return (
    <section className="section disclaimer" aria-labelledby="disclaimer-heading">
      <div className="container narrow">
        <p className="eyebrow">Safety first</p>
        <h2 id="disclaimer-heading">{title}</h2>
        <p>{standardDisclaimer}</p>
      </div>
    </section>
  );
}
