import { siteConfig } from "@/lib/constants";

const siteRoot = siteConfig.siteUrl.replace(/\/$/, "");

export const leadOnboardingGuideContent = {
  title: "Lead to client onboarding flow",
  description:
    "Where new enquiries land, what consent is captured, and the steps from lead to portal invite and intake.",
  category: "Operations" as const,
  intro:
    "Use this guide when a new person enquires by website form, email, phone, or WhatsApp — and when you move them from lead to client portal. This describes the system as it works today.",
  docPath: "/admin/docs/lead-to-client-onboarding-flow/",
  docUrl: `${siteRoot}/admin/docs/lead-to-client-onboarding-flow/`,
  leadsPath: "/admin/leads/",
  leadsUrl: `${siteRoot}/admin/leads/`,
  leadDetailPath: "/admin/leads/[id]/",
  leadDetailUrl: `${siteRoot}/admin/leads/example/`,
  invitePath: "/admin/clients/invite/",
  inviteUrl: `${siteRoot}/admin/clients/invite/`,
  portalIntakePath: "/portal/intake/",
  portalIntakeUrl: `${siteRoot}/portal/intake/`,
  facts: [
    {
      label: "Daily start — Overview",
      value:
        "Open Admin Overview, then Overdue. Assign to me so Assigned is not left as —, set a follow-up due date, and respond before inviting.",
    },
    {
      label: "Consent on the system today",
      value:
        "Website form captures follow-up channel consent (WhatsApp / Email / Phone) plus a non-emergency acknowledgement. Those values show on the lead detail page.",
    },
    {
      label: "Not auto-sent yet",
      value:
        "A separate therapy or programme consent PDF is not generated or emailed by the backend when a lead arrives.",
    },
    {
      label: "Stage A → Stage B",
      value:
        "Leads stay on Admin → Leads until you use Accept & invite client (or Invite on the list). That creates portal access and can unlock intake when focus is set.",
    },
  ],
  steps: [
    {
      id: "leads-list",
      title: "Open the Leads list",
      body: "New website enquiries land at Admin → Leads. Check Overdue first. Each row has Open, Invite (when not enrolled), Assign to me, and a Follow-up due Save that stays on the list. Triage shows a readable label such as Priority — not priority / priority.",
      callout: "Do not leave form leads only in email — work them from the Leads screen so SLA, assignment, and notes stay with the record.",
      screenCaption: "Leads list with Open, Invite, Assign to me, and follow-up Save on each row.",
    },
    {
      id: "lead-detail",
      title: "Review consent, triage, and respond",
      body: "On lead detail, read triage and safety signals first. Confirm follow-up consent before messaging. Status pills show the workflow; Enrolled is only via Accept & invite client. After every call or WhatsApp, save an internal note.",
      callout: "Status alone cannot enrol them. Use the large Accept & invite client button when they agree to continue.",
      screenCaption: "Lead detail with next-step coaching and a prominent Accept & invite client button.",
    },
    {
      id: "invite",
      title: "Accept and invite the client",
      body: "Prefer Invite from a lead so name, email, and handoff are filled. Confirm addiction focus (unlocks portal intake) and preferred contact, then Send invitation. Opening Invite client from the sidebar with a blank form is only for phone/email enquiries with no lead row.",
      callout: "Invite the same day you agree they are ready — do not wait for a separate forms pack unless you still need offline paperwork.",
      screenCaption: "Invite form filled from a lead (?leadId=…). Blank sidebar invite means no lead was selected.",
    },
    {
      id: "intake",
      title: "Client completes portal intake",
      body: "After programme focus is assigned, the client answers pre-programme questions at /portal/intake/. You review answers under Admin → Clients → that client → Intake before the intake conversation.",
      callout: "Portal intake is not the lead-stage consent form. It is the clinical/operational question set for their focus.",
      screenCaption: "Client portal intake — save progress, then submit once.",
    },
  ],
  channels: [
    {
      id: "form",
      title: "Website form",
      summary:
        "System saves the lead, emails the practice inbox, and shows them as New on /admin/leads/ with consent and triage already captured.",
      steps: [
        "Open Overdue or the new lead — use Assign to me and set follow-up due on the list if helpful",
        "Confirm follow-up consent and preferred contact on lead detail",
        "Send first response in the allowed channel",
        "Set Outreach started, then continue to Qualified → Invite from the lead (not a blank sidebar form)",
      ],
    },
    {
      id: "email",
      title: "Email enquiry (no form)",
      summary:
        "Nothing lands in Leads automatically. Reply warmly, capture essentials, and get them onto the platform as soon as they are a real prospect.",
      steps: [
        "Ask preferred contact and permission for WhatsApp if needed",
        "Capture name, email, phone, concern, urgency, and callback window",
        "Use the blank Invite client form only when there is no lead row",
        "Note in handoff that origin was email",
      ],
    },
    {
      id: "phone",
      title: "Phone call",
      summary: "Confirm confidentiality and that this is not emergency medical care. Escalate medical risk before continuing support.",
      steps: [
        "If severe withdrawal or immediate risk → GP / emergency care first",
        "Move to WhatsApp only with clear permission",
        "Capture notes the same day in admin",
        "Invite when qualified — from a lead if one exists",
      ],
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      summary: "Confirm WhatsApp follow-up consent. Keep first messages short and non-judgmental with no cure promises.",
      steps: [
        "Confirm they consented to WhatsApp",
        "Mirror decisions back into the lead record (status, due date, notes, assignment)",
        "Invite from the lead so portal access is tracked",
      ],
    },
  ],
  checklist: [
    "Started from Overview Overdue or /admin/leads/?overdue=1",
    "Found the person on /admin/leads/ (blank Invite only if email/phone with no lead)",
    "Used Assign to me when Assigned was —",
    "Set follow-up due (list Save or lead detail) so they do not go cold",
    "Reviewed triage, risk, withdrawal, medical support",
    "Confirmed follow-up consent / asked permission if no form",
    "Sent first response in allowed channel",
    "Marked first response sent + updated status",
    "Added internal note after the conversation",
    "When ready: Invite from the lead (Accept & invite) with correct email and addiction focus",
    "Confirmed they received invite / can set password",
    "After focus assigned: remind them to complete /portal/intake/",
    "Review intake under Admin → Clients → Intake before the intake conversation",
  ],
  sla: [
    "Urgent: within 2 hours",
    "Priority: within 8 hours",
    "Routine: within 24 hours",
  ],
  faqs: [
    {
      issue: "I opened Invite client and the form is empty — what do I do?",
      fix: "That means no lead was selected. For website form leads, go to Leads → Open or Invite on the row so name and email fill in. Use the blank form only for phone/email enquiries with no lead row.",
    },
    {
      issue: "Where is the consent form?",
      fix: "On the website enquiry form: follow-up channel consent + non-emergency acknowledgement. Those values show on lead detail. A separate therapy consent PDF is not emailed by the backend yet.",
    },
    {
      issue: "Does the backend send forms when a lead comes in?",
      fix: "No. The backend notifies the practice and stores the lead. You send the human first response. Portal invite email is sent only when you invite.",
    },
    {
      issue: "When do they get portal intake?",
      fix: "After you invite them and a programme / addiction focus is assigned. Intake is at /portal/intake/.",
    },
    {
      issue: "Can I mark a lead Enrolled without inviting?",
      fix: "No. Use Accept & invite client (or Invite on the list). Status alone cannot create portal access.",
    },
    {
      issue: "What if Lynn already collected lots of information?",
      fix: "Use the lead detail as the handoff. Invite once they are qualified — they do not need to re-type everything unless consent or contact details are still missing.",
    },
  ],
  safetyReminders: [
    "Non-judgmental, plain language",
    "No cure or guaranteed-outcome promises",
    "Severe withdrawal or immediate risk → GP / emergency care first",
    "Respect autonomy and the channels they consented to",
  ],
  quickRoutes: [
    { label: "Overview", path: "/admin/" },
    { label: "Overdue leads", path: "/admin/leads/?overdue=1" },
    { label: "Leads list", path: "/admin/leads/" },
    { label: "Invite client", path: "/admin/clients/invite/" },
    { label: "Portal intake", path: "/portal/intake/" },
    { label: "Lead triage playbook", path: "/admin/docs/lead-triage-playbook/" },
    { label: "Admin login guide", path: "/admin/docs/how-to-login-as-admin/" },
  ],
} as const;
