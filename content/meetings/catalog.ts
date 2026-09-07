import type { MeetingAction, MeetingRecord } from "@/content/meetings/types";

export const meetingRecords: MeetingRecord[] = [
  {
    id: "2026-08-31-pricing",
    date: "31 Aug 2026",
    dateIso: "2026-08-31",
    title: "Pricing, lead nurture, and platform automation",
    summary:
      "Ads bring leads but R12,000 upfront blocks conversion. Keep unpaid prospects as leads, nurture with free content, and restructure pricing into smaller first steps.",
    docHref: "/admin/docs/meeting-2026-08-31-pricing-lead-nurture/",
  },
  {
    id: "2026-08-31-ladder",
    date: "31 Aug 2026",
    dateIso: "2026-08-31",
    title: "Payment ladder and 30-day commercial test (superseded)",
    summary:
      "Historical proposal (R350 / assessment / membership). Superseded by the five-package ladder on 7 Sep 2026.",
    docHref: "/admin/docs/plan-2026-08-31-product-ladder/",
  },
  {
    id: "2026-09-07-packages",
    date: "7 Sep 2026",
    dateIso: "2026-09-07",
    title: "Five-package healing ladder",
    summary:
      "Current path: A Free Start → B Foundation R550/mo → C Transformation R1,800/mo → D Complete Healing R12,000 → E Master Plan fast-track (price on enquiry). Public page live at /programs/healing-packages/.",
    docHref: "/admin/docs/plan-2026-09-07-five-package-ladder/",
  },
];

