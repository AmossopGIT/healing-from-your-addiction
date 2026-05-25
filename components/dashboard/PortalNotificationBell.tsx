"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa6";
import type { PortalNotificationSummary } from "@/lib/dashboard/queries";

type PortalNotificationBellProps = {
  summary: PortalNotificationSummary | null;
};

export function PortalNotificationBell({ summary }: PortalNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = summary?.unreadCount ?? 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="dashboard-notification-bell" ref={rootRef}>
      <button
        type="button"
        className={`dashboard-notification-button${unreadCount ? " has-unread" : ""}`}
        aria-label={unreadCount ? `${unreadCount} unread portal notifications` : "Portal notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <FaBell aria-hidden="true" />
        {unreadCount ? (
          <span className="dashboard-notification-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="dashboard-notification-panel" role="dialog" aria-label="Portal notifications">
          <div className="dashboard-notification-panel-header">
            <p className="dashboard-notification-title">Notifications</p>
            <p className="dashboard-notification-subtitle">
              {unreadCount ? `${unreadCount} unread in your portal` : "You are up to date"}
            </p>
          </div>

          {summary?.items.length ? (
            <div className="dashboard-notification-list">
              {summary.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="dashboard-notification-link"
                  onClick={() => setOpen(false)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="dashboard-empty">Nothing new right now.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
