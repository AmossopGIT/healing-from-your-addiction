/** Short help copy for admin dashboard tooltips — keep each under ~220 chars. */
export const adminTooltips = {
  leads: {
    triage:
      "How fast to respond: Urgent ≤ 2h, Priority ≤ 8h, Routine ≤ 24h. Open the lead for risk and withdrawal signals.",
    assigned:
      "Who owns follow-up on this enquiry. Click Assign to me if it shows —. Inviting does not assign you automatically.",
    sla: "On track = within target. Overdue = first-response SLA missed or your follow-up due date has passed. Responded = first reply logged.",
    status:
      "Workflow stage: New → Triage review → Outreach started → Care pathway defined → Qualified → Enrolled (via invite only).",
    followUpDue:
      "Your reminder for the next contact — pick date/time and Save. Helps stop leads going cold and can show Overdue if the date passes.",
    received: "When the enquiry arrived on the website form. Email-only enquiries do not appear here unless you create a lead.",
    actions:
      "Open = full detail. Assign to me = take ownership. Calendar + Save = follow-up due. Invite = portal access when they are ready (prefer after Qualified).",
    open: "Open full lead detail — review consent, triage, send first response, and update status.",
    invite:
      "Send portal invite with name and email pre-filled. Use only when they are suitable and willing. Does not replace Assign to me or first response.",
    assignToMe: "Claim this lead so Assigned shows your name. Do this before responding so handoff is clear.",
    followUpSave: "Save the follow-up due date you chose. Set this after first contact or when they ask to be called back.",
    overdueFilter: "Leads needing action now — missed first-response SLA or overdue follow-up due date.",
    nameHint: "The line under each name is the recommended next step for that status.",
  },
  leadDetail: {
    followUpConsent:
      "Only contact via channels marked Yes. If all No, ask permission before messaging.",
    riskFlag: "Safety signal. urgent_review or severe withdrawal → GP or emergency care before continuing support.",
    withdrawalRisk: "If severe, escalate medically before booking or inviting.",
    firstResponseTemplate: "Suggested opening message for the allowed channel — copy, send, then mark response sent.",
    followUpDueAt: "When you plan to contact them again. Saves to the list Follow-up due column.",
    firstResponseSent: "Log when the first reply went out. Changes SLA badge to Responded.",
    assignAdmin: "Set who owns this lead. Assign to me is the quick option when unassigned.",
    statusWorkflow:
      "Move status to match the conversation. Enrolled only happens via Accept & invite — not by clicking Enrolled alone.",
    acceptInvite:
      "Creates portal login, sends invite email, sets addiction focus, and marks the lead Enrolled.",
    internalNotes: "Private team notes. Add one after every call or WhatsApp so follow-up is not only in your inbox.",
  },
  overview: {
    newLeads: "Enquiries still at New status — not yet fully worked.",
    overdueLeads: "Missed SLA or overdue follow-up. Start your day here.",
    awaitingFirstResponse: "No first response logged yet — needs a reply in the allowed channel.",
    enrolledClients: "Leads invited to the portal — client workflow started.",
    pendingIntakes: "Invited clients who have not finished /portal/intake/ questions.",
    inviteClientBlank:
      "Blank invite is for phone/email enquiries with no lead row. Website form leads should use Invite on the lead.",
  },
  invite: {
    leadHandoff: "Summary from the enquiry form. Confirm details before sending.",
    addictionFocus: "Unlocks pre-programme intake questions in the portal after they sign in.",
    preferredContact: "How to reach them for ongoing support — should match consent on the lead.",
    sendInvitation:
      "Sends secure email to set a password. Lead becomes Enrolled. You are not auto-assigned on the lead record.",
    noLeadSelected:
      "This blank form is for enquiries without a lead row. Website leads: use Invite on Admin → Leads instead.",
  },
  slaStates: {
    on_track: "Within first-response target and follow-up is not overdue.",
    due_soon: "First-response or follow-up due within 24 hours.",
    overdue: "First-response SLA missed, or follow-up due date has passed.",
    responded: "First response has been logged on this lead.",
  },
} as const;
