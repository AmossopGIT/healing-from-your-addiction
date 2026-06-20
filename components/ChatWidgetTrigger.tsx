"use client";

import type { ReactNode } from "react";

const CHAT_OPEN_EVENT = "hfya:open-chat-widget";

export function openChatWidget() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT));
}

type ChatWidgetTriggerProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function ChatWidgetTrigger({
  children,
  className,
  ariaLabel = "Open private enquiry chat",
}: ChatWidgetTriggerProps) {
  return (
    <button type="button" className={className} aria-label={ariaLabel} onClick={openChatWidget}>
      {children}
    </button>
  );
}

export function ChatWidgetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="presentation" aria-hidden="true" focusable="false">
      <path
        d="M12 4C7.03 4 3 7.13 3 11c0 3.87 4.03 7 9 7 0.65 0 1.28-0.06 1.89-0.17 1.1 0.84 2.5 1.4 4.11 1.55-0.54-0.71-0.92-1.67-1.04-2.71C19.42 15.39 21 13.34 21 11c0-3.87-4.03-7-9-7z"
        fill="currentColor"
      />
    </svg>
  );
}

export const chatWidgetOpenEventName = CHAT_OPEN_EVENT;
