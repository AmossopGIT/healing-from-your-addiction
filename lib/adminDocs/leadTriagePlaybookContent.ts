import { leadStatusWorkflowLine } from "@/lib/dashboard/leadNextStep";
import { siteConfig } from "@/lib/constants";

const siteRoot = siteConfig.siteUrl.replace(/\/$/, "");

export const leadTriagePlaybookContent = {
  title: "Lead triage playbook",
  description: "First-response targets, status workflow, safety language, and triage signals for every enquiry.",
  category: "Operations" as const,
  intro:
    "Use this playbook the moment an enquiry arrives — before you invite anyone. It tells you what to read first, how fast to respond, which status to set, and how to stay safe and warm. Pair it with the Lead to client onboarding flow when you are ready to invite.",
  docPath: "/admin/docs/lead-triage-playbook/",
  docUrl: `${siteRoot}/admin/docs/lead-triage-playbook/`,
  leadsPath: "/admin/leads/",
  leadsUrl: `${siteRoot}/admin/leads/`,
  overdueLeadsPath: "/admin/leads/?overdue=1",
  leadDetailPath: "/admin/leads/[id]/",
  leadDetailUrl: `${siteRoot}/admin/leads/example/`,
  relatedOnboardingPath: "/admin/docs/lead-to-client-onboarding-flow/",
  workflowLine: leadStatusWorkflowLine,
  facts: [
    {
      label: "Start with Overdue",
      value:
        "Open Admin → Leads → Overdue (or Overview → Overdue leads). Assign to me, set follow-up due, then respond — do not let form leads sit only in email.",
    },
    {
      label: "Respond within SLA",
      value: "Urgent ≤ 2 hours · Priority ≤ 8 hours · Routine ≤ 24 hours. Overdue rows mean the clock has passed.",
    },
    {
      label: "Status tracks progress",
      value:
        "Move leads through the workflow as you work them. Enrolled only happens via Accept & invite client — changing status alone does not create portal access.",
    },
    {
      label: "Safety first",
      value:
        "Severe withdrawal or immediate risk → GP or emergency care before continuing support. No cure promises. Use the channels they consented to.",
    },
  ],
  steps: [
    {
      id: "overdue",
      title: "Open Overdue and pick the next person",
      body: "New website enquiries land on Admin → Leads with triage already set. Start with Overdue so nothing goes cold. On each row use Open, Invite (when qualified), Assign to me, and Follow-up due Save without leaving the list.",
      callout: "Prefer inviting from a lead row — not from a blank sidebar Invite form.",
      screenCaption: "Leads list filtered to Overdue with row actions visible.",
    },
    {
      id: "signals",
      title: "Read triage and safety signals first",
      body: "On lead detail, review triage priority, risk flag, urgency, withdrawal risk, medical support, readiness stage, and callback window before you message. Confirm follow-up consent matches the channel you plan to use (WhatsApp / email / phone).",
      callout: "If withdrawal risk or medical support flags are raised, escalate clinically before booking or inviting.",
      screenCaption: "Lead detail with triage label, consent panel, and next-step coaching.",
    },
    {
      id: "respond",
      title: "Send the first response and set follow-up",
      body: "Reply in the allowed channel with warm, plain language. Mark the first response sent, update status toward Outreach started, set a follow-up due date, and save an internal note after every call or WhatsApp thread.",
      callout: "Mirror WhatsApp decisions back into the lead record the same day — status, notes, assignment, due date.",
      screenCaption: "Status workflow and follow-up fields on lead detail.",
    },
    {
      id: "qualified",
      title: "When qualified → invite (do not skip)",
      body: "Once they are suitable and willing, mark Qualified and use Accept & invite client. That creates portal access, sends the invite email, and sets Enrolled. Continue with the onboarding flow for intake and programme focus.",
      callout: "Status Enrolled without invite does not create a client account.",
      screenCaption: "Prominent Accept & invite client when status is Qualified.",
    },
  ],
  intakeSignals: [
    {
      field: "triage_priority",
      meaning: "How fast you should respond — urgent, priority, or routine.",
    },
    {
      field: "risk_flag",
      meaning: "Safety escalation — standard, priority, or urgent_review.",
    },
    {
      field: "urgency_level",
      meaning: "How soon they want contact (from the form or your notes).",
    },
    {
      field: "withdrawal_risk",
      meaning: "Medical escalation signal — do not proceed with support alone if severe.",
    },
    {
      field: "medical_support_involved",
      meaning: "Whether GP or other medical support is already in the picture.",
    },
    {
      field: "readiness_stage",
      meaning: "How ready they sound for structured work — guides the conversation tone.",
    },
    {
      field: "callback_window",
      meaning: "When they asked to be contacted — honour this in your first response.",
    },
  ],
  sla: [
    { level: "Urgent", target: "≤ 2 hours", when: "High urgency, withdrawal concern, or urgent_review risk" },
    { level: "Priority", target: "≤ 8 hours", when: "Clear need for timely follow-up but not immediate crisis" },
    { level: "Routine", target: "≤ 24 hours", when: "Standard enquiry with no elevated risk flags" },
  ],
  statusWorkflow: [
    {
      status: "new",
      label: "New",
      meaning: "Received but not reviewed.",
      action: "Open the lead, check consent and triage, send first response.",
      next: "Triage review",
    },
    {
      status: "triage_review",
      label: "Triage review",
      meaning: "Intake reviewed and safety checked.",
      action: "Send first response, mark it sent, set follow-up due.",
      next: "Outreach started",
    },
    {
      status: "outreach_started",
      label: "Outreach started",
      meaning: "First response sent — conversation underway.",
      action: "Keep talking and agree the care pathway.",
      next: "Care pathway defined",
    },
    {
      status: "care_pathway_defined",
      label: "Care pathway defined",
      meaning: "Next-step plan agreed.",
      action: "Confirm fit and willingness, then mark Qualified.",
      next: "Qualified",
    },
    {
      status: "qualified",
      label: "Qualified",
      meaning: "Suitable and willing to continue.",
      action: "Use Accept & invite client — not status alone.",
      next: "Enrolled (via invite)",
    },
    {
      status: "enrolled",
      label: "Enrolled",
      meaning: "Invited to portal — client workflow started.",
      action: "Open client profile, confirm invite received, review portal intake.",
      next: "Programme assign (see After invite guide)",
    },
    {
      status: "closed",
      label: "Closed",
      meaning: "No further action for now.",
      action: "Note why you closed — required for audit and handoff.",
      next: "Re-open only if they re-enquire",
    },
  ],
  safetyLanguage: [
    "Use non-judgmental, plain language — no shame or blame.",
    "Do not promise cure or guaranteed outcomes.",
    "Severe withdrawal or immediate risk → direct to GP or emergency care first.",
    "Keep communication trauma-informed and autonomy-respecting.",
    "Only contact via channels they consented to on the form or in conversation.",
  ],
  checklist: [
    "Started from Overdue or /admin/leads/?overdue=1",
    "Assigned to me when Assigned was —",
    "Read triage priority, risk flag, withdrawal, and medical signals",
    "Confirmed follow-up consent before messaging",
    "Responded within SLA (2h / 8h / 24h)",
    "Updated status to match where the conversation actually is",
    "Set follow-up due date so they do not go cold",
    "Saved internal note after call or WhatsApp",
    "When ready: Accept & invite from the lead (not blank sidebar form)",
    "When closing: recorded reason in notes",
  ],
  faqs: [
    {
      issue: "What is the difference between this playbook and the onboarding flow?",
      fix: "This playbook covers triage, SLA, status, and safety. The onboarding flow covers screens, channels, consent, invite, and intake step-by-step.",
    },
    {
      issue: "Can I mark Enrolled without inviting?",
      fix: "No. Enrolled only via Accept & invite client. Status alone cannot create portal access.",
    },
    {
      issue: "The triage label looks confusing (priority / priority)?",
      fix: "The list now shows readable labels like Priority or Urgent · Urgent review. Open the lead for full signal detail.",
    },
    {
      issue: "When do I close a lead?",
      fix: "When they are not continuing, not suitable, or unresponsive after documented follow-up. Always note why in internal notes.",
    },
  ],
  quickRoutes: [
    { label: "Overdue leads", path: "/admin/leads/?overdue=1" },
    { label: "All leads", path: "/admin/leads/" },
    { label: "Onboarding flow", path: "/admin/docs/lead-to-client-onboarding-flow/" },
    { label: "After invite guide", path: "/admin/docs/after-invite-start-the-course/" },
    { label: "Admin overview", path: "/admin/" },
  ],
} as const;
