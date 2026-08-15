import type { LeadStatus } from "@/types/database";

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  triage_review: "Triage review",
  outreach_started: "Outreach started",
  care_pathway_defined: "Care pathway defined",
  qualified: "Qualified",
  enrolled: "Enrolled",
  closed: "Closed",
};

export const leadStatusOptions: LeadStatus[] = ["new", "triage_review", "outreach_started", "care_pathway_defined", "qualified", "enrolled", "closed"];

export function formatDashboardDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function statusBadgeClass(status: LeadStatus) {
  return `status-badge status-badge-${status}`;
}

export const adminNavItems = [
  { href: "/admin/", label: "Overview" },
  { href: "/admin/analytics/", label: "Analytics" },
  { href: "/admin/leads/", label: "Leads" },
  { href: "/admin/clients/", label: "Clients" },
  { href: "/admin/clients/invite/", label: "Invite client" },
  { href: "/admin/programmes/", label: "Programmes" },
  { href: "/admin/notifications/", label: "Notifications" },
  { href: "/admin/content/", label: "Content" },
  { href: "/admin/docs/", label: "Docs" },
];

export const portalNavItems = [
  { href: "/portal/", label: "Home" },
  { href: "/portal/programme/", label: "Programme" },
  { href: "/portal/readiness/", label: "Readiness" },
  { href: "/portal/intake/", label: "Intake" },
  { href: "/portal/consultation/", label: "Consultation" },
  { href: "/portal/messages/", label: "Messages" },
  { href: "/portal/resources/", label: "Resources" },
  { href: "/portal/account/", label: "Account" },
];

export type PortalNavStage =
  | "onboarding"
  | "pre_intake"
  | "pre_programme"
  | "active_programme"
  | "maintenance";

/** Full sidebar destinations stay available; mobile shrinks once the course is active. */
export function resolvePortalMobileNavItems(stage: PortalNavStage) {
  if (stage === "active_programme" || stage === "maintenance") {
    return [
      { href: "/portal/", label: "Home" },
      { href: "/portal/programme/", label: "Programme" },
      { href: "/portal/messages/", label: "Messages" },
      { href: "/portal/account/", label: "More" },
    ];
  }

  if (stage === "pre_intake" || stage === "pre_programme" || stage === "onboarding") {
    return [
      { href: "/portal/", label: "Home" },
      { href: "/portal/intake/", label: "Intake" },
      { href: "/portal/consultation/", label: "Consultation" },
      { href: "/portal/messages/", label: "Messages" },
      { href: "/portal/account/", label: "More" },
    ];
  }

  return portalNavItems;
}