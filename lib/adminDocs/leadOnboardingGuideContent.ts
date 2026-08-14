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
      label: "Stage A — Lead",
      value:
        "Person appears under Admin → Leads. You triage, respond, and track status. No portal account yet.",
    },
    {
      label: "Stage B — Client",
      value:
        "Use Accept & invite client. The platform emails a secure invite, creates the client profile, and unlocks portal intake after focus is assigned.",
    },
  ],
  steps: [
    {
      id: "leads-list",
      title: "Open the Leads list",
      body: "New website enquiries land at Admin → Leads. Check Overdue first, then every New lead the same day when possible. Click the person name to open their detail.",
      callout: "Do not leave form leads only in email — work them from the Leads screen so SLA and notes stay with the record.",
      screenCaption: "Leads / Enquiries at /admin/leads/ — filters, triage, SLA, and status.",
    },
    {
      id: "lead-detail",
      title: "Review consent, triage, and respond",
      body: "On lead detail, read triage and safety signals first. Confirm follow-up consent before messaging. Use the recommended first-response template, contact them in the allowed channel, save follow-up fields, and add an internal note.",
      callout: "Status alone cannot enrol them. When they agree to continue, use Accept & invite client.",
      screenCaption: "Lead detail shows contact, follow-up consent, triage, templates, and the invite CTA.",
    },
    {
      id: "invite",
      title: "Accept and invite the client",
      body: "Confirm name, email, addiction focus, and preferred contact. Send invitation. The system emails a password setup link, creates the client profile, links the lead, and sets status to Enrolled.",
      callout: "Invite the same day you agree they are ready — do not wait for a separate forms pack unless you still need offline paperwork.",
      screenCaption: "Invite client form at /admin/clients/invite/ — often opened with ?leadId=…",
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
        "Open the new lead and set Triage review while you read",
        "Confirm follow-up consent and preferred contact",
        "Send first response in the allowed channel",
        "Set Outreach started + follow-up due, then continue to Qualified → invite",
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
        "Invite via /admin/clients/invite/ when they agree to continue",
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
        "Invite when qualified",
      ],
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      summary: "Confirm WhatsApp follow-up consent. Keep first messages short and non-judgmental with no cure promises.",
      steps: [
        "Confirm they consented to WhatsApp",
        "Mirror decisions back into the lead record (status, due date, notes)",
        "Invite from admin so portal access is tracked",
      ],
    },
  ],
  checklist: [
    "Found the person on /admin/leads/ (or created invite path if email/phone only)",
    "Reviewed triage priority, risk, withdrawal, medical support",
    "Confirmed follow-up consent / asked permission if no form",
    "Sent first response in allowed channel",
    "Marked first response sent + set follow-up due",
    "Updated status (Triage review → Outreach started → …)",
    "Added internal note",
    "Agreed next step with the person",
    "When ready: Accept & invite client with correct email and addiction focus",
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
      fix: "No. Use Accept & invite client. Status alone cannot create portal access.",
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
    { label: "Leads list", path: "/admin/leads/" },
    { label: "Invite client", path: "/admin/clients/invite/" },
    { label: "Portal intake", path: "/portal/intake/" },
    { label: "Lead triage playbook", path: "/admin/docs/lead-triage-playbook/" },
    { label: "Admin login guide", path: "/admin/docs/how-to-login-as-admin/" },
  ],
} as const;
