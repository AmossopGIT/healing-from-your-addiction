const MIN_ENGAGED_SECONDS = 3;
const MAX_ENGAGED_SECONDS = 30 * 60;

export function formatEngagedDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes ? `${hours}h ${remMinutes}m` : `${hours}h`;
}

export type TimeOnPageTracker = {
  reset: (path: string) => void;
  markVisible: () => void;
  markHidden: () => void;
  flush: (path?: string) => number | null;
};

export function createTimeOnPageTracker(
  onFlush: (path: string, engagedSeconds: number) => void,
): TimeOnPageTracker {
  let activePath = "/";
  let engagedMs = 0;
  let visibleStartedAt = Date.now();

  function syncVisibleTime() {
    engagedMs += Date.now() - visibleStartedAt;
    visibleStartedAt = Date.now();
  }

  function engagedSeconds() {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      syncVisibleTime();
    }
    const seconds = Math.round(engagedMs / 1000);
    return Math.min(MAX_ENGAGED_SECONDS, Math.max(0, seconds));
  }

  function flush(path = activePath) {
    if (!path) return null;
    const seconds = engagedSeconds();
    engagedMs = 0;
    visibleStartedAt = Date.now();
    if (seconds >= MIN_ENGAGED_SECONDS) {
      onFlush(path, seconds);
      return seconds;
    }
    return null;
  }

  return {
    reset(path: string) {
      activePath = path;
      engagedMs = 0;
      visibleStartedAt = Date.now();
    },
    markVisible() {
      visibleStartedAt = Date.now();
    },
    markHidden() {
      syncVisibleTime();
      flush(activePath);
    },
    flush: (path) => flush(path ?? activePath),
  };
}
