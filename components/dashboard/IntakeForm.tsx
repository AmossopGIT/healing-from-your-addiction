"use client";

import { useMemo, useState } from "react";
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
  const [draft, setDraft] = useState<Record<string, string>>(responses);

  const progress = useMemo(() => countAnsweredQuestions(draft, questionSet), [draft, questionSet]);
  const progressPercent = Math.round((progress.answered / Math.max(progress.total, 1)) * 100);

  const sectionProgress = useMemo(
    () =>
      questionSet.sections.map((section) => {
        const ids = section.questions.map((question) => question.id);
        const answered = ids.filter((id) => Boolean(draft[id]?.trim())).length;
        return {
          title: section.title,
          answered,
          total: ids.length,
          done: answered === ids.length && ids.length > 0,
        };
      }),
    [draft, questionSet.sections],
  );

  if (readOnly || isCompleted) {
    return (
      <div className="intake-form intake-form-readonly">
        <div className="intake-form-header">
          <p className="eyebrow">Submitted intake</p>
          <h2>{questionSet.title}</h2>
          <p className="intake-progress-note">
            {progress.answered} of {progress.total} questions answered
          </p>
          {submission?.completed_at ? (
            <p className="dashboard-inline-note">
              Completed on{" "}
              {new Date(submission.completed_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
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
        <div className="portal-task-progress">
          <div className="portal-task-progress-bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="intake-progress-note">
            {progress.answered} of {progress.total} questions answered · {progressPercent}%
          </p>
        </div>
        <div className="intake-section-chips" aria-label="Section progress">
          {sectionProgress.map((section) => (
            <span
              key={section.title}
              className={`intake-section-chip${section.done ? " is-done" : section.answered > 0 ? " is-current" : ""}`}
            >
              {section.title}
              <small>
                {section.answered}/{section.total}
              </small>
            </span>
          ))}
        </div>
      </div>

      {questionSet.sections.map((section) => (
        <section key={section.title} className="intake-section" id={`intake-${section.title.toLowerCase().replace(/\s+/g, "-")}`}>
          <h3>{section.title}</h3>
          <div className="intake-question-list">
            {section.questions.map((question) => (
              <label key={question.id} className="form-field intake-question-field">
                <span>{question.text}</span>
                <textarea
                  name={`response_${question.id}`}
                  rows={3}
                  maxLength={dashboardFieldMaxLengths.intakeResponse}
                  value={draft[question.id] ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  required={false}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="intake-form-actions intake-form-actions-sticky">
        <p className="intake-sticky-hint">
          {progress.answered === progress.total
            ? "All questions answered — you can submit when ready."
            : "Save anytime. You can leave and continue later."}
        </p>
        <div className="intake-form-action-buttons">
          <button type="submit" name="action" value="save" className="button button-secondary">
            Save progress
          </button>
          <button type="submit" name="action" value="submit" className="button button-primary">
            Submit intake
          </button>
        </div>
      </div>
    </form>
  );
}
