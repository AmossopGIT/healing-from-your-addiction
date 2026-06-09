"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { addictionOptions, contactMethods } from "@/lib/constants";
import { submitLead } from "@/lib/leads";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { getCurrentSeoContext, pushDataLayer } from "@/lib/tracking";

type LeadFormProps = {
  defaultConcern?: string;
  formTitle?: string;
  /** Submit button label when not sending */
  submitLabel?: string;
  /** Shorter layout: core fields visible, triage/scheduling behind a toggle */
  compact?: boolean;
  /** Omit in-card title when the page section already has a heading */
  hideHeading?: boolean;
};

type LeadFormState = {
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

const initialConcern = addictionOptions[0];

function thankYouPathForConcern(concern: string) {
  if (concern === "Gambling") return "/thank-you/gambling-addiction/";
  if (concern === "Food / binge eating") return "/thank-you/food-addiction/";
  return "/thank-you/general-enquiry/";
}

export function LeadForm({
  defaultConcern = initialConcern,
  formTitle = "Start your confidential enquiry",
  submitLabel = "Send enquiry",
  compact = false,
  hideHeading = false,
}: LeadFormProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState<LeadFormState>({
    fullName: "",
    email: "",
    phone: "",
    addictionConcern: defaultConcern,
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
  });

  const isSubmitting = status === "submitting";
  const sourcePage = useMemo(() => (typeof window === "undefined" ? "" : window.location.pathname), []);

  function markStarted() {
    if (started) return;
    setStarted(true);
    pushDataLayer("lead_form_start", {
      form_name: "addiction_enquiry",
      addiction_type: form.addictionConcern,
    });
  }

  function updateField(field: keyof LeadFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!consent) {
      setError("Please confirm that you understand this is an enquiry and not emergency medical support.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const { website, ...visibleFields } = form;
    const payload = {
      ...visibleFields,
      company: website,
      consentEmergencyAcknowledged: consent,
      sourcePage,
      ...getAttribution(),
    };

    try {
      const submitMode = await submitLead(payload);

      pushDataLayer("lead_form_submit", {
        form_name: "addiction_enquiry",
        addiction_type: form.addictionConcern,
        preferred_contact_method: form.preferredContactMethod,
        urgency_level: form.urgencyLevel,
        readiness_stage: form.readinessStage,
        callback_window: form.callbackWindow,
      });

      if (submitMode === "api") {
        router.push(withBasePath(thankYouPathForConcern(form.addictionConcern)));
      } else {
        setStatus("success");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong while sending your enquiry. Please try again or use WhatsApp/email instead.");
      setStatus("error");
    }
  }

  const formClassName = [
    "lead-form",
    compact ? "compact" : "",
    hideHeading ? "lead-form--section" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      id="enquiry"
      className={formClassName}
      onSubmit={handleSubmit}
      onFocus={markStarted}
      aria-describedby={error ? "lead-form-error" : undefined}
    >
      {hideHeading ? (
        <p className="form-note form-note-inline">Share only what feels safe. Gerald will respond in your preferred channel.</p>
      ) : (
        <div className="form-heading">
          <p className="eyebrow">Private enquiry</p>
          <h2>{formTitle}</h2>
          <p className="form-note">Private, non-emergency enquiry. Share only what feels safe. Gerald will respond in your preferred channel.</p>
        </div>
      )}

      <label>
        <span>Full name</span>
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          minLength={2}
          maxLength={leadFieldMaxLengths.fullName}
          required
        />
      </label>

      <div className="form-grid">
        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            maxLength={leadFieldMaxLengths.email}
            required
          />
        </label>
        <label>
          <span>Phone / WhatsApp number</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            minLength={6}
            maxLength={leadFieldMaxLengths.phone}
            required
          />
        </label>
      </div>

      <div className="form-grid">
        <label>
          <span>Addiction concern</span>
          <select
            name="addictionConcern"
            value={form.addictionConcern}
            onChange={(event) => updateField("addictionConcern", event.target.value)}
            required
          >
            {addictionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Preferred contact method</span>
          <select
            name="preferredContactMethod"
            value={form.preferredContactMethod}
            onChange={(event) => updateField("preferredContactMethod", event.target.value)}
            required
          >
            {contactMethods.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!compact ? (
        <div className="form-grid">
          <label>
            <span>How urgent does support feel today?</span>
            <select name="urgencyLevel" value={form.urgencyLevel} onChange={(event) => updateField("urgencyLevel", event.target.value)} required>
              <option value="low">Low - I am planning ahead</option>
              <option value="medium">Medium - I want help soon</option>
              <option value="high">High - I need support as soon as possible</option>
            </select>
          </label>
          <label>
            <span>Withdrawal or medical support needed now?</span>
            <select name="withdrawalRisk" value={form.withdrawalRisk} onChange={(event) => updateField("withdrawalRisk", event.target.value)} required>
              <option value="none">No current withdrawal concern</option>
              <option value="mild">Mild discomfort</option>
              <option value="moderate">Moderate symptoms</option>
              <option value="severe">Severe symptoms</option>
              <option value="unsure">Not sure</option>
            </select>
          </label>
        </div>
      ) : null}

      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={compact ? 3 : 5}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          maxLength={leadFieldMaxLengths.message}
          placeholder="Briefly share what you would like support with."
        />
      </label>

      {compact ? (
        <button
          type="button"
          className="form-expand-toggle"
          aria-expanded={showOptionalFields}
          aria-controls="lead-form-optional-fields"
          onClick={() => setShowOptionalFields((current) => !current)}
        >
          {showOptionalFields ? "Hide triage & scheduling details" : "Add triage & scheduling details (optional)"}
        </button>
      ) : null}

      <div
        id="lead-form-optional-fields"
        className={compact && !showOptionalFields ? "form-optional-fields is-collapsed" : "form-optional-fields"}
      >
      {compact ? (
        <div className="form-grid">
          <label>
            <span>How urgent does support feel today?</span>
            <select name="urgencyLevel" value={form.urgencyLevel} onChange={(event) => updateField("urgencyLevel", event.target.value)}>
              <option value="low">Low - I am planning ahead</option>
              <option value="medium">Medium - I want help soon</option>
              <option value="high">High - I need support as soon as possible</option>
            </select>
          </label>
          <label>
            <span>Withdrawal or medical support needed now?</span>
            <select name="withdrawalRisk" value={form.withdrawalRisk} onChange={(event) => updateField("withdrawalRisk", event.target.value)}>
              <option value="none">No current withdrawal concern</option>
              <option value="mild">Mild discomfort</option>
              <option value="moderate">Moderate symptoms</option>
              <option value="severe">Severe symptoms</option>
              <option value="unsure">Not sure</option>
            </select>
          </label>
        </div>
      ) : null}
      <div className="form-grid">
        <label>
          <span>Are you currently working with a GP/doctor?</span>
          <select
            name="medicalSupportInvolved"
            value={form.medicalSupportInvolved}
            onChange={(event) => updateField("medicalSupportInvolved", event.target.value)}
            required={!compact}
          >
            <option value="planning">Planning to / open to it</option>
            <option value="yes">Yes, already working with one</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          <span>Best callback window</span>
          <select name="callbackWindow" value={form.callbackWindow} onChange={(event) => updateField("callbackWindow", event.target.value)} required={!compact}>
            <option value="early_morning">Early morning</option>
            <option value="late_morning">Late morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>
      </div>

      <label>
        <span>Where are you right now in this process?</span>
        <select name="readinessStage" value={form.readinessStage} onChange={(event) => updateField("readinessStage", event.target.value)} required={!compact}>
          <option value="exploring">Exploring options</option>
          <option value="ready_now">Ready to start now</option>
          <option value="currently_in_support">Already in support, need extra help</option>
        </select>
      </label>

      <label>
        <span>What would feel like progress for you in the next 2-4 weeks?</span>
        <input
          type="text"
          name="supportGoals"
          value={form.supportGoals}
          onChange={(event) => updateField("supportGoals", event.target.value)}
          maxLength={leadFieldMaxLengths.supportGoals}
          placeholder="Example: fewer urges at night, better routine, less secrecy."
        />
      </label>
      </div>

      <fieldset className="follow-up-consent">
        <legend>Okay to follow up using:</legend>
        <div className="follow-up-options">
          <label className="follow-up-option">
            <input
              type="checkbox"
              checked={form.followUpConsentWhatsApp}
              onChange={(event) => updateField("followUpConsentWhatsApp", event.target.checked)}
            />
            <span>WhatsApp</span>
          </label>
          <label className="follow-up-option">
            <input type="checkbox" checked={form.followUpConsentEmail} onChange={(event) => updateField("followUpConsentEmail", event.target.checked)} />
            <span>Email</span>
          </label>
          <label className="follow-up-option">
            <input type="checkbox" checked={form.followUpConsentPhone} onChange={(event) => updateField("followUpConsentPhone", event.target.checked)} />
            <span>Phone call</span>
          </label>
        </div>
      </fieldset>

      <label className="honeypot" aria-hidden="true">
        <span>Website</span>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          value={form.website}
          onChange={(event) => updateField("website", event.target.value)}
          maxLength={leadFieldMaxLengths.company}
        />
      </label>

      <label className="consent-row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            const checked = event.target.checked;
            setConsent(checked);
            if (checked) {
              pushDataLayer("lead_form_safety_acknowledged", {
                form_name: "addiction_enquiry",
                urgency_level: form.urgencyLevel,
                withdrawal_risk: form.withdrawalRisk,
              });
            }
          }}
          required
        />
        <span>I understand this form is for confidential enquiry support and not emergency medical care.</span>
      </label>

      {error ? <p id="lead-form-error" className="form-error" role="alert">{error}</p> : null}

      <button className="button button-primary form-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

