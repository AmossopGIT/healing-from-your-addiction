"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { collectEvent, flushAnalyticsQueue } from "@/lib/analytics/collect";
import { withoutBasePath } from "@/lib/basePath";
import { getCurrentSeoContext } from "@/lib/tracking";

const SCROLL_MILESTONES = [25, 50, 75, 90, 100] as const;

function scrollStorageKey(path: string) {
  return `hfya_scroll_${path}`;
}

function readScrollMilestones(path: string) {
  try {
    const raw = sessionStorage.getItem(scrollStorageKey(path));
    if (!raw) return new Set<number>();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set<number>();
  }
}

function writeScrollMilestones(path: string, milestones: Set<number>) {
  try {
    sessionStorage.setItem(scrollStorageKey(path), JSON.stringify([...milestones]));
  } catch {
    // Ignore storage failures.
  }
}

function getScrollPercent() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  if (scrollHeight <= 0) return 100;
  return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
}

function normalizeHref(href: string) {
  if (!href) return null;
  if (href.startsWith("#")) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  return href;
}

function linkLabel(anchor: HTMLAnchorElement) {
  const text = (anchor.innerText || anchor.getAttribute("aria-label") || anchor.title || "").trim();
  return text.slice(0, 120) || "(no label)";
}

function isPublicPath(path: string) {
  return !path.startsWith("/admin/") && !path.startsWith("/portal/");
}

export function AnalyticsEngagementTracker() {
  const pathname = withoutBasePath(usePathname() ?? "/");
  const reachedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isPublicPath(pathname)) return;

    reachedRef.current = readScrollMilestones(pathname);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const percent = getScrollPercent();
        const seo = getCurrentSeoContext();

        for (const milestone of SCROLL_MILESTONES) {
          if (percent < milestone || reachedRef.current.has(milestone)) continue;
          reachedRef.current.add(milestone);
          writeScrollMilestones(pathname, reachedRef.current);
          collectEvent({
            event_name: "scroll_depth",
            page_path: pathname,
            ...seo,
            properties: {
              depth_percent: milestone,
              page_title: document.title,
            },
          });
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!isPublicPath(pathname)) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.closest("[data-analytics-tracked]")) return;

      const href = normalizeHref(anchor.getAttribute("href") ?? "");
      if (!href) return;

      const seo = getCurrentSeoContext();
      const label = linkLabel(anchor);
      const section =
        anchor.closest("[data-analytics-section]")?.getAttribute("data-analytics-section") ||
        anchor.closest("header")?.tagName.toLowerCase() ||
        anchor.closest("footer")?.tagName.toLowerCase() ||
        anchor.closest("main")?.tagName.toLowerCase() ||
        "content";

      const isInternal = href.startsWith("/") && !href.startsWith("//");
      let destinationPath: string | null = null;
      let isSameOrigin = false;

      try {
        if (isInternal) {
          destinationPath = withoutBasePath(href.split("?")[0] ?? href);
        } else {
          const url = new URL(href, window.location.origin);
          isSameOrigin = url.origin === window.location.origin;
          if (isSameOrigin) destinationPath = withoutBasePath(url.pathname);
        }
      } catch {
        return;
      }

      if (isInternal || isSameOrigin) {
        if (destinationPath && !isPublicPath(destinationPath)) return;
        collectEvent({
          event_name: "link_click",
          page_path: pathname,
          ...seo,
          properties: {
            link_text: label,
            link_href: href.slice(0, 500),
            destination_path: destinationPath,
            link_section: section,
            page_title: document.title,
          },
        });
        return;
      }

      collectEvent({
        event_name: "outbound_click",
        page_path: pathname,
        ...seo,
        properties: {
          link_text: label,
          link_href: href.slice(0, 500),
          link_section: section,
          page_title: document.title,
        },
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") void flushAnalyticsQueue();
    };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return null;
}
