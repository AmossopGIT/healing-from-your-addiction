"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { addictionOptions, contactMethods } from "@/lib/constants";
import { submitLead } from "@/lib/leads";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { getCurrentSeoContext, pushDataLayer } from "@/lib/tracking";

type WizardStep =
  | "welcome"
  | "concern"
  | "contact"
  | "urgency"
  | "reach"
  | "share"
  | "confirm";

type WizardLeadState = {
  fullName: string;
  email: string;
  phone: string;
  addictionConcern: string;
  preferredContactMethod: string;
  urgencyLevel: "low" | "medium" | "high";
  withdrawalRisk: "none" | "mild" | "moderate" | "severe" | "unsure";
  medicalSupportInvolved: "yes" | "no" | "planning";
  callbackWindow: "early_morning" | "late_morning" | "afternoon" | "evening" | "flexible";
  readinessStage: "exploring" | "ready_now" | "currently_in_support";
  supportGoals: string;
  followUpConsentWhatsApp: boolean;
  followUpConsentEmail: boolean;
  followUpConsentPhone: boolean;
  message: string;
  website: string;
};

const initialLead: WizardLeadState = {
  fullName: "",
  email: "",
  phone: "",
  addictionConcern: addictionOptions[0],
  preferredContactMethod: "WhatsApp",
  urgencyLevel: "medium",
  withdrawalRisk: "unsure",
  medicalSupportInvolved: "planning",
  callbackWindow: "flexible",
  readinessStage: "exploring",
  supportGoals: "",
  followUpConsentWhatsApp: true,
  followUpConsentEmail: true,
  followUpConsentPhone: false,
  message: "",
  website: "",
};

const stepOrder: WizardStep[] = ["welcome", "concern", "contact", "urgency", "reach", "share", "confirm"];

const stepLabels: Record<WizardStep, string> = {
  welcome: "Welcome",
  concern: "Your concern",
  contact: "How to reach you",
  urgency: "How urgent it feels",
  reach: "Preferences",
  share: "Anything else",
  confirm: "Confirm",
};

function thankYouPathForConcern(concern: string) {
  if (concern === "Gambling") return "/thank-you/gambling-addiction/";
  if (concern === "Food / binge eating") return "/thank-you/food-addiction/";
  return "/thank-you/general-enquiry/";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    landing_page: window.location.pathname,
    referrer: document.referrer,
    ...getCurrentSeoContext(),
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    gclid: params.get("gclid"),
  };
}

function isAddictionOption(value: string | undefined): value is (typeof addictionOptions)[number] {
  return Boolean(value && (addictionOptions as readonly string[]).includes(value));
}

