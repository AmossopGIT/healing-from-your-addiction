# Lead Triage Playbook

## Purpose

Provide consistent, clinically safe first responses and follow-up handling for all HFYA enquiries.

For the full lead → invite → portal intake walkthrough (screens, channels, consent, checklist, Download PDF), open Admin Docs → Lead to client onboarding flow (`/admin/docs/lead-to-client-onboarding-flow/`). Repo pointer: `docs/LEAD_TO_CLIENT_ONBOARDING_FLOW.md`.

On the Leads list, use **Open**, **Invite**, **Assign to me**, and **Follow-up due** Save so enquiries do not go cold. Prefer inviting from a lead — not from a blank sidebar Invite form.

## Intake signals to review first

- `triage_priority` (`routine`, `priority`, `urgent`)
- `risk_flag` (`standard`, `priority`, `urgent_review`)
- `urgency_level`
- `withdrawal_risk`
- `medical_support_involved`
- `readiness_stage`
- `callback_window`

## Suggested first response targets

- `urgent`: respond in <= 2 hours
- `priority`: respond in <= 8 hours
- `routine`: respond in <= 24 hours

## Status workflow

1. `new`: received but not reviewed — open the lead, check consent, start triage
2. `triage_review`: intake reviewed and safety checked — send first response and set follow-up due
3. `outreach_started`: first response sent — keep talking and agree the pathway
4. `care_pathway_defined`: next-step plan agreed — confirm fit and willingness
5. `qualified`: suitable and willing to continue — use Accept & invite client
6. `enrolled`: invited/enrolled to client workflow — only via invite, not status alone
7. `closed`: no further action for now — note why

## Safety language standards

- Use non-judgmental, plain language.
- Do not promise cure or guaranteed outcomes.
- If severe withdrawal or immediate risk is indicated, direct to GP/emergency care immediately.
- Keep communication trauma-informed and autonomy-respecting.
