"use client";

import { useEffect, useMemo, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PushCategoryId = "site_updates" | "new_resources" | "gentle_reminders";

type PwaClientManagerProps = {
  currentPath: string;
  serviceWorkerUrl: string;
  subscribeUrl: string;
  unsubscribeUrl: string;
  pushPublicKey?: string;
};

const INSTALL_DISMISS_KEY = "hfya-pwa-install-dismissed";
const PUSH_DISMISS_KEY = "hfya-pwa-push-dismissed";
const shouldEnablePwaClient =
  process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_PWA_DEV === "true";

const pushCategories: Array<{
  id: PushCategoryId;
  label: string;
  description: string;
}> = [
  {
    id: "site_updates",
    label: "Site updates",
    description: "Important changes and new support features.",
  },
  {
    id: "new_resources",
    label: "New resources",
    description: "Fresh articles, guides, and case-study style content.",
  },
  {
    id: "gentle_reminders",
    label: "Gentle reminders",
    description: "Occasional check-ins and encouragement.",
  },
];

const defaultPushSelections: Record<PushCategoryId, boolean> = {
  site_updates: true,
  new_resources: true,
  gentle_reminders: false,
};

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

export function PwaClientManager({
  currentPath,
  serviceWorkerUrl,
  subscribeUrl,
  unsubscribeUrl,
  pushPublicKey,
}: PwaClientManagerProps) {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(true);
  const [pushDismissed, setPushDismissed] = useState(true);
  const [hasEngaged, setHasEngaged] = useState(false);
  const [pushSelections, setPushSelections] = useState(defaultPushSelections);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [pushStatus, setPushStatus] = useState<"idle" | "subscribing" | "subscribed" | "error">("idle");
  const [pushError, setPushError] = useState("");

  const supportsPush = useMemo(
    () =>
      Boolean(
        pushPublicKey &&
          typeof window !== "undefined" &&
          "Notification" in window &&
          "serviceWorker" in navigator &&
          "PushManager" in window,
      ),
    [pushPublicKey],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setInstallDismissed(window.localStorage.getItem(INSTALL_DISMISS_KEY) === "1");
    setPushDismissed(window.localStorage.getItem(PUSH_DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const handleStandaloneChange = () => {
      const isStandaloneMode =
        standaloneQuery.matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    handleStandaloneChange();

    const legacyQuery = standaloneQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    if (typeof standaloneQuery.addEventListener === "function") {
      standaloneQuery.addEventListener("change", handleStandaloneChange);
      return () => standaloneQuery.removeEventListener("change", handleStandaloneChange);
    }

    legacyQuery.addListener?.(handleStandaloneChange);
    return () => legacyQuery.removeListener?.(handleStandaloneChange);
  }, []);

  useEffect(() => {
    if (!shouldEnablePwaClient || typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let mounted = true;

    navigator.serviceWorker
      .register(serviceWorkerUrl)
      .then(async (registration) => {
        await navigator.serviceWorker.ready;

        if (!mounted) {
          return;
        }

        if (supportsPush) {
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            setPushStatus("subscribed");
          }
          setPushPermission(Notification.permission);
        }
      })
      .catch(() => {
        if (supportsPush) {
          setPushPermission(Notification.permission);
        }
      });

    return () => {
      mounted = false;
    };
  }, [serviceWorkerUrl, supportsPush]);

  useEffect(() => {
    if (typeof window === "undefined" || installDismissed || isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, [installDismissed, isStandalone]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId = window.setTimeout(() => setHasEngaged(true), 12000);

    const handleScroll = () => {
      if (window.scrollY > 520) {
        setHasEngaged(true);
        window.clearTimeout(timeoutId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function dismissInstallPrompt() {
    setInstallDismissed(true);
    setInstallEvent(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    }
  }

  function dismissPushPrompt() {
    setPushDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PUSH_DISMISS_KEY, "1");
    }
  }

  async function installApp() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const result = await installEvent.userChoice;

    if (result.outcome === "accepted") {
      dismissInstallPrompt();
    }
  }

  async function enablePushNotifications() {
    if (!supportsPush || !pushPublicKey || !("serviceWorker" in navigator)) {
      return;
    }

    const selectedCategories = pushCategories.filter((category) => pushSelections[category.id]).map((category) => category.id);
    if (!selectedCategories.length) {
      setPushError("Select at least one update type.");
      setPushStatus("error");
      return;
    }

    setPushStatus("subscribing");
    setPushError("");

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== "granted") {
        setPushStatus("idle");
        if (permission === "denied") {
          dismissPushPrompt();
        }
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
        });
      }

      const response = await fetch(subscribeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories: selectedCategories,
          currentPath,
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save notification preference.");
      }

      setPushStatus("subscribed");
      dismissPushPrompt();
    } catch (error) {
      setPushStatus("error");
      setPushError(error instanceof Error ? error.message : "Something went wrong while enabling notifications.");
    }
  }

  async function disablePushNotifications() {
    if (!supportsPush || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch(unsubscribeUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
        await subscription.unsubscribe();
      }

      setPushStatus("idle");
      setPushPermission(Notification.permission);
      setPushDismissed(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(PUSH_DISMISS_KEY);
      }
    } catch (error) {
      setPushStatus("error");
      setPushError(error instanceof Error ? error.message : "Could not turn off notifications.");
    }
  }

  const showInstallPrompt =
    !installDismissed && !isStandalone && Boolean(installEvent || (isIos && hasEngaged && currentPath === "/"));
  const showPushPrompt =
    !showInstallPrompt &&
    !pushDismissed &&
    !isStandalone &&
    supportsPush &&
    pushPermission !== "denied" &&
    pushStatus !== "subscribed" &&
    hasEngaged;

  if (!showInstallPrompt && !showPushPrompt && pushStatus !== "subscribed") {
    return null;
  }

  return (
    <div className="pwa-floating-panel" aria-live="polite">
      {showInstallPrompt ? (
        <section className="pwa-card" aria-labelledby="pwa-install-heading">
          <p className="pwa-eyebrow">App experience</p>
          <h2 id="pwa-install-heading">Install a faster home-screen version</h2>
          <p>
            Save Healing From Your Addiction to your device for quick access, a calmer full-screen layout, and offline
            support for public pages.
          </p>
          {isIos && !installEvent ? (
            <p className="pwa-helper-copy">
              On iPhone or iPad, open the Share menu in Safari and choose <strong>Add to Home Screen</strong>.
            </p>
          ) : null}
          <div className="pwa-card-actions">
            {installEvent ? (
              <button type="button" className="button button-primary" onClick={() => void installApp()}>
                Install app
              </button>
            ) : null}
            <button type="button" className="button button-secondary" onClick={dismissInstallPrompt}>
              Not now
            </button>
          </div>
        </section>
      ) : null}

      {showPushPrompt ? (
        <section className="pwa-card" aria-labelledby="pwa-push-heading">
          <p className="pwa-eyebrow">Stay in touch</p>
          <h2 id="pwa-push-heading">Choose the updates you want</h2>
          <p>Enable gentle browser notifications only for the kinds of updates that are useful to you.</p>
          <div className="pwa-push-options">
            {pushCategories.map((category) => (
              <label key={category.id} className="pwa-push-option">
                <input
                  type="checkbox"
                  checked={pushSelections[category.id]}
                  onChange={() =>
                    setPushSelections((current) => ({
                      ...current,
                      [category.id]: !current[category.id],
                    }))
                  }
                />
                <span>
                  <strong>{category.label}</strong>
                  <small>{category.description}</small>
                </span>
              </label>
            ))}
          </div>
          {pushError ? <p className="pwa-error">{pushError}</p> : null}
          <div className="pwa-card-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={() => void enablePushNotifications()}
              disabled={pushStatus === "subscribing"}
            >
              {pushStatus === "subscribing" ? "Enabling..." : "Enable updates"}
            </button>
            <button type="button" className="button button-secondary" onClick={dismissPushPrompt}>
              Not now
            </button>
          </div>
        </section>
      ) : null}

      {pushStatus === "subscribed" ? (
        <section className="pwa-status-chip" aria-label="Notifications enabled">
          <span>Updates enabled</span>
          <button type="button" onClick={() => void disablePushNotifications()}>
            Turn off
          </button>
        </section>
      ) : null}
    </div>
  );
}
