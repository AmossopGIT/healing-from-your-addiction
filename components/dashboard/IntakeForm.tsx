import { saveIntakeForm } from "@/lib/dashboard/intakeActions";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { countAnsweredQuestions, type IntakeQuestionSet } from "@/lib/intake/questions";
import type { ClientIntakeSubmission } from "@/types/database";

type IntakeFormProps = {
  questionSet: IntakeQuestionSet;
  submission: ClientIntakeSubmission | null;
  readOnly?: boolean;
};

export function IntakeForm({ questionSet, submission, readOnly = false }: IntakeFormProps) {
  const responses = submission?.responses ?? {};
  const isCompleted = Boolean(submission?.completed_at);
  const progress = countAnsweredQuestions(responses, questionSet);

  if (readOnly || isCompleted) {
    return (
      <div className="intake-form intake-form-readonly">
        <div className="intake-form-header">
          <p className="eyebrow">Submitted intake</p>
          <h2>{questionSet.title}</h2>
          {submission?.completed_at ? (
            <p className="dashboard-inline-note">
              Completed on {new Date(submission.completed_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          ) : null}
        </div>
        {questionSet.sections.map((section) => (
          <section key={section.title} className="intake-section">
            <h3>{section.title}</h3>
            <div className="intake-answer-list">
              {section.questions.map((question) => (
                <article key={question.id} className="intake-answer-item">
                  <p className="intake-question-label">{question.text}</p>
                  <p className="intake-answer-text">{responses[question.id]?.trim() || "—"}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <form action={saveIntakeForm} className="dashboard-form intake-form">
      <input type="hidden" name="questionSetSlug" value={questionSet.slug} />
      <input type="hidden" name="redirectTo" value="/portal/intake/" />

      <div className="intake-form-header">
        <p className="eyebrow">Questions</p>
        <h2>{questionSet.title}</h2>
        <p className="dashboard-inline-note">
          Answer in your own words. You can save progress and return later, or submit when every question is complete.
        </p>
        <p className="intake-progress-note">
          {progress.answered} of {progress.total} questions answered
        </p>
      </div>

      {questionSet.sections.map((section) => (
        <section key={section.title} className="intake-section">
          <h3>{section.title}</h3>
          <div className="intake-question-list">
            {section.questions.map((question) => (
              <label key={question.id} className="form-field intake-question-field">
                <span>{question.text}</span>
                <textarea
                  name={`response_${question.id}`}
                  rows={3}
                  maxLength={dashboardFieldMaxLengths.intakeResponse}
                  defaultValue={responses[question.id] ?? ""}
                  required={false}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="intake-form-actions">
        <button type="submit" name="action" value="save" className="button button-secondary">
          Save progress
        </button>
        <button type="submit" name="action" value="submit" className="button button-primary">
          Submit intake
        </button>
      </div>
    </form>
  );
}
