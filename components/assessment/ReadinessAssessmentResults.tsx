import Link from "next/link";
import {
  getFocusGuidance,
  getNextStepGuidance,
  readinessBandLabels,
  readinessFoundations,
  readinessFoundationLabels,
  readinessGateQuestions,
  readinessNextStepLabels,
  readinessPrivacySummary,
  readinessSafetyQuestions,
  type ReadinessResponses,
  type ReadinessScores,
} from "@/content/readinessAssessment";

type ReadinessAssessmentResultsProps = {
  responses: ReadinessResponses;
  scores: ReadinessScores;
  compact?: boolean;
  history?: Array<{
    id: string;
    completed_at: string | null;
    readiness_index: number | null;
    readiness_band: string;
    attempt_number: number;
  }>;
};

function ScoreMeter({ label, score, band }: { label: string; score: number; band: string }) {
  const width = Math.max(0, Math.min(100, (score / 10) * 100));
  return (
    <div className="readiness-meter">
      <div className="readiness-meter-head">
        <p className="readiness-meter-label">{label}</p>
        <p className="readiness-meter-value">
          {score.toFixed(1)}
          <span> · {band}</span>
        </p>
      </div>
      <div
        className="readiness-meter-track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={Number(score.toFixed(1))}
      >
        <span style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function ReadinessAssessmentResults({
  responses,
  scores,
  compact = false,
  history = [],
}: ReadinessAssessmentResultsProps) {
  return (
    <div className={`readiness-results${compact ? " readiness-results-compact" : ""}`}>
      {scores.urgentSafety ? (
        <section className="dashboard-panel readiness-safety-panel" role="alert">
          <p className="eyebrow">Urgent safety guidance</p>
          <h2>Please seek appropriate help first</h2>
          <p>
            Your answers suggest urgent medical, psychiatric, emergency, or immediate-danger support may be needed. This
            assessment is not crisis care and should not replace emergency services.
          </p>
          <ul className="need-help-wizard-points">
            <li>If you are in immediate danger, contact your local emergency number now.</li>
            <li>
              Review the <Link href="/medical-disclaimer/">medical disclaimer</Link> for safety boundaries.
            </li>
            <li>
              You can also use the <Link href="/contact/">contact page</Link> for a confidential non-emergency enquiry.
            </li>
          </ul>
        </section>
      ) : null}

      <section className="dashboard-panel readiness-results-summary">
        <p className="eyebrow">Your readiness snapshot</p>
        <h2>{readinessBandLabels[scores.readinessBand]}</h2>
        <p className="readiness-results-lead">
          Readiness can be thought of as Commitment × Awareness × Emotional Capacity. The index is a calm 0–100 view of
          that formula — reflective guidance, not a diagnosis or guarantee.
        </p>

        <div className="readiness-index-callout">
          <p className="readiness-index-value">
            {scores.readinessIndex.toFixed(0)}
            <span>/100</span>
          </p>
          <p className="readiness-index-label">Readiness index</p>
        </div>

        <div className="readiness-meter-list">
          <ScoreMeter
            label="Commitment"
            score={scores.commitment}
            band={readinessBandLabels[scores.sectionBands.commitment]}
          />
          <ScoreMeter
            label="Self-Awareness"
            score={scores.self_awareness}
            band={readinessBandLabels[scores.sectionBands.self_awareness]}
          />
          <ScoreMeter
            label="Emotional Capacity"
            score={scores.emotional_capacity}
            band={readinessBandLabels[scores.sectionBands.emotional_capacity]}
          />
        </div>

        <p className="dashboard-inline-note">{getFocusGuidance(scores)}</p>
        <p className="readiness-next-step-note">
          <strong>{readinessNextStepLabels[scores.nextStep]}.</strong> {getNextStepGuidance(scores)}
        </p>
      </section>

      {!compact
        ? readinessFoundations.map((foundation) => (
            <section key={foundation.id} className="dashboard-panel">
              <p className="eyebrow">{foundation.eyebrow}</p>
              <h3>{foundation.title}</h3>
              <p className="readiness-section-score">
                Section score: <strong>{scores[foundation.id].toFixed(1)}</strong> ·{" "}
                {readinessBandLabels[scores.sectionBands[foundation.id]]}
              </p>
              <div className="intake-answer-list">
                {foundation.scaleItems.map((item) => (
                  <article key={item.id} className="intake-answer-item">
                    <p className="intake-question-label">
                      {item.label}
                      {item.isOverall ? " (confirmation)" : ""}
                    </p>
                    <p className="intake-answer-text">{String(responses[item.id] ?? "—")} / 10</p>
                  </article>
                ))}
              </div>
            </section>
          ))
        : null}

      <section className="dashboard-panel">
        <h3>The three readiness questions</h3>
        <div className="intake-answer-list">
          {readinessGateQuestions.map((item) => {
            const value = responses[item.id];
            const display =
              item.kind === "yes_no"
                ? value === "yes"
                  ? "Yes"
                  : value === "no"
                    ? "Not yet"
                    : "—"
                : typeof value === "string" && value.trim()
                  ? value
                  : "—";
            return (
              <article key={item.id} className="intake-answer-item">
                <p className="intake-question-label">
                  {readinessFoundationLabels[item.foundationId]}: {item.label}
                </p>
                <p className="intake-answer-text">{display}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-panel">
        <h3>Safety screening</h3>
        <div className="intake-answer-list">
          {readinessSafetyQuestions.map((item) => {
            const value = responses[item.id];
            const flagged = value === true || value === "yes";
            return (
              <article key={item.id} className="intake-answer-item">
                <p className="intake-question-label">{item.label}</p>
                <p className="intake-answer-text">{flagged ? "Yes — flagged for urgent guidance" : "No"}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-panel">
        <h3>Privacy reminder</h3>
        <ul className="need-help-wizard-points">
          {readinessPrivacySummary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          See the <Link href="/privacy-policy/">privacy policy</Link> for retention and deletion requests.
        </p>
      </section>

      {history.length > 1 ? (
        <section className="dashboard-panel">
          <h3>Previous assessments</h3>
          <ul className="need-help-wizard-points">
            {history.map((item) => (
              <li key={item.id}>
                Attempt {item.attempt_number}
                {item.completed_at ? ` · ${new Date(item.completed_at).toLocaleDateString("en-ZA")}` : ""} · index{" "}
                {item.readiness_index ?? "—"} / 100
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!scores.urgentSafety ? (
        <section className="dashboard-panel readiness-cta-panel">
          <h3>Suggested next step</h3>
          <p>{getNextStepGuidance(scores)}</p>
          {scores.nextStep === "programme_enquiry" ? (
            <p>
              <Link href="/need-help/" className="button button-primary">
                Start a confidential enquiry
              </Link>
            </p>
          ) : (
            <p>
              <Link href="/contact/" className="button button-secondary">
                Contact Gerald
              </Link>
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
