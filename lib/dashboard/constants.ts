import type { LeadStatus } from "@/types/database";

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  enrolled: "Enrolled",
  closed: "Closed",
};

export const leadStatusOptions: LeadStatus[] = ["new", "contacted", "qualified", "enrolled", "closed"];

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
  { href: "/admin/leads/", label: "Leads" },
  { href: "/admin/clients/", label: "Clients" },
  { href: "/admin/clients/invite/", label: "Invite client" },
  { href: "/admin/programmes/", label: "Programmes" },
  { href: "/admin/notifications/", label: "Notifications" },
  { href: "/admin/content/", label: "Content" },
];

export const portalNavItems = [
  { href: "/portal/", label: "Home" },
  { href: "/portal/programme/", label: "Programme" },
  { href: "/portal/intake/", label: "Intake" },
  { href: "/portal/messages/", label: "Messages" },
  { href: "/portal/resources/", label: "Resources" },
  { href: "/portal/account/", label: "Account" },
];
