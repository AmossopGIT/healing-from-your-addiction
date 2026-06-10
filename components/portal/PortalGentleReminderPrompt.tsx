"use client";

import { useEffect, useState } from "react";

type PortalGentleReminderPromptProps = {
  hasPushReminders: boolean;
  pushPublicKey?: string;
  subscribeUrl: string;
  serviceWorkerUrl: string;
};

export function PortalGentleReminderPrompt({
  hasPushReminders,
  pushPublicKey,
  subscribeUrl,
  serviceWorkerUrl,
}: PortalGentleReminderPromptProps) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "unsupported">("idle");

  useEffect(() => {
    if (hasPushReminders || !pushPublicKey) return;
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    const dismissed = window.localStorage.getItem("hfya-portal-reminder-dismissed");
    if (!dismissed) setVisible(true);
  }, [hasPushReminders, pushPublicKey]);

  if (!visible || hasPushReminders || !pushPublicKey) return null;

  async function enableReminders() {
    if (!pushPublicKey) return;
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("unsupported");
        return;
      }

      await navigator.serviceWorker.register(serviceWorkerUrl);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
      });

      await fetch(subscribeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          categories: ["gentle_reminders"],
          currentPath: "/portal/",
        }),
      });

      setStatus("done");
      setVisible(false);
    } catch {
      setStatus("unsupported");
    }
  }

  function dismiss() {
    window.localStorage.setItem("hfya-portal-reminder-dismissed", "1");
    setVisible(false);
  }

  return (
    <section className="portal-home-reminder dashboard-panel">
      <h2>Gentle reminders</h2>
      <p>Get an occasional nudge to check in and keep your rhythm—never urgent, never shaming.</p>
      <div className="portal-home-reminder-actions">
        <button type="button" className="button button-primary button-small" onClick={enableReminders} disabled={status === "loading"}>
          {status === "loading" ? "Enabling…" : "Enable gentle reminders"}
        </button>
        <button type="button" className="button button-secondary button-small" onClick={dismiss}>
          Not now
        </button>
      </div>
      {status === "unsupported" ? (
        <p className="dashboard-inline-note">Reminders are not available in this browser right now.</p>
      ) : null}
    </section>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}
