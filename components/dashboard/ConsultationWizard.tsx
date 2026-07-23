"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CONSULTATION_BLANK_PDF_PATH,
  CONSULTATION_STEPS,
  consultationHasUrgentSafetyFlag,
  consultationStatusLabels,
  computeConsultationPercent,
  getConsultationStepIndex,
  isConsultationCompleteStatus,
  type ConsultationStepKey,
} from "@/lib/consultation/schema";
import { markConsultationStarted, saveConsultationStep, uploadCompletedConsultationForm } from "@/lib/dashboard/consultationActions";
import type { ClientConsultation } from "@/types/database";

type ConsultationWizardProps = {
  consultation: ClientConsultation;
  clientName: string;
  clientEmail: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export function ConsultationWizard({ consultation, clientName, clientEmail }: ConsultationWizardProps) {
  const router = useRouter();
  const completed = isConsultationCompleteStatus(consultation.status);
  const [responses, setResponses] = useState<Record<string, unknown>>(() => ({
    todays_date: new Date().toISOString().slice(0, 10),
    full_name: clientName,
    email: clientEmail,
    signature_date: new Date().toISOString().slice(0, 10),
    ...consultation.responses,
  }));
  const [stepKey, setStepKey] = useState<ConsultationStepKey>(
    (CONSULTATION_STEPS.find((step) => step.key === consultation.current_step)?.key as ConsultationStepKey) || "personal",
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stepIndex = getConsultationStepIndex(stepKey);
  const step = CONSULTATION_STEPS[stepIndex] ?? CONSULTATION_STEPS[0];
  const percent = useMemo(() => computeConsultationPercent(responses), [responses]);
  const progressPct = completed ? 100 : Math.max(percent, Math.round(((stepIndex + 1) / CONSULTATION_STEPS.length) * 100 * 0.25));

  useEffect(() => {
    void markConsultationStarted();
  }, []);

  function updateField(key: string, value: unknown) {
    setResponses((current) => ({ ...current, [key]: value }));
  }

  function toggleCheckbox(key: string, option: string, exclusiveNone = false) {
    setResponses((current) => {
      const existing = asStringArray(current[key]);
      let next: string[];
      if (option === "none" && exclusiveNone) {
        next = existing.includes("none") ? [] : ["none"];
      } else if (exclusiveNone) {
        next = existing.includes(option)
          ? existing.filter((item) => item !== option)
          : [...existing.filter((item) => item !== "none"), option];
      } else {
        next = existing.includes(option) ? existing.filter((item) => item !== option) : [...existing, option];
      }
      return { ...current, [key]: next };
    });
  }

  function runSave(action: "save" | "continue" | "submit") {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await saveConsultationStep({
        stepKey,
        responses,
        action,
      });

      if (!result.ok) {
        if (result.error === "incomplete-step") {
          setError("Please complete the required fields on this step before continuing.");
        } else if (result.error === "already-completed") {
          setError("This consultation form has already been submitted.");
        } else {
          setError("Unable to save right now. Please try again.");
        }
        return;
      }

      if (result.completed) {
        setMessage("Consultation submitted. Thank you — Gerald will review your form.");
        router.refresh();
        return;
      }

      if (action === "save") {
        setMessage("Progress saved.");
      }

      if (action === "continue" && result.nextStep) {
        setStepKey(result.nextStep as ConsultationStepKey);
        setMessage(null);
      }
    });
  }

  if (completed) {
    return (
      <div className="consultation-wizard consultation-wizard-complete">
        <div className="consultation-wizard-progress">
          <div className="need-help-wizard-progress-bar" aria-hidden="true">
            <span style={{ width: "100%" }} />
          </div>
          <p className="need-help-wizard-progress-label">Complete · {consultationStatusLabels[consultation.status]}</p>
        </div>

        <div className="need-help-wizard-panel">
          <h2>Consultation received</h2>
          <p className="need-help-wizard-lead">
            {consultation.completion_mode === "upload"
              ? "Your uploaded consultation form is on file. Gerald will review it before sessions begin."
              : "Your online consultation answers are submitted. Gerald will review them before sessions begin."}
          </p>
          <div className="consultation-complete-actions">
            {consultation.completion_mode === "online" || Object.keys(consultation.responses).length > 0 ? (
              <a className="button button-secondary" href="/api/portal/consultation/export/">
                Download my answers (PDF)
              </a>
            ) : null}
            {consultation.upload_storage_path ? (
              <a className="button button-secondary" href={`/api/consultation/${consultation.client_profile_id}/upload/`}>
                Download uploaded file
              </a>
            ) : null}
          </div>
        </div>

        <ConsultationReadonlySummary responses={consultation.responses} />
      </div>
    );
  }

  return (
    <div className="consultation-wizard">
      <div className="consultation-wizard-progress">
        <div className="need-help-wizard-progress-bar" aria-hidden="true">
          <span style={{ width: `${Math.max(progressPct, percent)}%` }} />
        </div>
        <p className="need-help-wizard-progress-label">
          Step {stepIndex + 1} of {CONSULTATION_STEPS.length} · {percent}% complete · {consultationStatusLabels[consultation.status]}
        </p>
      </div>

      <div className="consultation-alt-path dashboard-panel">
        <h3>Prefer paper?</h3>
        <p>Download the blank form, complete it offline, then upload a PDF or photo here.</p>
        <div className="consultation-alt-actions">
          <a className="button button-secondary button-small" href={CONSULTATION_BLANK_PDF_PATH} download>
            Download blank PDF
          </a>
          <form action={uploadCompletedConsultationForm} encType="multipart/form-data" className="consultation-upload-form">
            <label className="form-field">
              <span>Upload completed form</span>
              <input type="file" name="file" accept="application/pdf,image/jpeg,image/png" required />
            </label>
            <button type="submit" className="button button-secondary button-small">
              Upload file
            </button>
          </form>
        </div>
      </div>

      <div className="need-help-wizard-panel">
        <h2>{step.title}</h2>
        <p className="need-help-wizard-lead">{step.description}</p>

        {step.key === "therapy_safety" && consultationHasUrgentSafetyFlag(responses) ? (
          <p className="consultation-safety-notice" role="status">
            If you are in immediate danger or feeling unsafe right now, please contact emergency services or your GP. Gerald
            will review any safety notes sensitively and is not an emergency service.
          </p>
        ) : null}

        {error ? <p className="need-help-wizard-error">{error}</p> : null}
        {message ? <p className="dashboard-inline-note dashboard-success-note">{message}</p> : null}

        <div className="need-help-wizard-form consultation-step-fields">
          {step.fields.map((field) => {
            if (field.type === "textarea") {
              return (
                <label key={field.key} className="form-field">
                  <span>{field.label}</span>
                  <textarea
                    rows={4}
                    value={asString(responses[field.key])}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    required={field.required}
                  />
                </label>
              );
            }

            if (field.type === "date" || field.type === "text") {
              return (
                <label key={field.key} className="form-field">
                  <span>{field.label}</span>
                  <input
                    type={field.type}
                    value={asString(responses[field.key])}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.key} className="form-field">
                  <label>
                    <span>{field.label}</span>
                    <select
                      value={asString(responses[field.key])}
                      onChange={(event) => updateField(field.key, event.target.value)}
                      required={field.required}
                    >
                      <option value="">Select…</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {field.allowOther && asString(responses[field.key]) === "other" && field.otherKey ? (
                    <label className="form-field">
                      <span>Please specify</span>
                      <input
                        type="text"
                        value={asString(responses[field.otherKey])}
                        onChange={(event) => updateField(field.otherKey!, event.target.value)}
                        required
                      />
                    </label>
                  ) : null}
                </div>
              );
            }

            if (field.type === "radio") {
              return (
                <fieldset key={field.key} className="form-field consultation-fieldset">
                  <legend>{field.label}</legend>
                  <div className="consultation-option-list">
                    {field.options?.map((option) => (
                      <label key={option.value} className="consultation-option">
                        <input
                          type="radio"
                          name={field.key}
                          checked={asString(responses[field.key]) === option.value}
                          onChange={() => updateField(field.key, option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            }

            if (field.type === "checkbox-group") {
              const exclusiveNone = Boolean(field.options?.some((option) => option.value === "none"));
              return (
                <fieldset key={field.key} className="form-field consultation-fieldset">
                  <legend>{field.label}</legend>
                  {field.hint ? <p className="need-help-wizard-hint">{field.hint}</p> : null}
                  <div className="consultation-option-list">
                    {field.options?.map((option) => (
                      <label key={option.value} className="consultation-option">
                        <input
                          type="checkbox"
                          checked={asStringArray(responses[field.key]).includes(option.value)}
                          onChange={() => toggleCheckbox(field.key, option.value, exclusiveNone)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {field.allowOther && field.otherKey ? (
                    <label className="form-field">
                      <span>Other (please specify)</span>
                      <input
                        type="text"
                        value={asString(responses[field.otherKey])}
                        onChange={(event) => {
                          updateField(field.otherKey!, event.target.value);
                          const current = asStringArray(responses[field.key]);
                          if (event.target.value.trim() && !current.includes("other")) {
                            updateField(field.key, [...current, "other"]);
                          }
                        }}
                      />
                    </label>
                  ) : null}
                </fieldset>
              );
            }

            return null;
          })}
        </div>

        <div className="need-help-wizard-nav">
          <button
            type="button"
            className="button button-secondary"
            disabled={pending || stepIndex === 0}
            onClick={() => setStepKey(CONSULTATION_STEPS[stepIndex - 1].key)}
          >
            Back
          </button>
          <button type="button" className="button button-secondary" disabled={pending} onClick={() => runSave("save")}>
            Save progress
          </button>
          {stepIndex < CONSULTATION_STEPS.length - 1 ? (
            <button type="button" className="button button-primary" disabled={pending} onClick={() => runSave("continue")}>
              Continue
            </button>
          ) : (
            <button type="button" className="button button-primary" disabled={pending} onClick={() => runSave("submit")}>
              Submit consultation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsultationReadonlySummary({ responses }: { responses: Record<string, unknown> }) {
  return (
    <div className="consultation-readonly">
      {CONSULTATION_STEPS.map((step) => (
        <section key={step.key} className="intake-section">
          <h3>{step.title}</h3>
          <div className="intake-answer-list">
            {step.fields.map((field) => (
              <article key={field.key} className="intake-answer-item">
                <p className="intake-question-label">{field.label}</p>
                <p className="intake-answer-text">
                  {Array.isArray(responses[field.key])
                    ? (responses[field.key] as string[]).join(", ") || "—"
                    : String(responses[field.key] ?? "—")}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
