"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { addictionOptions, contactMethods, emailHref, siteConfig, whatsappHref } from "@/lib/constants";
import { submitLead as submitLeadRequest } from "@/lib/leads";
import { pushDataLayer } from "@/lib/tracking";

type ChatStep = "welcome" | "fullName" | "email" | "phone" | "concern" | "preferred" | "message" | "consent" | "success" | "error";

type ChatLeadState = {
  fullName: string;
  email: string;
  phone: string;
  addictionConcern: string;
  preferredContactMethod: string;
  message: string;
};

const initialLead: ChatLeadState = {
  fullName: "",
  email: "",
  phone: "",
  addictionConcern: addictionOptions[0],
  preferredContactMethod: contactMethods[0],
  message: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getAttribution() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  return {
    landing_page: window.location.pathname,
    referrer: document.referrer,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    gclid: params.get("gclid"),
  };
}

export function ChatLeadWidget() {
  const [open, setOpen] = useState(false);
  const [isHiddenForLayout, setIsHiddenForLayout] = useState(false);
  const [step, setStep] = useState<ChatStep>("welcome");
  const [lead, setLead] = useState<ChatLeadState>(initialLead);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const whatsappLink = useMemo(
    () =>
      whatsappHref(
        `Hello Gerald, I would like to make a confidential enquiry about ${lead.addictionConcern || "addiction support"}.`,
      ),
    [lead.addictionConcern],
  );

  function track(event: string, payload: Record<string, unknown> = {}) {
    pushDataLayer(event, {
      link_location: "chat_widget",
      addiction_type: lead.addictionConcern,
      preferred_contact_method: lead.preferredContactMethod,
      ...payload,
    });
  }

  function openWidget() {
    setOpen(true);
    track("chat_widget_open");
  }

  function closeWidget() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function startGuidedChat() {
    setStep("fullName");
    setError("");
    setInputValue(lead.fullName);
    track("chat_widget_start");
  }

  function completeStep(stepName: string) {
    track("chat_widget_step_complete", { step_name: stepName });
  }

  function goToHandoff(kind: "whatsapp" | "email") {
    track(kind === "whatsapp" ? "chat_widget_handoff_whatsapp" : "chat_widget_handoff_email");
  }

  function updateLead(field: keyof ChatLeadState, value: string) {
    setLead((current) => ({ ...current, [field]: value }));
  }

  function advanceFromText() {
    const value = inputValue.trim();
    setError("");

    if (step === "fullName") {
      if (!value) {
        setError("Please add your name so Gerald knows who to respond to.");
        return;
      }

      updateLead("fullName", value);
      completeStep("fullName");
      setInputValue(lead.email);
      setStep("email");
      return;
    }

    if (step === "email") {
      if (!isValidEmail(value)) {
        setError("Please enter a valid email address.");
        return;
      }

      updateLead("email", value);
      completeStep("email");
      setInputValue(lead.phone);
      setStep("phone");
      return;
    }

    if (step === "phone") {
      if (!value) {
        setError("Please add a phone or WhatsApp number.");
        return;
      }

      updateLead("phone", value);
      completeStep("phone");
      setInputValue("");
      setStep("concern");
      return;
    }

    if (step === "message") {
      updateLead("message", value);
      completeStep("message");
      setInputValue("");
      setStep("consent");
    }
  }

  async function submitLead() {
    setIsSubmitting(true);
    setError("");
    track("chat_widget_submit_attempt");

    const payload = {
      ...lead,
      consentEmergencyAcknowledged: true,
      sourcePage: typeof window === "undefined" ? "" : window.location.pathname,
      company: "",
      ...getAttribution(),
    };

    try {
      await submitLeadRequest(payload);

      track("chat_widget_submit_success");
      setStep("success");
    } catch {
      track("chat_widget_submit_error");
      setStep("error");
      setError("Something went wrong while sending your enquiry. You can still use WhatsApp or email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetChat() {
    setLead(initialLead);
    setInputValue("");
    setError("");
    setStep("welcome");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    advanceFromText();
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      closeWidget();
    }
  }

  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
  }, [open, step]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const footer = document.querySelector(".site-footer-wrap");
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const footerEntry = entries.find((entry) => entry.target === footer);
        if (!footerEntry) return;

        const shouldHide = footerEntry.isIntersecting;
        setIsHiddenForLayout(shouldHide);
        if (shouldHide) {
          setOpen(false);
        }
      },
      {
        // Hide only when the footer enters the lower viewport (fixed header is always "intersecting").
        rootMargin: "0px 0px -12% 0px",
        threshold: 0,
      },
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const showTextInput = step === "fullName" || step === "email" || step === "phone" || step === "message";

  return (
    <div className={`chat-widget${isHiddenForLayout ? " is-hidden" : ""}`} aria-live="polite">
      {open ? (
        <section
          className="chat-widget-panel"
          aria-label="Confidential lead chat"
          ref={panelRef}
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
        >
          <div className="chat-widget-header">
            <div>
              <p className="chat-widget-kicker">Private chat</p>
              <h2>Confidential enquiry</h2>
            </div>
            <button type="button" className="chat-widget-close" aria-label="Close chat" onClick={closeWidget}>
              Close
            </button>
          </div>

          <div className="chat-widget-body">
            <div className="chat-bubble chat-bubble-assistant">
              Hello, I can help you start a private enquiry in a few quick steps.
            </div>

            {step === "welcome" ? (
              <div className="chat-widget-options">
                <button type="button" className="chat-chip chat-chip-primary" onClick={startGuidedChat}>
                  Start quick chat
                </button>
                <a className="chat-chip chat-chip-whatsapp" href={whatsappLink} onClick={() => goToHandoff("whatsapp")}>
                  WhatsApp now
                </a>
                <a className="chat-chip" href={emailHref()} onClick={() => goToHandoff("email")}>
                  Email Gerald
                </a>
              </div>
            ) : null}

            {lead.fullName ? <div className="chat-bubble chat-bubble-user">My name is {lead.fullName}.</div> : null}
            {lead.email ? <div className="chat-bubble chat-bubble-user">Email: {lead.email}</div> : null}
            {lead.phone ? <div className="chat-bubble chat-bubble-user">Phone / WhatsApp: {lead.phone}</div> : null}
            {step === "concern" || step === "preferred" || step === "message" || step === "consent" || step === "success" ? (
              <div className="chat-bubble chat-bubble-user">Concern: {lead.addictionConcern}</div>
            ) : null}
            {step === "message" || step === "consent" || step === "success" ? (
              <div className="chat-bubble chat-bubble-user">Preferred contact: {lead.preferredContactMethod}</div>
            ) : null}
            {lead.message && (step === "consent" || step === "success") ? (
              <div className="chat-bubble chat-bubble-user">{lead.message}</div>
            ) : null}

            {step === "fullName" ? <div className="chat-bubble chat-bubble-assistant">What is your name?</div> : null}
            {step === "email" ? <div className="chat-bubble chat-bubble-assistant">What email should Gerald use?</div> : null}
            {step === "phone" ? <div className="chat-bubble chat-bubble-assistant">What phone or WhatsApp number can he use?</div> : null}

            {step === "concern" ? (
              <>
                <div className="chat-bubble chat-bubble-assistant">What would you like support with?</div>
                <div className="chat-widget-options">
                  {addictionOptions.map((option) => (
                    <button
                      type="button"
                      className="chat-chip"
                      key={option}
                      onClick={() => {
                        updateLead("addictionConcern", option);
                        completeStep("addictionConcern");
                        setStep("preferred");
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === "preferred" ? (
              <>
                <div className="chat-bubble chat-bubble-assistant">How would you prefer Gerald to respond?</div>
                <div className="chat-widget-options">
                  {contactMethods.map((method) => (
                    <button
                      type="button"
                      className="chat-chip"
                      key={method}
                      onClick={() => {
                        updateLead("preferredContactMethod", method);
                        completeStep("preferredContactMethod");
                        setInputValue("");
                        setStep("message");
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === "message" ? (
              <div className="chat-bubble chat-bubble-assistant">
                Add a short note if you want. You can also skip this.
              </div>
            ) : null}

            {step === "consent" ? (
              <>
                <div className="chat-bubble chat-bubble-assistant">
                  Last step: please confirm this is an enquiry and not emergency medical support.
                </div>
                <div className="chat-actions">
                  <button type="button" className="button button-primary" onClick={submitLead} disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "I understand, send enquiry"}
                  </button>
                </div>
              </>
            ) : null}

            {step === "success" ? (
              <>
                <div className="chat-bubble chat-bubble-assistant">
                  Thank you. Your enquiry has been sent. You can also continue through WhatsApp or email.
                </div>
                <div className="chat-actions">
                  <a className="button button-whatsapp" href={whatsappLink} onClick={() => goToHandoff("whatsapp")}>
                    Continue on WhatsApp
                  </a>
                  <a className="button button-secondary" href={emailHref()} onClick={() => goToHandoff("email")}>
                    Email Gerald
                  </a>
                </div>
              </>
            ) : null}

            {step === "error" ? (
              <>
                <div className="chat-bubble chat-bubble-assistant">{error}</div>
                <div className="chat-actions">
                  <button type="button" className="button button-secondary" onClick={() => setStep("consent")}>
                    Try again
                  </button>
                  <a className="button button-whatsapp" href={whatsappLink} onClick={() => goToHandoff("whatsapp")}>
                    WhatsApp Gerald
                  </a>
                </div>
              </>
            ) : null}
          </div>

          {error && step !== "error" ? <p className="chat-widget-error">{error}</p> : null}

          {showTextInput ? (
            <form className="chat-input-row" onSubmit={handleSubmit}>
              {step === "message" ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Briefly share what you would like support with."
                  rows={3}
                />
              ) : (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={step === "fullName" ? "Your name" : step === "email" ? "Email address" : "Phone / WhatsApp"}
                />
              )}
              <div className="chat-input-actions">
                {step === "message" ? (
                  <button type="button" className="button button-secondary" onClick={() => setStep("consent")}>
                    Skip
                  </button>
                ) : null}
                <button type="submit" className="button button-primary">
                  {step === "message" ? "Continue" : "Next"}
                </button>
              </div>
            </form>
          ) : null}

          {step !== "welcome" && step !== "success" ? (
            <button type="button" className="chat-widget-reset" onClick={resetChat}>
              Start over
            </button>
          ) : null}
        </section>
      ) : null}

      <button
        type="button"
        className="chat-widget-launcher"
        aria-label="Open confidential chat"
        aria-expanded={open}
        onClick={open ? closeWidget : openWidget}
        ref={launcherRef}
      >
        <svg className="chat-widget-icon" viewBox="0 0 24 24" role="presentation" aria-hidden="true" focusable="false">
          <path
            d="M12 4C7.03 4 3 7.13 3 11c0 3.87 4.03 7 9 7 0.65 0 1.28-0.06 1.89-0.17 1.1 0.84 2.5 1.4 4.11 1.55-0.54-0.71-0.92-1.67-1.04-2.71C19.42 15.39 21 13.34 21 11c0-3.87-4.03-7-9-7z"
            fill="currentColor"
          />
        </svg>
        <span className="visually-hidden">Open private enquiry chat</span>
      </button>
    </div>
  );
}
