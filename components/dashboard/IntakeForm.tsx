"use client";

import { useEffect, useMemo, useState } from "react";
import { saveIntakeForm } from "@/lib/dashboard/intakeActions";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import {
  composeIntakeStoredValue,
  resolveIntakeInput,
  splitIntakeStoredValue,
  type IntakeInputHint,
} from "@/lib/intake/inputHints";
import { countAnsweredQuestions, type IntakeQuestion, type IntakeQuestionSet } from "@/lib/intake/questions";
import type { ClientIntakeSubmission } from "@/types/database";

type IntakeFormProps = {
  questionSet: IntakeQuestionSet;
  submission: ClientIntakeSubmission | null;
  readOnly?: boolean;
};

type FieldState = {
  selections: string[];
  note: string;
  freeText: string;
  scaleValue: number | null;
  showNote: boolean;
};

function initialFieldState(value: string, hint: IntakeInputHint): FieldState {
  const parsed = splitIntakeStoredValue(value);
  if (hint.kind === "short_text") {
    return {
      selections: [],
      note: "",
      freeText: parsed.freeText || value,
      scaleValue: null,
      showNote: false,
    };
  }

  if (hint.kind === "scale") {
    const scaleMatch = value.trim().match(/^(\d+)/);
    const note = parsed.note;
    return {
      selections: [],
      note,
      freeText: "",
      scaleValue: scaleMatch ? Number(scaleMatch[1]) : null,
      showNote: Boolean(note),
    };
  }

  const known = new Set(hint.options ?? []);
  const selections = parsed.selections.filter((item) => known.has(item));
  const leftovers = parsed.selections.filter((item) => !known.has(item));
  const note = [parsed.note, ...leftovers].filter(Boolean).join(" ").trim() || (selections.length ? "" : parsed.freeText);

  // Exact single option stored without separators
  if (!selections.length && hint.options?.includes(value.trim())) {
    return {
      selections: [value.trim()],
      note: "",
      freeText: "",
      scaleValue: null,
      showNote: false,
    };
  }

  return {
    selections,
    note,
    freeText: "",
    scaleValue: null,
    showNote: Boolean(note),
  };
}

function buildStoredValue(hint: IntakeInputHint, field: FieldState) {
  return composeIntakeStoredValue({
    kind: hint.kind,
    selections: field.selections,
    note: field.note,
    freeText: field.freeText,
    scaleValue: field.scaleValue,
  });
}

function shortenSectionTitle(title: string) {
  return title.replace(/^\d+\.\s*/, "").trim();
}

