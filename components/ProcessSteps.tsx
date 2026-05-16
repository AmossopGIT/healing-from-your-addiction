import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";

type Step = {
  title: string;
  body: string;
};

type ProcessStepsProps = {
  steps: Step[];
  title?: string;
  intro?: string;
};

const processArtworkIds = ["process-enquiry", "process-understand", "process-support", "process-integration"] as const;

export function ProcessSteps({ steps, title = "How the process works", intro }: ProcessStepsProps) {
  return (
    <section className="section" aria-labelledby="process-heading">
      <div className="container">
        <RevealDiv className="section-heading">
          <p className="eyebrow">Process</p>
          <h2 id="process-heading">{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </RevealDiv>
        <div className="steps-grid">
          {steps.map((step, index) => {
            const artworkId = processArtworkIds[index];
            const artwork = artworkId ? artGalleryById.get(artworkId) : undefined;

            return (
              <RevealArticle className="step-card" key={step.title} delay={index * 0.08}>
                {artwork ? (
                  <WatercolorArtwork
                    item={artwork}
                    className="card-artwork"
                    sizes="(min-width: 900px) 22vw, 92vw"
                  />
                ) : null}
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </RevealArticle>
            );
          })}
        </div>
      </div>
    </section>
  );
}
