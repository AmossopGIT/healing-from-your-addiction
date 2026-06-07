"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { collectEvent, flushAnalyticsQueue } from "@/lib/analytics/collect";
import { createTimeOnPageTracker } from "@/lib/analytics/timeOnPage";
import { withoutBasePath } from "@/lib/basePath";
import { getCurrentSeoContext } from "@/lib/tracking";

function isPublicPath(path: string) {
  return !path.startsWith("/admin/") && !path.startsWith("/portal/");
}

export function AnalyticsCollector() {
  const pathname = withoutBasePath(usePathname() ?? "/");
  const lastPathRef = useRef<string | null>(null);
  const sessionStartedRef = useRef(false);
  const timeTrackerRef = useRef(
    createTimeOnPageTracker((path, engagedSeconds) => {
      const seo = getCurrentSeoContext();
      collectEvent({
        event_name: "time_on_page",
        page_path: path,
        ...seo,
        properties: {
          duration_seconds: engagedSeconds,
          page_title: document.title,
        },
      });
    }),
  );

  useEffect(() => {
    if (!isPublicPath(pathname)) return;

    if (lastPathRef.current && lastPathRef.current !== pathname) {
      timeTrackerRef.current.flush(lastPathRef.current);
    }

    timeTrackerRef.current.reset(pathname);

    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      const seo = getCurrentSeoContext();
      collectEvent({
        event_name: "session_start",
        page_path: pathname,
        ...seo,
        properties: {
          entry_path: pathname,
          page_title: document.title,
        },
      });
    }

    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    const seo = getCurrentSeoContext();
    collectEvent({
      event_name: "page_view",
      page_path: pathname,
      ...seo,
      properties: {
        page_title: document.title,
        referrer_path: (() => {
          try {
            if (!document.referrer) return null;
            return withoutBasePath(new URL(document.referrer).pathname);
          } catch {
            return null;
          }
        })(),
      },
    });

    void flushAnalyticsQueue();
  }, [pathname]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        timeTrackerRef.current.markHidden();
        void flushAnalyticsQueue();
        return;
      }
      timeTrackerRef.current.markVisible();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const handlePageExit = () => {
      if (!lastPathRef.current || !isPublicPath(lastPathRef.current)) return;
      timeTrackerRef.current.flush(lastPathRef.current);
      void flushAnalyticsQueue();
    };

    window.addEventListener("pagehide", handlePageExit);

    return () => {
      window.removeEventListener("pagehide", handlePageExit);
      handlePageExit();
      void flushAnalyticsQueue();
    };
  }, []);

  return null;
}