export function IntakeForm({ questionSet, submission, readOnly = false }: IntakeFormProps) {
  const responses = submission?.responses ?? {};
  const isCompleted = Boolean(submission?.completed_at);

  const hints = useMemo(() => {
    const map = new Map<string, IntakeInputHint>();
    for (const section of questionSet.sections) {
      for (const question of section.questions) {
        map.set(question.id, resolveIntakeInput(question.text));
      }
    }
    return map;
  }, [questionSet]);

  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const next: Record<string, FieldState> = {};
    for (const section of questionSet.sections) {
      for (const question of section.questions) {
        const hint = resolveIntakeInput(question.text);
        next[question.id] = initialFieldState(responses[question.id] ?? "", hint);
      }
    }
    return next;
  });

  const [sectionIndex, setSectionIndex] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const firstIncomplete = questionSet.sections.findIndex((section) =>
      section.questions.some((question) => {
        const hint = hints.get(question.id)!;
        const field = fields[question.id];
        return !buildStoredValue(hint, field).trim();
      }),
    );
    if (firstIncomplete >= 0) setSectionIndex(firstIncomplete);
    // Only on mount — resume where they left off
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draft = useMemo(() => {
    const next: Record<string, string> = {};
    for (const section of questionSet.sections) {
      for (const question of section.questions) {
        const hint = hints.get(question.id)!;
        next[question.id] = buildStoredValue(hint, fields[question.id] ?? initialFieldState("", hint));
      }
    }
    return next;
  }, [fields, hints, questionSet.sections]);

  const progress = useMemo(() => countAnsweredQuestions(draft, questionSet), [draft, questionSet]);
  const progressPercent = Math.round((progress.answered / Math.max(progress.total, 1)) * 100);

  const sectionProgress = useMemo(
    () =>
      questionSet.sections.map((section) => {
        const ids = section.questions.map((question) => question.id);
        const answered = ids.filter((id) => Boolean(draft[id]?.trim())).length;
        return {
          title: section.title,
          shortTitle: shortenSectionTitle(section.title),
          answered,
          total: ids.length,
          done: answered === ids.length && ids.length > 0,
        };
      }),
    [draft, questionSet.sections],
  );

  const currentSection = questionSet.sections[sectionIndex] ?? questionSet.sections[0];
  const isLastSection = sectionIndex >= questionSet.sections.length - 1;

  function updateField(questionId: string, patch: Partial<FieldState>) {
    setJustSaved(false);
    setFields((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] ?? initialFieldState("", hints.get(questionId)!)),
        ...patch,
      },
    }));
  }

  function toggleChip(question: IntakeQuestion, option: string, multi: boolean) {
    const field = fields[question.id] ?? initialFieldState("", hints.get(question.id)!);
    const selected = new Set(field.selections);
    if (multi) {
      if (selected.has(option)) selected.delete(option);
      else selected.add(option);
    } else {
      selected.clear();
      selected.add(option);
    }
    updateField(question.id, { selections: [...selected] });
  }

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
    <form action={saveIntakeForm} className="dashboard-form intake-form intake-form-wizard">
      <input type="hidden" name="questionSetSlug" value={questionSet.slug} />
      <input type="hidden" name="redirectTo" value="/portal/intake/" />

      {Object.entries(draft).map(([questionId, value]) => (
        <input key={questionId} type="hidden" name={`response_${questionId}`} value={value} />
      ))}

      <div className="intake-form-header">
        <p className="eyebrow">Quick intake</p>
        <h2>{questionSet.title}</h2>
        <p className="dashboard-inline-note">
          Tap the closest answers. Short notes are optional — Gerald only needs a clear picture, not an essay.
        </p>
        <div className="portal-task-progress">
          <div className="portal-task-progress-bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="intake-progress-note">
            Step {sectionIndex + 1} of {questionSet.sections.length} · {progress.answered}/{progress.total} answered ·{" "}
            {progressPercent}%
          </p>
        </div>
        <div className="intake-section-chips" aria-label="Section progress">
          {sectionProgress.map((section, index) => (
            <button
              key={section.title}
              type="button"
              className={`intake-section-chip${section.done ? " is-done" : ""}${index === sectionIndex ? " is-current" : ""}`}
              onClick={() => setSectionIndex(index)}
            >
              {index + 1}. {section.shortTitle}
              <small>
                {section.answered}/{section.total}
              </small>
            </button>
          ))}
        </div>
      </div>

      <section className="intake-section intake-section-active" aria-live="polite">
        <h3>
          Step {sectionIndex + 1}. {shortenSectionTitle(currentSection.title)}
        </h3>
        <div className="intake-question-list">
          {currentSection.questions.map((question) => {
            const hint = hints.get(question.id)!;
            const field = fields[question.id] ?? initialFieldState("", hint);

            return (
              <div key={question.id} className="intake-question-field">
                <p className="intake-question-prompt">{question.text}</p>
                <p className="intake-question-helper">{hint.helper}</p>

                {hint.kind === "chips_single" || hint.kind === "chips_multi" ? (
                  <div className="intake-choice-grid" role="group" aria-label={question.text}>
                    {(hint.options ?? []).map((option) => {
                      const selected = field.selections.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`intake-choice-chip${selected ? " is-selected" : ""}`}
                          aria-pressed={selected}
                          onClick={() => toggleChip(question, option, hint.kind === "chips_multi")}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {hint.kind === "scale" ? (
                  <label className="form-field intake-scale-field">
                    <span>
                      Strength: <strong>{field.scaleValue ?? "—"}</strong>
                    </span>
                    <input
                      type="range"
                      min={hint.scaleMin ?? 0}
                      max={hint.scaleMax ?? 5}
                      value={field.scaleValue ?? hint.scaleMin ?? 0}
                      onChange={(event) => updateField(question.id, { scaleValue: Number(event.target.value) })}
                    />
                  </label>
                ) : null}

                {hint.kind === "short_text" ? (
                  <label className="form-field">
                    <span className="visually-hidden">{question.text}</span>
                    <textarea
                      rows={2}
                      maxLength={Math.min(dashboardFieldMaxLengths.intakeResponse, 400)}
                      placeholder={hint.placeholder ?? "Short answer…"}
                      value={field.freeText}
                      onChange={(event) => updateField(question.id, { freeText: event.target.value })}
                    />
                  </label>
                ) : (
                  <div className="intake-optional-note">
                    {field.showNote ? (
                      <label className="form-field">
                        <span>Optional note</span>
                        <textarea
                          rows={2}
                          maxLength={220}
                          placeholder="One short detail if needed…"
                          value={field.note}
                          onChange={(event) => updateField(question.id, { note: event.target.value })}
                        />
                      </label>
                    ) : (
                      <button
                        type="button"
                        className="intake-note-toggle"
                        onClick={() => updateField(question.id, { showNote: true })}
                      >
                        + Add a short note
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {justSaved ? (
        <p className="dashboard-inline-note dashboard-success-note">Progress saved — you can leave and continue later.</p>
      ) : null}

      <div className="intake-form-actions intake-form-actions-sticky">
        <p className="intake-sticky-hint">
          {progress.answered === progress.total
            ? "All set — submit when you are ready."
            : "Tap through each step. Save anytime."}
        </p>
        <div className="intake-form-action-buttons">
          <button
            type="button"
            className="button button-secondary"
            disabled={sectionIndex === 0}
            onClick={() => setSectionIndex((value) => Math.max(0, value - 1))}
          >
            Back
          </button>
          <button
            type="submit"
            name="action"
            value="save"
            className="button button-secondary"
            onClick={() => setJustSaved(true)}
          >
            Save
          </button>
          {!isLastSection ? (
            <button
              type="button"
              className="button button-primary"
              onClick={() => setSectionIndex((value) => Math.min(questionSet.sections.length - 1, value + 1))}
            >
              Continue
            </button>
          ) : (
            <button type="submit" name="action" value="submit" className="button button-primary">
              Submit intake
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
