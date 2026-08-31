"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DashboardMobileTablesProps = {
  children: ReactNode;
};

function applyTableLabels(root: HTMLElement) {
  root.querySelectorAll("table.dashboard-table").forEach((table) => {
    const headers = [...table.querySelectorAll("thead th")].map(
      (th) => th.getAttribute("data-column-label") ?? th.textContent?.trim() ?? "",
    );
    table.querySelectorAll("tbody tr").forEach((row) => {
      [...row.children].forEach((cell, index) => {
        if (!(cell instanceof HTMLTableCellElement) || cell.tagName !== "TD") return;
        const label = headers[index];
        if (!label) return;
        if (cell.getAttribute("data-label") !== label) {
          cell.setAttribute("data-label", label);
        }
      });
    });
  });
}

/** Labels dashboard tables from their headers so CSS can stack them as cards on phones. */
export function DashboardMobileTables({ children }: DashboardMobileTablesProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const run = () => applyTableLabels(root);
    run();

    const observer = new MutationObserver(run);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
