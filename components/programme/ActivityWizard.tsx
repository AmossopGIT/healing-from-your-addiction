"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProgrammeActivity } from "@/content/interactiveProgrammes/types";
import { MOOD_OPTIONS } from "@/content/interactiveProgrammes/types";
import { saveActivityProgress } from "@/lib/dashboard/interactiveProgrammeActions";
import { trackProgrammeEvent } from "@/lib/tracking";

type ActivityWizardProps = {
  enrollmentId: string;
  activity: ProgrammeActivity;
  programmeSlug: string;
  programmeVersion: number;
  initialResponses?: Record<string, unknown>;
  status: string;
  safetyDisclaimer?: string;
  escalation?: string | null;
  highUrgeThreshold?: number;
  previewMode?: boolean;
  onPreviewComplete?: (responses: Record<string, unknown>) => void;
};

const moodLabels: Record<(typeof MOOD_OPTIONS)[number], string> = {
  calm: "Calm",
  steady: "Steady",
  low: "Low",
  anxious: "Anxious",
  irritable: "Irritable",
};

export function ActivityWizard({
  enrollmentId,
  activity,
  programmeSlug,
  programmeVersion,
  initialResponses = {},
  status,
  safetyDisclaimer,
  escalation,
  highUrgeThreshold = 4,
  previewMode = false,
  onPreviewComplete,
}: ActivityWizardProps) {
  const fields = activity.fields ?? [];
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(initialResponses);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [previewSaved, setPreviewSaved] = useState(false);
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const steps = useMemo(() => {
    const base: Array<"content" | number> = ["content"];
    fields.forEach((_, index) => base.push(index));
    return base;
  }, [fields]);

  const progressPercent = Math.round((step / Math.max(steps.length - 1, 1)) * 100);
  const current = steps[step];
  const urgeValue = typeof values.urge_level === "number" ? Number(values.urge_level) : null;
  const highUrge = urgeValue !== null && urgeValue >= highUrgeThreshold;

  useEffect(() => {
    if (startedRef.current || previewMode) return;
    startedRef.current = true;
    trackProgrammeEvent("programme_activity_started", {
      programme_slug: programmeSlug,
      programme_version: programmeVersion,
      activity_id: activity.id,
      activity_type: activity.type,
      module_id: activity.moduleId,
    });
  }, [activity.id, activity.moduleId, activity.type, previewMode, programmeSlug, programmeVersion]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function updateValue(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validateCurrent() {
    if (current === "content") return true;
    const field = fields[current];
    if (!field?.required) return true;
    const value = values[field.key];
    if (field.kind === "checkbox") return value === true;
    if (field.kind === "scale") return typeof value === "number";
    if (field.kind === "multi_choice") return Array.isArray(value) && value.length > 0;
    if (field.kind === "mood") return typeof value === "string" && value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
  }

  function goNext() {
    if (!validateCurrent()) {
      setError("Please complete this step before continuing.");
      return;
    }
    setError("");
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function submit(complete: boolean) {
    if (complete && !validateCurrent()) {
      setError("Please complete this step before finishing.");
      return;
    }

    if (previewMode) {
      setPreviewSaved(true);
      onPreviewComplete?.(values);
      return;
    }

    setPending(true);
    setError("");

    const formData = new FormData();
    formData.set("enrollmentId", enrollmentId);
    formData.set("activityId", activity.id);
    formData.set("complete", complete ? "1" : "0");
    formData.set("redirectTo", `/portal/programme/journey/${activity.id}/`);

    for (const field of fields) {
      const value = values[field.key];
      if (field.kind === "multi_choice" && Array.isArray(value)) {
        value.forEach((item) => formData.append(`field_${field.key}`, String(item)));
      } else if (field.kind === "checkbox") {
        formData.set(`field_${field.key}`, value === true ? "1" : "0");
      } else if (value !== undefined && value !== null) {
        formData.set(`field_${field.key}`, String(value));
      }
    }

    trackProgrammeEvent(complete ? "programme_activity_completed" : "programme_answer_saved", {
      programme_slug: programmeSlug,
      programme_version: programmeVersion,
      activity_id: activity.id,
      activity_type: activity.type,
      module_id: activity.moduleId,
    });

    try {
      await saveActivityProgress(formData);
    } catch {
      setPending(false);
    }
  }

  return (
    <section className="need-help-wizard programme-activity-wizard">
      {previewMode ? (
        <p className="dashboard-inline-note">Preview mode — answers stay on this page and are not saved to a client.</p>
      ) : null}
      <div className="need-help-wizard-progress" aria-hidden="true">
        <div className="need-help-wizard-progress-bar">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="need-help-wizard-progress-label">{progressPercent}% complete</p>
      </div>
      <p className="eyebrow">
        Week {activity.weekNumber}
        {activity.dayNumber && activity.dayNumber > 0 ? ` · Day ${activity.dayNumber}` : ""}
        {activity.origin === "platform" ? " · Extra practice" : ""}
      </p>
      <h2 ref={headingRef} tabIndex={-1}>
        {activity.title}
      </h2>

      {status === "completed" && !previewMode ? (
        <p className="dashboard-inline-note dashboard-success-note">You have completed this activity. You can revisit your answers below.</p>
      ) : null}
      {previewSaved ? <p className="dashboard-inline-note dashboard-success-note">Preview completed locally.</p> : null}

      {current === "content" ? (
        <div className="programme-activity-content">
          {activity.affirmation ? <blockquote className="programme-affirmation">“{activity.affirmation}”</blockquote> : null}
          {activity.prompt ? <p>{activity.prompt}</p> : null}
          {activity.focusItems?.length ? (
            <ul className="programme-focus-list">
              {activity.focusItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {safetyDisclaimer ? <p className="dashboard-inline-note">{safetyDisclaimer}</p> : null}
          {escalation ? <p className="dashboard-inline-note dashboard-warning-note">{escalation}</p> : null}
        </div>
      ) : (
        <div className="need-help-wizard-panel">
          {(() => {
            const field = fields[current];
            if (!field) return null;
            if (field.kind === "textarea") {
              return (
                <label className="form-field">
                  <span>{field.label}</span>
                  <textarea
                    rows={5}
                    value={typeof values[field.key] === "string" ? String(values[field.key]) : ""}
                    onChange={(event) => updateValue(field.key, event.target.value)}
                  />
                </label>
              );
            }
            if (field.kind === "mood") {
              return (
                <fieldset className="form-field">
                  <legend>{field.label}</legend>
                  <div className="portal-home-mood-options">
                    {(field.options ?? [...MOOD_OPTIONS]).map((option) => (
                      <label key={option} className="portal-home-mood-option">
                        <input
                          type="radio"
                          name={field.key}
                          checked={values[field.key] === option}
                          onChange={() => updateValue(field.key, option)}
                        />
                        <span>{moodLabels[option as (typeof MOOD_OPTIONS)[number]] ?? option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            }
            if (field.kind === "scale") {
              const value = typeof values[field.key] === "number" ? Number(values[field.key]) : 0;
              return (
                <label className="form-field">
                  <span>
                    {field.label}: <strong>{value}</strong>
                  </span>
                  <input
                    type="range"
                    min={field.min ?? 0}
                    max={field.max ?? 5}
                    value={value}
                    onChange={(event) => updateValue(field.key, Number(event.target.value))}
                  />
                  {field.key === "urge_level" && highUrge ? (
                    <p className="dashboard-inline-note dashboard-warning-note">
                      That urge feels strong. Pause, breathe, and use a safer next step. Support is available if you need it.
                    </p>
                  ) : null}
                </label>
              );
            }
            if (field.kind === "checkbox") {
              return (
                <label className="form-check">
                  <input
                    type="checkbox"
                    checked={values[field.key] === true}
                    onChange={(event) => updateValue(field.key, event.target.checked)}
                  />
                  <span>{field.label}</span>
                </label>
              );
            }
            if (field.kind === "single_choice") {
              return (
                <fieldset className="form-field">
                  <legend>{field.label}</legend>
                  <div className="programme-choice-grid">
                    {(field.options ?? []).map((option) => (
                      <label key={option} className="form-check">
                        <input
                          type="radio"
                          name={field.key}
                          checked={values[field.key] === option}
                          onChange={() => updateValue(field.key, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            }
            const selected = Array.isArray(values[field.key]) ? (values[field.key] as string[]) : [];
            return (
              <fieldset className="form-field">
                <legend>{field.label}</legend>
                <div className="programme-choice-grid">
                  {(field.options ?? []).map((option) => {
                    const checked = selected.includes(option);
                    return (
                      <label key={option} className="form-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            updateValue(
                              field.key,
                              checked ? selected.filter((item) => item !== option) : [...selected, option],
                            );
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })()}
        </div>
      )}

      {error ? <p className="dashboard-inline-note dashboard-error-note">{error}</p> : null}

      <div className="need-help-wizard-actions">
        <button type="button" className="button button-secondary" disabled={step === 0 || pending} onClick={() => setStep((value) => Math.max(0, value - 1))}>
          Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" className="button button-primary" disabled={pending} onClick={goNext}>
            Continue
          </button>
        ) : (
          <>
            {!previewMode ? (
              <button type="button" className="button button-secondary" disabled={pending || status === "completed"} onClick={() => submit(false)}>
                Save progress
              </button>
            ) : null}
            <button type="button" className="button button-primary" disabled={pending} onClick={() => submit(true)}>
              {previewMode ? "Complete preview" : status === "completed" ? "Update & continue" : "Complete activity"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
