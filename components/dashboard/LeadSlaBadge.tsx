import { adminTooltips } from "@/lib/dashboard/adminTooltips";
import { getLeadSlaState, leadSlaStateLabels, slaBadgeClass } from "@/lib/dashboard/leadSla";
import type { Lead } from "@/types/database";

type LeadSlaBadgeProps = {
  lead: Lead;
};

export function LeadSlaBadge({ lead }: LeadSlaBadgeProps) {
  const state = getLeadSlaState(lead);
  return (
    <span className={slaBadgeClass(state)} title={adminTooltips.slaStates[state]}>
      {leadSlaStateLabels[state]}
    </span>
  );
}