export function NeedHelpWizard({ defaultConcern }: { defaultConcern?: string }) {
  const router = useRouter();
  const startedRef = useRef(false);
  const [step, setStep] = useState<WizardStep>("welcome");
  const [lead, setLead] = useState<WizardLeadState>({
    ...initialLead,
    addictionConcern: isAddictionOption(defaultConcern) ? defaultConcern : initialLead.addictionConcern,
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sourcePage = useMemo(() => (typeof window === "undefined" ? "" : window.location.pathname), []);

  const progressIndex = Math.max(0, stepOrder.indexOf(step));
  const progressTotal = stepOrder.length - 1;
  const progressPercent = step === "welcome" ? 0 : Math.round((progressIndex / progressTotal) * 100);

  function track(event: string, payload: Record<string, unknown> = {}) {
    pushDataLayer(event, {
      form_name: "need_help_wizard",
      link_location: "need_help_page",
      addiction_type: lead.addictionConcern,
      preferred_contact_method: lead.preferredContactMethod,
      wizard_step: step,
      ...payload,
    });
  }

  function updateField<K extends keyof WizardLeadState>(field: K, value: WizardLeadState[K]) {
    setLead((current) => ({ ...current, [field]: value }));
  }

  function markWizardStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track("need_help_wizard_start");
  }

  function goTo(next: WizardStep) {
    if (next !== "welcome") {
      track("need_help_wizard_step_complete", { step_name: step, next_step: next });
    }
    setError("");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    const index = stepOrder.indexOf(step);
    if (index <= 0) return;
    setError("");
    setStep(stepOrder[index - 1]);
  }

  function validateCurrentStep() {
    if (step === "contact") {
      if (lead.fullName.trim().length < 2) {
        setError("Please add your name so Gerald knows who to respond to.");
        return false;
      }
      if (!isValidEmail(lead.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (lead.phone.trim().length < 6) {
        setError("Please add a phone or WhatsApp number.");
        return false;
      }
    }

    if (step === "confirm" && !consent) {
      setError("Please confirm this is for enquiry support and not emergency medical care.");
      return false;
    }

    return true;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    const index = stepOrder.indexOf(step);
    if (index < 0 || index >= stepOrder.length - 1) return;
    goTo(stepOrder[index + 1]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError("");
    track("need_help_wizard_submit_attempt");

    const { website, ...visibleFields } = lead;
    const payload = {
      ...visibleFields,
      company: website,
      consentEmergencyAcknowledged: consent,
      sourcePage,
      ...getAttribution(),
    };

    try {
      const submitMode = await submitLead(payload);
      track("lead_form_submit", {
        urgency_level: lead.urgencyLevel,
        readiness_stage: lead.readinessStage,
        callback_window: lead.callbackWindow,
      });

      if (submitMode === "api") {
        router.push(withBasePath(thankYouPathForConcern(lead.addictionConcern)));
      } else {
        setError("Your browser opened email as a fallback. You can also try WhatsApp from the contact page.");
      }
    } catch (submitError) {
      track("need_help_wizard_submit_error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while sending your enquiry. Please try again or use WhatsApp.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="need-help-wizard" id="need-help-wizard">
      <div className="need-help-wizard-progress" aria-hidden={step === "welcome"}>
        <div className="need-help-wizard-progress-bar">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        {step !== "welcome" ? (
          <p className="need-help-wizard-progress-label">
            Step {progressIndex} of {progressTotal}: {stepLabels[step]}
          </p>
        ) : null}
      </div>

      {step === "welcome" ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">Private help wizard</p>
          <h2>Take it one step at a time</h2>
          <p className="need-help-wizard-lead">
            Answer a few short questions so Gerald can respond with the right level of care. This is for confidential
            enquiry support — not emergency medical care.
          </p>
          <ul className="need-help-wizard-points">
            <li>About 3–4 minutes</li>
            <li>One question per screen</li>
            <li>Skip details you are not ready to share</li>
          </ul>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              markWizardStarted();
              goTo("concern");
            }}
          >
            Start confidential enquiry
          </button>
        </div>
      ) : null}

      {step === "concern" ? (
        <div className="need-help-wizard-panel">
          <h2>What would you like support with?</h2>
          <p className="need-help-wizard-hint">Choose the closest match. You can add more detail later.</p>
          <div className="need-help-chip-grid">
            {addictionOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`need-help-chip${lead.addictionConcern === option ? " is-selected" : ""}`}
                onClick={() => updateField("addictionConcern", option)}
              >
                {option}
              </button>
            ))}
          </div>
          <WizardNav onBack={goBack} onNext={handleNext} />
        </div>
      ) : null}

      {step === "contact" ? (
        <div className="need-help-wizard-panel">
          <h2>How can Gerald reach you?</h2>
          <form className="need-help-wizard-form" onSubmit={(event) => { event.preventDefault(); handleNext(); }}>
            <label>
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                value={lead.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                maxLength={leadFieldMaxLengths.fullName}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={lead.email}
                onChange={(event) => updateField("email", event.target.value)}
                maxLength={leadFieldMaxLengths.email}
                required
              />
            </label>
            <label>
              <span>Phone / WhatsApp</span>
              <input
                type="tel"
                autoComplete="tel"
                value={lead.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                maxLength={leadFieldMaxLengths.phone}
                required
              />
            </label>
            <WizardNav onBack={goBack} onNext={handleNext} submitLabel="Continue" />
          </form>
        </div>
      ) : null}

      {step === "urgency" ? (
        <div className="need-help-wizard-panel">
          <h2>How does this feel right now?</h2>
          <label>
            <span>Urgency today</span>
            <select value={lead.urgencyLevel} onChange={(event) => updateField("urgencyLevel", event.target.value as WizardLeadState["urgencyLevel"])}>
              <option value="low">Low — planning ahead</option>
              <option value="medium">Medium — I want help soon</option>
              <option value="high">High — I need support as soon as possible</option>
            </select>
          </label>
          <label>
            <span>Withdrawal or medical support</span>
            <select value={lead.withdrawalRisk} onChange={(event) => updateField("withdrawalRisk", event.target.value as WizardLeadState["withdrawalRisk"])}>
              <option value="none">No current withdrawal concern</option>
              <option value="mild">Mild discomfort</option>
              <option value="moderate">Moderate symptoms</option>
              <option value="severe">Severe symptoms</option>
              <option value="unsure">Not sure</option>
            </select>
          </label>
          {lead.withdrawalRisk === "severe" || lead.urgencyLevel === "high" ? (
            <p className="need-help-safety-note" role="note">
              If you feel medically unsafe right now, contact emergency services or your GP immediately. Gerald can
              still follow up for non-emergency support planning.
            </p>
          ) : null}
          <WizardNav onBack={goBack} onNext={handleNext} />
        </div>
      ) : null}

      {step === "reach" ? (
        <div className="need-help-wizard-panel">
          <h2>Your preferences</h2>
          <label>
            <span>Preferred contact method</span>
            <select
              value={lead.preferredContactMethod}
              onChange={(event) => updateField("preferredContactMethod", event.target.value)}
            >
              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Best callback window</span>
            <select value={lead.callbackWindow} onChange={(event) => updateField("callbackWindow", event.target.value as WizardLeadState["callbackWindow"])}>
              <option value="early_morning">Early morning</option>
              <option value="late_morning">Late morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="flexible">Flexible</option>
            </select>
          </label>
          <label>
            <span>Working with a GP/doctor?</span>
            <select
              value={lead.medicalSupportInvolved}
              onChange={(event) => updateField("medicalSupportInvolved", event.target.value as WizardLeadState["medicalSupportInvolved"])}
            >
              <option value="planning">Planning to / open to it</option>
              <option value="yes">Yes, already</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <span>Where are you in this process?</span>
            <select value={lead.readinessStage} onChange={(event) => updateField("readinessStage", event.target.value as WizardLeadState["readinessStage"])}>
              <option value="exploring">Exploring options</option>
              <option value="ready_now">Ready to start now</option>
              <option value="currently_in_support">Already in support</option>
            </select>
          </label>
          <WizardNav onBack={goBack} onNext={handleNext} />
        </div>
      ) : null}

      {step === "share" ? (
        <div className="need-help-wizard-panel">
          <h2>Anything you want Gerald to know?</h2>
          <p className="need-help-wizard-hint">Both fields are optional. Share only what feels safe.</p>
          <label>
            <span>Progress in the next 2–4 weeks (optional)</span>
            <input
              type="text"
              value={lead.supportGoals}
              onChange={(event) => updateField("supportGoals", event.target.value)}
              maxLength={leadFieldMaxLengths.supportGoals}
              placeholder="Example: fewer night urges, more routine"
            />
          </label>
          <label>
            <span>Short message (optional)</span>
            <textarea
              rows={4}
              value={lead.message}
              onChange={(event) => updateField("message", event.target.value)}
              maxLength={leadFieldMaxLengths.message}
              placeholder="Briefly share what you would like support with."
            />
          </label>
          <fieldset className="follow-up-consent">
            <legend>Okay to follow up using:</legend>
            <div className="follow-up-options">
              <label className="follow-up-option">
                <input
                  type="checkbox"
                  checked={lead.followUpConsentWhatsApp}
                  onChange={(event) => updateField("followUpConsentWhatsApp", event.target.checked)}
                />
                <span>WhatsApp</span>
              </label>
              <label className="follow-up-option">
                <input
                  type="checkbox"
                  checked={lead.followUpConsentEmail}
                  onChange={(event) => updateField("followUpConsentEmail", event.target.checked)}
                />
                <span>Email</span>
              </label>
              <label className="follow-up-option">
                <input
                  type="checkbox"
                  checked={lead.followUpConsentPhone}
                  onChange={(event) => updateField("followUpConsentPhone", event.target.checked)}
                />
                <span>Phone call</span>
              </label>
            </div>
          </fieldset>
          <label className="honeypot" aria-hidden="true">
            <span>Website</span>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="new-password"
              value={lead.website}
              onChange={(event) => updateField("website", event.target.value)}
            />
          </label>
          <WizardNav onBack={goBack} onNext={handleNext} />
        </div>
      ) : null}

      {step === "confirm" ? (
        <div className="need-help-wizard-panel">
          <h2>Ready to send?</h2>
          <dl className="need-help-review">
            <div>
              <dt>Concern</dt>
              <dd>{lead.addictionConcern}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{lead.fullName}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                {lead.preferredContactMethod} · {lead.email} · {lead.phone}
              </dd>
            </div>
            <div>
              <dt>Urgency</dt>
              <dd>{lead.urgencyLevel.replace("_", " ")}</dd>
            </div>
          </dl>
          <form className="need-help-wizard-form" onSubmit={handleSubmit}>
            <label className="consent-row">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setConsent(checked);
                  if (checked) {
                    track("lead_form_safety_acknowledged", {
                      urgency_level: lead.urgencyLevel,
                      withdrawal_risk: lead.withdrawalRisk,
                    });
                  }
                }}
                required
              />
              <span>I understand this is for confidential enquiry support and not emergency medical care.</span>
            </label>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <WizardNav onBack={goBack} submitLabel={isSubmitting ? "Sending..." : "Send enquiry"} isSubmit disabled={isSubmitting} />
          </form>
        </div>
      ) : null}

      {error && step !== "confirm" ? (
        <p className="form-error need-help-wizard-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  submitLabel = "Continue",
  isSubmit = false,
  disabled = false,
}: {
  onBack: () => void;
  onNext?: () => void;
  submitLabel?: string;
  isSubmit?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="need-help-wizard-nav">
      <button type="button" className="button button-secondary" onClick={onBack}>
        Back
      </button>
      {isSubmit ? (
        <button type="submit" className="button button-primary" disabled={disabled}>
          {submitLabel}
        </button>
      ) : (
        <button type="button" className="button button-primary" onClick={onNext} disabled={disabled}>
          {submitLabel}
        </button>
      )}
    </div>
  );
}
