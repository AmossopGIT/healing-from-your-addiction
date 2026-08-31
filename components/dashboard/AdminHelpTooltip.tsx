"use client";

type AdminHelpTooltipProps = {
  text: string;
  /** Accessible name for the help control */
  label?: string;
};

/** Compact ? help control with hover/focus tooltip for admin staff. */
export function AdminHelpTooltip({ text, label = "Help" }: AdminHelpTooltipProps) {
  return (
    <span className="admin-help-tooltip">
      <button
        type="button"
        className="admin-help-tooltip-trigger"
        aria-label={`${label}: ${text}`}
        onClick={(event) => event.stopPropagation()}
      >
        <span aria-hidden="true">?</span>
      </button>
      <span className="admin-help-tooltip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}
