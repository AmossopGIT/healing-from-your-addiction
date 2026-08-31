import { AdminHelpTooltip } from "@/components/dashboard/AdminHelpTooltip";

type AdminFieldLabelProps = {
  label: string;
  tooltip?: string;
};

/** Definition-list or form label with optional staff help. */
export function AdminFieldLabel({ label, tooltip }: AdminFieldLabelProps) {
  if (!tooltip) return <>{label}</>;
  return (
    <span className="dashboard-label-with-help">
      {label}
      <AdminHelpTooltip text={tooltip} label={label} />
    </span>
  );
}
