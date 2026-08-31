import { AdminHelpTooltip } from "@/components/dashboard/AdminHelpTooltip";

type AdminTableHeaderProps = {
  label: string;
  tooltip?: string;
};

/** Table header with optional staff help tooltip; use data-column-label for mobile card labels. */
export function AdminTableHeader({ label, tooltip }: AdminTableHeaderProps) {
  return (
    <th data-column-label={label}>
      <span className="dashboard-th-label">{label}</span>
      {tooltip ? <AdminHelpTooltip text={tooltip} label={`About ${label}`} /> : null}
    </th>
  );
}
