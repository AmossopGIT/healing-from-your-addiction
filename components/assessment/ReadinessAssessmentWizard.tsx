"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  READINESS_DRAFT_STORAGE_KEY,
  READINESS_DRAFT_TOKEN_KEY,
  READINESS_ASSESSMENT_VERSION,
  computeReadinessScores,
  isAssessmentComplete,
  readinessFoundations,
  readinessFoundationLabels,
  readinessGateQuestions,
  readinessPrivacySummary,
  readinessSafetyQuestions,
  readinessScaleLabels,
  type ReadinessDraftPayload,
  type ReadinessFoundationId,
  type ReadinessResponses,
} from "@/content/readinessAssessment";
import { ReadinessAccountGate } from "@/components/assessment/ReadinessAccountGate";
import { ReadinessAssessmentResults } from "@/components/assessment/ReadinessAssessmentResults";
import {
  claimReadinessDraft,
  saveAnonymousReadinessDraft,
  saveReadinessAssessment,
} from "@/lib/dashboard/readinessAssessmentActions";
import { pushDataLayer } from "@/lib/tracking";

type WizardPhase = "intro" | "scale" | "gate" | "safety" | "privacy" | "account_gate" | "results";

type ReadinessAssessmentWizardProps = {
  isAuthenticatedClient: boolean;
  initialResponses?: ReadinessResponses;
  initialCompleted?: boolean;
  mode?: "public" | "portal";
  resumeDraft?: boolean;
  draftTokenFromUrl?: string;
  history?: Array<{
    id: string;
    completed_at: string | null;
    readiness_index: number | null;
    readiness_band: string;
    attempt_number: number;
  }>;
};

function loadLocalDraft(): ReadinessDraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(READINESS_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadinessDraftPayload;
    if (parsed.version !== READINESS_ASSESSMENT_VERSION || !parsed.responses) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistLocalDraft(responses: ReadinessResponses, draftToken?: string) {
  if (typeof window === "undefined") return;
  const payload: ReadinessDraftPayload = {
    version: READINESS_ASSESSMENT_VERSION,
    responses,
    savedAt: new Date().toISOString(),
    draftToken,
  };
  window.sessionStorage.setItem(READINESS_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  if (draftToken) {
    window.sessionStorage.setItem(READINESS_DRAFT_TOKEN_KEY, draftToken);
  }
}

function clearLocalDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(READINESS_DRAFT_STORAGE_KEY);
  window.sessionStorage.removeItem(READINESS_DRAFT_TOKEN_KEY);
}

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(READINESS_DRAFT_TOKEN_KEY) ?? "";
}

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function getScaleBandLabel(value: number) {
  if (value <= 3) return readinessScaleLabels.low;
  if (value <= 6) return readinessScaleLabels.mid;
  if (value <= 8) return readinessScaleLabels.high;
  return readinessScaleLabels.full;
}

const scaleItems = readinessFoundations.flatMap((foundation) =>
  foundation.scaleItems.map((item) => ({
    ...item,
    foundationTitle: foundation.title,
    foundationEyebrow: foundation.eyebrow,
    foundationIntro: foundation.intro,
  })),
);

const foundationOrder: ReadinessFoundationId[] = readinessFoundations.map((item) => item.id);

