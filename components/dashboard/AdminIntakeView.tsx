import { caseStudyBySlug } from "@/content/caseStudies";
import { buildIntakeQuestionSet } from "@/lib/intake/questions";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import type { ClientIntakeSubmission } from "@/types/database";

type AdminIntakeViewProps = {
  submission: ClientIntakeSubmission | null;
  addictionSlug: string | null;
};

export function AdminIntakeView({ submission, addictionSlug }: AdminIntakeViewProps) {
  if (!submission) {
    return (
      <p className="dashboard-empty">
        This client has not started their pre-programme intake questions yet.
        {addictionSlug ? ` Questions will be based on their ${addictionSlug} focus.` : ""}
      </p>
    );
  }

  const study = caseStudyBySlug.get(submission.question_set_slug);
  if (!study) {
    return <p className="dashboard-empty">Intake question set could not be loaded.</p>;
  }

  const questionSet = buildIntakeQuestionSet(study);
  const responses = submission.responses ?? {};

  return (
    <div className="intake-form intake-form-readonly">
      <div className="intake-form-header">
        <h2>{questionSet.title}</h2>
        <p className="dashboard-inline-note">
          {submission.completed_at
            ? `Submitted ${formatDashboardDate(submission.completed_at)}`
            : `In progress — last saved ${formatDashboardDate(submission.updated_at)}`}
        </p>
        <span className={`status-badge ${submission.completed_at ? "status-badge-intake-complete" : "status-badge-intake-in-progress"}`}>
          {submission.completed_at ? "Completed" : "In progress"}
        </span>
      </div>

      {questionSet.sections.map((section) => (
        <section key={section.title} className="intake-section">
          <h3>{section.title}</h3>
          <div className="intake-answer-list">
            {section.questions.map((question) => (
              <article key={question.id} className="intake-answer-item">
                <p className="intake-question-label">{question.text}</p>
                  <p className="intake-answer-text">
                    {typeof responses[question.id] === "string"
                      ? responses[question.id].trim() || "—"
                      : responses[question.id] == null
                        ? "—"
                        : String(responses[question.id])}
                  </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
