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
  compact?: boolean;
};

type LeadFormState = {
  fullName: string;
  email: string;
  phone: string;
  addictionConcern: string;
  preferredContactMethod: string;
  message: string;
  company: string;
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
}: LeadFormProps) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState<LeadFormState>({
    fullName: "",
    email: "",
    phone: "",
    addictionConcern: defaultConcern,
    preferredContactMethod: "WhatsApp",
    message: "",
    company: "",
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

  function updateField(field: keyof LeadFormState, value: string) {
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

    const payload = {
      ...form,
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
      });

      if (submitMode === "api") {
        router.push(withBasePath(thankYouPathForConcern(form.addictionConcern)));
      } else {
        setStatus("success");
      }
    } catch {
      setError("Something went wrong while sending your enquiry. Please try again or use WhatsApp/email instead.");
      setStatus("error");
    }
  }

  return (
    <form id="enquiry" className={compact ? "lead-form compact" : "lead-form"} onSubmit={handleSubmit} onFocus={markStarted}>
      <div className="form-heading">
        <p className="eyebrow">Private enquiry</p>
        <h2>{formTitle}</h2>
        <p className="form-note">Private, non-emergency enquiry. Gerald will respond using your preferred contact method.</p>
      </div>

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

      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={compact ? 4 : 5}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          maxLength={leadFieldMaxLengths.message}
          placeholder="Briefly share what you would like support with."
        />
      </label>

      <label className="honeypot" aria-hidden="true">
        <span>Company</span>
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          maxLength={leadFieldMaxLengths.company}
        />
      </label>

      <label className="consent-row">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span>I understand this is an enquiry and not emergency medical support.</span>
      </label>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <button className="button button-primary form-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