export function ReadinessAssessmentWizard({
  isAuthenticatedClient,
  initialResponses = {},
  initialCompleted = false,
  mode = "public",
  resumeDraft = false,
  draftTokenFromUrl = "",
  history = [],
}: ReadinessAssessmentWizardProps) {
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phase, setPhase] = useState<WizardPhase>(initialCompleted ? "results" : "intro");
  const [scaleIndex, setScaleIndex] = useState(0);
  const [gateIndex, setGateIndex] = useState(0);
  const [safetyIndex, setSafetyIndex] = useState(0);
  const [responses, setResponses] = useState<ReadinessResponses>(initialResponses);
  const [draftToken, setDraftToken] = useState("");
  const [error, setError] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const [pending, setPending] = useState(false);
  const [showRetake, setShowRetake] = useState(false);

  const scores = useMemo(() => computeReadinessScores(responses), [responses]);
  const currentScale = scaleItems[scaleIndex];
  const currentGate = readinessGateQuestions[gateIndex];
  const currentSafety = readinessSafetyQuestions[safetyIndex];
  const selectedScaleValue =
    currentScale && typeof responses[currentScale.id] === "number" ? Number(responses[currentScale.id]) : null;

  const questionSteps = scaleItems.length + readinessGateQuestions.length + readinessSafetyQuestions.length;
  const totalSteps = 1 + questionSteps + 1 + (isAuthenticatedClient ? 0 : 1);
  const currentStepNumber =
    phase === "intro"
      ? 1
      : phase === "scale"
        ? 2 + scaleIndex
        : phase === "gate"
          ? 2 + scaleItems.length + gateIndex
          : phase === "safety"
            ? 2 + scaleItems.length + readinessGateQuestions.length + safetyIndex
            : phase === "privacy"
              ? totalSteps - (isAuthenticatedClient ? 0 : 1)
              : phase === "account_gate"
                ? totalSteps
                : totalSteps;
  const progressPercent = Math.round(((currentStepNumber - 1) / Math.max(totalSteps - 1, 1)) * 100);

  const activeFoundationId: ReadinessFoundationId | null =
    phase === "scale" && currentScale
      ? currentScale.foundationId
      : phase === "gate" && currentGate
        ? currentGate.foundationId
        : null;

  const progressContext =
    phase === "intro"
      ? "Overview"
      : phase === "scale" && currentScale
        ? `${currentScale.foundationTitle} · question ${scaleIndex + 1} of ${scaleItems.length}`
        : phase === "gate"
          ? `Readiness check · ${gateIndex + 1} of ${readinessGateQuestions.length}`
          : phase === "safety"
            ? `Safety · ${safetyIndex + 1} of ${readinessSafetyQuestions.length}`
            : phase === "privacy"
              ? "Privacy consent"
              : phase === "account_gate"
                ? "Save & view results"
                : "Results";

  useEffect(() => {
    const local = loadLocalDraft();
    if (draftTokenFromUrl) {
      setDraftToken(draftTokenFromUrl);
      window.sessionStorage.setItem(READINESS_DRAFT_TOKEN_KEY, draftTokenFromUrl);
    } else if (local?.draftToken) {
      setDraftToken(local.draftToken);
    } else {
      setDraftToken(getStoredToken());
    }
  }, [draftTokenFromUrl]);

  useEffect(() => {
    if (!resumeDraft) return;
    const token = draftTokenFromUrl || loadLocalDraft()?.draftToken || getStoredToken();
    if (token && isAuthenticatedClient) {
      void claimStoredDraft(token);
      return;
    }
    const local = loadLocalDraft();
    if (local?.responses && Object.keys(initialResponses).length === 0) {
      setResponses(local.responses);
      if (isAssessmentComplete(local.responses) && isAuthenticatedClient) {
        void submitAuthenticated(local.responses);
      } else if (!isAuthenticatedClient) {
        setPhase("account_gate");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeDraft, isAuthenticatedClient, draftTokenFromUrl]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase, scaleIndex, gateIndex, safetyIndex]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "scale" || !currentScale) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)) {
        return;
      }
      const key = event.key;
      const value = key === "0" ? 10 : Number(key);
      if (!Number.isInteger(value) || value < 1 || value > 10) return;
      event.preventDefault();
      chooseScaleValue(value, true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentScale?.id, scaleIndex, draftToken]);

  async function syncServerDraft(nextResponses: ReadinessResponses) {
    const formData = new FormData();
    formData.set("responsesJson", JSON.stringify(nextResponses));
    if (draftToken) formData.set("draftToken", draftToken);
    const result = await saveAnonymousReadinessDraft(formData);
    if (result.token) {
      setDraftToken(result.token);
      persistLocalDraft(nextResponses, result.token);
    }
    return result;
  }

  async function claimStoredDraft(token: string) {
    setPending(true);
    setError("");
    const formData = new FormData();
    formData.set("draftToken", token);
    formData.set("redirectTo", "/portal/readiness/");
    try {
      await claimReadinessDraft(formData);
      clearLocalDraft();
    } catch (error) {
      if (isNextRedirectError(error)) {
        clearLocalDraft();
        throw error;
      }
      setPending(false);
      setError("We could not restore your saved draft. You can continue from your local answers if available.");
      const local = loadLocalDraft();
      if (local?.responses) {
        setResponses(local.responses);
        setPhase(isAssessmentComplete(local.responses) ? "results" : "intro");
      }
    }
  }

  async function submitAuthenticated(nextResponses: ReadinessResponses, action: "submit" | "save" = "submit") {
    setPending(true);
    setError("");
    pushDataLayer("readiness_assessment_save_attempt", { mode, action });
    const formData = new FormData();
    formData.set("action", action);
    formData.set("responsesJson", JSON.stringify(nextResponses));
    formData.set("redirectTo", "/portal/readiness/");
    try {
      await saveReadinessAssessment(formData);
      if (action === "submit") {
        clearLocalDraft();
        setPending(false);
        setPhase("results");
      }
      pushDataLayer("readiness_assessment_save_success", { mode, action });
    } catch (error) {
      if (isNextRedirectError(error)) {
        if (action === "submit") {
          clearLocalDraft();
          setPending(false);
          setPhase("results");
          pushDataLayer("readiness_assessment_save_success", { mode, action });
          // Stay on this page (public or portal) and show results; portal banner refresh is optional.
          return;
        }
        pushDataLayer("readiness_assessment_save_success", { mode, action });
        throw error;
      }
      setPending(false);
      if (action === "submit") setPhase("results");
      pushDataLayer("readiness_assessment_save_error", { mode, action });
      setError(action === "submit" ? "Results are ready, but saving failed. Please try again." : "Progress could not be saved right now.");
    }
  }

  function startAssessment() {
    if (!startedRef.current) {
      startedRef.current = true;
      pushDataLayer("readiness_assessment_start", { mode });
    }

    const firstUnanswered = scaleItems.findIndex((item) => typeof responses[item.id] !== "number");
    if (firstUnanswered >= 0) {
      setScaleIndex(firstUnanswered);
      setPhase("scale");
    } else if (readinessGateQuestions.some((item) => responses[item.id] == null || responses[item.id] === "")) {
      const gateStart = readinessGateQuestions.findIndex(
        (item) =>
          (item.kind === "yes_no" && responses[item.id] !== "yes" && responses[item.id] !== "no") ||
          (item.kind === "textarea" && (typeof responses[item.id] !== "string" || !String(responses[item.id]).trim())),
      );
      setGateIndex(Math.max(0, gateStart));
      setPhase("gate");
    } else {
      setScaleIndex(0);
      setPhase("scale");
    }
    setError("");
    setSaveNote("");
  }

  function updateResponse(key: string, value: number | string | boolean) {
    setResponses((prev) => {
      const next = { ...prev, [key]: value };
      persistLocalDraft(next, draftToken || undefined);
      return next;
    });
    setError("");
    setSaveNote("");
  }

  function chooseScaleValue(value: number, autoAdvance = false) {
    if (!currentScale) return;
    updateResponse(currentScale.id, value);
    if (!autoAdvance) return;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      goNextFromScale(value);
    }, 280);
  }

  async function saveProgress() {
    setPending(true);
    setError("");
    setSaveNote("");
    if (isAuthenticatedClient) {
      await submitAuthenticated(responses, "save");
      return;
    }
    const result = await syncServerDraft(responses);
    setPending(false);
    if (result.error) {
      setError("Progress could not be saved to the server. It remains on this device for now.");
      return;
    }
    setSaveNote("Progress saved. You can leave and continue later on this device.");
  }

  function goNextFromScale(forcedValue?: number) {
    if (!currentScale) return;
    const value = forcedValue ?? responses[currentScale.id];
    if (typeof value !== "number") {
      setError("Please choose a rating from 1 to 10 before continuing.");
      return;
    }
    pushDataLayer("readiness_assessment_step_complete", { mode, step: currentScale.id });
    if (scaleIndex < scaleItems.length - 1) {
      setScaleIndex((value) => value + 1);
      return;
    }
    setPhase("gate");
    setGateIndex(0);
  }

  function goNextFromGate() {
    if (!currentGate) return;
    const value = responses[currentGate.id];
    if (currentGate.kind === "yes_no" && value !== "yes" && value !== "no") {
      setError("Please choose yes or no before continuing.");
      return;
    }
    if (currentGate.kind === "textarea" && (typeof value !== "string" || !value.trim())) {
      setError("Please share a short reflection before continuing.");
      return;
    }
    pushDataLayer("readiness_assessment_step_complete", { mode, step: currentGate.id });
    if (gateIndex < readinessGateQuestions.length - 1) {
      setGateIndex((value) => value + 1);
      return;
    }
    setPhase("safety");
    setSafetyIndex(0);
  }

  function goNextFromSafety() {
    if (!currentSafety) return;
    const value = responses[currentSafety.id];
    if (value !== true && value !== false) {
      setError("Please answer this safety question before continuing.");
      return;
    }
    pushDataLayer("readiness_assessment_step_complete", { mode, step: currentSafety.id });
    if (safetyIndex < readinessSafetyQuestions.length - 1) {
      setSafetyIndex((value) => value + 1);
      return;
    }
    setPhase("privacy");
  }

  async function finishFromPrivacy() {
    if (responses.privacy_consent !== true) {
      setError("Please confirm privacy consent before continuing.");
      return;
    }
    if (!isAssessmentComplete(responses)) {
      setError("Please complete every question before continuing.");
      return;
    }
    persistLocalDraft(responses, draftToken || undefined);

    if (!isAuthenticatedClient) {
      setPending(true);
      const result = await syncServerDraft(responses);
      setPending(false);
      if (result.error) {
        setError("We could not store a recoverable draft on the server. You can still continue, but use the same device if possible.");
      }
      pushDataLayer("readiness_assessment_account_gate", { mode });
      setPhase("account_gate");
      return;
    }

    await submitAuthenticated(responses, "submit");
  }

  function beginRetake() {
    setShowRetake(true);
    setPhase("intro");
    setScaleIndex(0);
    setGateIndex(0);
    setSafetyIndex(0);
    setResponses({});
    setError("");
    setSaveNote("");
    clearLocalDraft();
    setDraftToken("");
  }

  function goBack() {
    setError("");
    setSaveNote("");
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (phase === "privacy") {
      setPhase("safety");
      setSafetyIndex(readinessSafetyQuestions.length - 1);
      return;
    }
    if (phase === "safety" && safetyIndex === 0) {
      setPhase("gate");
      setGateIndex(readinessGateQuestions.length - 1);
      return;
    }
    if (phase === "safety") {
      setSafetyIndex((value) => Math.max(0, value - 1));
      return;
    }
    if (phase === "gate" && gateIndex === 0) {
      setPhase("scale");
      setScaleIndex(scaleItems.length - 1);
      return;
    }
    if (phase === "gate") {
      setGateIndex((value) => Math.max(0, value - 1));
      return;
    }
    if (scaleIndex === 0) {
      setPhase("intro");
      return;
    }
    setScaleIndex((value) => Math.max(0, value - 1));
  }

  if (phase === "results" || (initialCompleted && !showRetake)) {
    return (
      <div className="readiness-wizard-shell">
        {error ? <p className="dashboard-inline-note dashboard-error-note">{error}</p> : null}
        <ReadinessAssessmentResults responses={responses} scores={scores} history={history} />
        {mode === "portal" || isAuthenticatedClient ? (
          <div className="need-help-wizard-actions readiness-wizard-actions">
            <button type="button" className="button button-secondary" onClick={beginRetake}>
              Retake assessment
            </button>
            {!scores.urgentSafety ? (
              <Link href="/need-help/" className="button button-primary">
                Talk with Gerald
              </Link>
            ) : (
              <Link href="/medical-disclaimer/" className="button button-primary">
                Read medical disclaimer
              </Link>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  const resumePath = `/portal/readiness/?resume=1${draftToken ? `&draft=${encodeURIComponent(draftToken)}` : ""}`;
  const showNav = phase === "scale" || phase === "gate" || phase === "safety" || phase === "privacy";

  return (
    <section className="need-help-wizard readiness-assessment-wizard" id="readiness-assessment" aria-live="polite">
      <div className="need-help-wizard-progress">
        <div className="readiness-progress-meta">
          <p className="need-help-wizard-progress-label">{progressContext}</p>
          <p className="readiness-progress-percent">{progressPercent}%</p>
        </div>
        <div className="need-help-wizard-progress-bar" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        {phase !== "intro" && phase !== "account_gate" ? (
          <ol className="readiness-foundation-track" aria-label="Assessment foundations">
            {foundationOrder.map((foundationId) => {
              const foundation = readinessFoundations.find((item) => item.id === foundationId);
              const isActive = activeFoundationId === foundationId;
              const answeredCount =
                foundation?.scaleItems.filter((item) => typeof responses[item.id] === "number").length ?? 0;
              const total = foundation?.scaleItems.length ?? 0;
              const isDone = answeredCount === total && total > 0;
              return (
                <li key={foundationId} className={isActive ? "is-active" : isDone ? "is-done" : undefined}>
                  <span>{readinessFoundationLabels[foundationId]}</span>
                </li>
              );
            })}
            <li className={phase === "gate" || phase === "safety" || phase === "privacy" ? "is-active" : undefined}>
              <span>Checks</span>
            </li>
          </ol>
        ) : null}
      </div>

      {phase === "intro" ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">
            {mode === "portal" ? "Client portal" : "Public assessment"} · Addiction Healing Readiness Assessment
          </p>
          <h2 ref={headingRef} tabIndex={-1}>
            Am I ready to heal?
          </h2>
          <p className="need-help-wizard-lead">
            A calm reflection on Commitment, Self-Awareness, and Emotional Capacity — not an admission test, diagnosis,
            or crisis service. About 8–12 minutes. You can take this on the public site or in your client portal.
          </p>
          <div className="readiness-scale-legend" aria-label="Rating guide">
            {Object.values(readinessScaleLabels).map((label) => (
              <span key={label} className="readiness-legend-chip">
                {label}
              </span>
            ))}
          </div>
          <p className="need-help-wizard-hint">
            A score below 7 on any foundation usually means that area may need support first. You can save progress and
            continue later.
          </p>
          {isAuthenticatedClient ? (
            <p className="readiness-trust-note">
              You are signed in. When you finish, results save to your profile and show straight away — no extra account
              step.
            </p>
          ) : (
            <p className="readiness-trust-note">
              Answer first as a guest. A free private account is only needed before results are shown and saved.
            </p>
          )}
          <div className="need-help-wizard-actions">
            <button type="button" className="button button-primary" onClick={startAssessment}>
              {Object.keys(responses).length > 0 ? "Continue assessment" : "Begin free assessment"}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "scale" && currentScale ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">
            {currentScale.foundationEyebrow} · {currentScale.foundationTitle}
            {currentScale.isOverall ? " · Confirmation" : ""}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="readiness-question-heading">
            {currentScale.label}
          </h2>
          {scaleIndex === 0 || scaleItems[scaleIndex - 1]?.foundationId !== currentScale.foundationId ? (
            <p className="need-help-wizard-lead">{currentScale.foundationIntro}</p>
          ) : null}
          <div className="readiness-scale-grid" role="group" aria-label="Rating from 1 to 10">
            {Array.from({ length: 10 }, (_, index) => {
              const value = index + 1;
              const selected = responses[currentScale.id] === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`readiness-scale-option${selected ? " is-selected" : ""}`}
                  onClick={() => chooseScaleValue(value, true)}
                  aria-pressed={selected}
                  aria-label={`Rate ${value} out of 10`}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <div className="readiness-scale-bands" aria-hidden="true">
            <span>May need support</span>
            <span>Developing</span>
            <span>Mostly ready</span>
            <span>Fully ready</span>
          </div>
          <p className="need-help-wizard-hint">
            {selectedScaleValue
              ? getScaleBandLabel(selectedScaleValue)
              : "Tap a number, or press 1–9 / 0 for 10 on your keyboard."}
          </p>
        </div>
      ) : null}

      {phase === "gate" && currentGate ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">The three readiness questions · {readinessFoundationLabels[currentGate.foundationId]}</p>
          <h2 ref={headingRef} tabIndex={-1} className="readiness-question-heading">
            {currentGate.label}
          </h2>
          {currentGate.hint ? <p className="need-help-wizard-hint">{currentGate.hint}</p> : null}
          {currentGate.kind === "yes_no" ? (
            <div className="readiness-choice-grid" role="group" aria-label={currentGate.label}>
              {(["yes", "no"] as const).map((option) => {
                const selected = responses[currentGate.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`readiness-choice-option${selected ? " is-selected" : ""}`}
                    onClick={() => updateResponse(currentGate.id, option)}
                    aria-pressed={selected}
                  >
                    <strong>{option === "yes" ? "Yes" : "Not yet"}</strong>
                    <span>{option === "yes" ? "I am willing / ready" : "This may need support first"}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="form-field">
              <span>Your reflection</span>
              <textarea
                rows={5}
                value={typeof responses[currentGate.id] === "string" ? String(responses[currentGate.id]) : ""}
                onChange={(event) => updateResponse(currentGate.id, event.target.value)}
                maxLength={2000}
                placeholder="A few honest sentences are enough."
              />
            </label>
          )}
        </div>
      ) : null}

      {phase === "safety" && currentSafety ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">Safety screening</p>
          <h2 ref={headingRef} tabIndex={-1} className="readiness-question-heading">
            {currentSafety.label}
          </h2>
          <p className="need-help-wizard-hint">{currentSafety.detail}</p>
          <div className="readiness-choice-grid" role="group" aria-label={currentSafety.label}>
            <button
              type="button"
              className={`readiness-choice-option${responses[currentSafety.id] === true ? " is-selected" : ""}`}
              onClick={() => updateResponse(currentSafety.id, true)}
              aria-pressed={responses[currentSafety.id] === true}
            >
              <strong>Yes</strong>
              <span>This applies to me right now</span>
            </button>
            <button
              type="button"
              className={`readiness-choice-option${responses[currentSafety.id] === false ? " is-selected" : ""}`}
              onClick={() => updateResponse(currentSafety.id, false)}
              aria-pressed={responses[currentSafety.id] === false}
            >
              <strong>No</strong>
              <span>This does not apply</span>
            </button>
          </div>
        </div>
      ) : null}

      {phase === "privacy" ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">Privacy and consent</p>
          <h2 ref={headingRef} tabIndex={-1}>
            Before we save your assessment
          </h2>
          <ul className="need-help-wizard-points">
            {readinessPrivacySummary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <label className="form-check readiness-consent-check">
            <input
              type="checkbox"
              checked={responses.privacy_consent === true}
              onChange={(event) => updateResponse("privacy_consent", event.target.checked)}
            />
            <span>I understand how my answers are stored, reviewed, retained, and can be deleted on request.</span>
          </label>
        </div>
      ) : null}

      {phase === "account_gate" ? (
        <div className="need-help-wizard-panel">
          <p className="eyebrow">Almost done</p>
          <h2 ref={headingRef} tabIndex={-1}>
            Save to your profile to see results
          </h2>
          <p className="need-help-wizard-lead">
            Your answers are ready. Create a free client account or sign in with an existing one — results save to your
            private profile for you and Gerald.
          </p>
          <ReadinessAccountGate draftToken={draftToken} responses={responses} resumePath={resumePath} />
        </div>
      ) : null}

      {error ? (
        <p className="dashboard-inline-note dashboard-error-note readiness-feedback" role="alert">
          {error}
        </p>
      ) : null}
      {saveNote ? (
        <p className="dashboard-inline-note dashboard-success-note readiness-feedback" role="status">
          {saveNote}
        </p>
      ) : null}

      {showNav ? (
        <div className="readiness-wizard-nav">
          <button type="button" className="button button-secondary" disabled={pending} onClick={goBack}>
            Back
          </button>
          <button type="button" className="button button-secondary" disabled={pending} onClick={() => void saveProgress()}>
            {pending ? "Saving…" : "Save progress"}
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={pending}
            onClick={() => {
              if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
              if (phase === "scale") goNextFromScale();
              else if (phase === "gate") goNextFromGate();
              else if (phase === "safety") goNextFromSafety();
              else void finishFromPrivacy();
            }}
          >
            {phase === "privacy"
              ? isAuthenticatedClient
                ? pending
                  ? "Saving…"
                  : "See my results"
                : "Continue"
              : "Continue"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