export const meetingActions: MeetingAction[] = [
  // Gerald — today / this week
  {
    id: "g-load-leads",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Load all WhatsApp / phone / ad leads into Admin → Leads",
    dueLabel: "This week",
    bucket: "today",
    href: "/admin/leads/",
    hrefLabel: "Open Leads",
  },
  {
    id: "g-review-docs",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Review Lead triage playbook and Lead to client onboarding flow",
    dueLabel: "This week",
    bucket: "today",
    href: "/admin/docs/lead-triage-playbook/",
    hrefLabel: "Open playbook",
  },
  {
    id: "g-publish-blogs",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Publish new blog drafts in Admin → Content",
    dueLabel: "This week",
    bucket: "today",
    href: "/admin/content/blog/",
    hrefLabel: "Open Content",
  },
  {
    id: "g-confirm-ads",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Confirm ads land on gambling / food pages — not homepage only",
    dueLabel: "Ongoing",
    bucket: "today",
  },
  {
    id: "g-confirm-packages",
    meetingId: "2026-09-07-packages",
    owner: "gerald",
    title: "Confirm five packages clinically (especially C vs D extras and Master Plan fit)",
    dueLabel: "This week",
    bucket: "today",
    href: "/admin/docs/plan-2026-09-07-five-package-ladder/",
    hrefLabel: "Open package plan",
  },
  {
    id: "g-master-price",
    meetingId: "2026-09-07-packages",
    owner: "gerald",
    title: "Set Package E Master Plan investment amount",
    dueLabel: "This week",
    bucket: "today",
    href: "/admin/docs/plan-2026-09-07-five-package-ladder/",
    hrefLabel: "Open package plan",
  },
  {
    id: "g-free-start-pack",
    meetingId: "2026-09-07-packages",
    owner: "gerald",
    title: "Define Free Start materials delivery (EFT, affirmations, basic info)",
    dueLabel: "This week",
    bucket: "today",
  },
  {
    id: "g-whatsapp-script",
    meetingId: "2026-09-07-packages",
    owner: "gerald",
    title: "Draft WhatsApp first-response offering Free / Foundation / Transformation / Complete / Master / unsure",
    dueLabel: "This week",
    bucket: "today",
  },

  // Gerald — future
  {
    id: "g-research-pricing",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Review competitor framing against the five-package path",
    dueLabel: "Before next pricing sync",
    bucket: "future",
  },
  {
    id: "g-bank-account",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Set up bank account for payment gateway integration",
    dueLabel: "When ready for Andy",
    bucket: "future",
  },
  {
    id: "g-physical-rewards",
    meetingId: "2026-08-31-pricing",
    owner: "gerald",
    title: "Explore physical reward supplier (medals / coins / trophies)",
    dueLabel: "Later",
    bucket: "future",
  },
  {
    id: "g-sponsor-language",
    meetingId: "2026-09-07-packages",
    owner: "gerald",
    title: "Decide whether family-sponsor language can go live with package enquiries",
    dueLabel: "Before ad copy update",
    bucket: "future",
  },

  // Andy — today
  {
    id: "a-resend-login",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Resend admin login instructions and portal consultation form link to Gerald",
    dueLabel: "Immediate",
    bucket: "today",
    href: "/admin/docs/how-to-login-as-admin/",
    hrefLabel: "Login guide",
  },
  {
    id: "a-form-choices",
    meetingId: "2026-09-07-packages",
    owner: "andy",
    title: "Post-form package choice into the lead record (A–E or unsure)",
    dueLabel: "This week",
    bucket: "today",
    href: "/admin/leads/",
    hrefLabel: "Open Leads",
  },
  {
    id: "a-landing-copy",
    meetingId: "2026-09-07-packages",
    owner: "andy",
    title: "Keep ads / thank-you / lead path pointing at healing packages (not R12,000-only)",
    dueLabel: "This week",
    bucket: "today",
    href: "/programs/healing-packages/",
    hrefLabel: "Public packages page",
  },

  // Andy — future
  {
    id: "a-manual-lead-entry",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Improve manual lead entry from WhatsApp / phone",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-lead-segmentation",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Lead segmentation — cold / warm / hot / paying",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-content-notify",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Auto-notify subscribers when blog content is published (by concern)",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-nurture",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Nurture sequences — e.g. quarterly “Are you ready?” for non-paying leads",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-payment-gateway",
    meetingId: "2026-09-07-packages",
    owner: "andy",
    title: "Payment gateway for B/C subscriptions and D/E once-off or instalments",
    dueLabel: "After bank setup",
    bucket: "future",
  },
  {
    id: "a-post-session-email",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Post-session feedback email after group / individual sessions",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-form-completion",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Form completion tracking — % finishing intake and consultation",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-group-invite",
    meetingId: "2026-08-31-pricing",
    owner: "andy",
    title: "Group session invite flow from admin",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-ladder-tags",
    meetingId: "2026-09-07-packages",
    owner: "andy",
    title: "Track which package (A–E) each lead is on",
    dueLabel: "TBD",
    bucket: "future",
  },
  {
    id: "a-client-package-field",
    meetingId: "2026-09-07-packages",
    owner: "andy",
    title: "Optional client package_id field (beyond Payment status helper text)",
    dueLabel: "Later",
    bucket: "future",
  },

  // Joint — future (decisions)
  {
    id: "j-cold-offer",
    meetingId: "2026-09-07-packages",
    owner: "joint",
    title: "Confirm primary cold-lead offer (Free Start vs Foundation first paid step)",
    dueLabel: "Next pricing sync",
    bucket: "future",
  },
  {
    id: "j-subscription-ops",
    meetingId: "2026-09-07-packages",
    owner: "joint",
    title: "Confirm how B/C monthly subscriptions are invoiced and cancelled",
    dueLabel: "Next pricing sync",
    bucket: "future",
  },
  {
    id: "j-notify-channels",
    meetingId: "2026-08-31-pricing",
    owner: "joint",
    title: "Decide notification channels (email / push / SMS)",
    dueLabel: "Later",
    bucket: "future",
  },
  {
    id: "j-portal-invite-when",
    meetingId: "2026-08-31-pricing",
    owner: "joint",
    title: "Decide when to invite to portal (paying only vs free-tier too)",
    dueLabel: "Later",
    bucket: "future",
  },
];

export function getMeetingById(id: string) {
  return meetingRecords.find((meeting) => meeting.id === id) ?? null;
}

export function getMeetingActionById(id: string) {
  return meetingActions.find((action) => action.id === id) ?? null;
}
