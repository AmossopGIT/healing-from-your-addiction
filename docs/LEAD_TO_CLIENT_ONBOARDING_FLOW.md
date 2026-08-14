# Lead to client onboarding flow

Internal operations guide for Healing From Your Addiction. Use this when a new person enquires by website form, email, phone, or WhatsApp — and when you move them from lead to client portal.

> This guide describes the system as it works today. It does not invent features. A separate therapy consent PDF is not auto-sent from the backend yet.

## Purpose

Give Gerald a clear, warm, non-cold process so every enquiry:

1. Lands somewhere visible in admin
2. Gets a first human response in the right channel
3. Has consent and safety signals reviewed
4. Moves through lead statuses without getting lost
5. Is invited onto the portal only when ready

Related docs:

- Lead triage details and SLA targets: `docs/LEAD_TRIAGE_PLAYBOOK.md` (also in Admin Docs)
- Admin login: Admin Docs → How to log in as admin

---

## Two stages (do not mix them up)

### Stage A — Lead (enquiry)

Person has not been invited yet. They appear under **Admin → Leads**.

What exists here:

- Contact details and concern
- Triage / risk / urgency signals
- Follow-up consent (WhatsApp / Email / Phone)
- Emergency acknowledgement (form submissions)
- First-response templates and internal notes
- Status workflow toward invite

What does **not** happen automatically here:

- No separate consent form PDF is emailed to them by the system
- No client portal account is created
- No programme intake wizard is unlocked

### Stage B — Client (invited)

You click **Accept & invite client**. The platform:

- Emails a secure invitation
- Creates a client profile
- Marks the lead as **Enrolled**
- Lets them set a password and use the portal

After invite, pre-programme **intake questions** live in the portal at `/portal/intake/` and are reviewed by admin at `/admin/clients/[id]/intake/`.

---

## Consent: what is on the system today

### Already captured on the public enquiry form

When someone fills the website form, they must:

1. Tick **Okay to follow up using** one or more of: WhatsApp, Email, Phone call
2. Confirm: *I understand this form is for confidential enquiry support and not emergency medical care*

Those answers are stored on the lead and shown on the lead detail page under **Follow-up consent**.

### What is not on the system yet

There is **no** separate therapy / programme consent document that the backend sends when a lead arrives.

Until that exists:

- Use the form’s follow-up consent before WhatsApp/email/phone outreach
- For phone or email enquiries with no form, ask permission to continue on WhatsApp (or their preferred channel) and note it in **Internal notes**
- Keep any paper/PDF consent you already use outside the platform until a future build adds it

### Portal intake is not the consent form

Portal intake (`/portal/intake/`) is the **pre-programme question set** for the assigned addiction focus. It appears only after invite + programme focus. It is clinical/operational intake, not the lead-stage follow-up consent.

---

## End-to-end flow (one page)

```
Public form / Email / Phone / WhatsApp
                 |
                 v
        Admin → Leads list
         (/admin/leads/)
                 |
                 v
        Open lead detail
      (/admin/leads/[id]/)
                 |
                 v
   Review triage + consent + SLA
                 |
                 v
   First response (template + channel)
                 |
                 v
   Update status + follow-up due
                 |
                 v
   Person agrees to continue
                 |
                 v
   Accept & invite client
 (/admin/clients/invite/?leadId=...)
                 |
                 v
   Client sets password → portal
                 |
                 v
   Portal intake → you review intake
```

Status order (same as triage playbook):

1. New
2. Triage review
3. Outreach started
4. Care pathway defined
5. Qualified
6. Enrolled (only via invite — do not set Enrolled by status button alone)
7. Closed

---

## Where things land on the admin side

### Screen: Leads list

Path: `/admin/leads/`

```
ADMIN SCREEN — Leads / Enquiries
--------------------------------
Filters: All | Overdue | New | Triage review | ...
Table columns:
  Name | Concern | Triage | Assigned | SLA | Status | Follow-up due | Received
Click the person name → lead detail
```

What you do here:

- Check daily (more often if ads are live)
- Open **Overdue** first
- Open each **New** lead the same day when possible

### Screen: Lead detail

Path: `/admin/leads/[id]/`

```
ADMIN SCREEN — Lead detail
--------------------------------
Contact details: email, phone, preferred contact, concern, message, goals
Triage summary: priority, risk, SLA, urgency, withdrawal, medical support,
                callback window, readiness, follow-up consent
Attribution: source page, landing page, keyword, UTM
Follow-up operations: assign admin, template, due time, notes, marked-sent time
Update status buttons + “Accept & invite client”
Internal notes
```

What you do here:

1. Read triage and safety signals first
2. Check follow-up consent before messaging
3. Use the recommended first-response template
4. Contact them in the channel they allowed
5. Save follow-up fields and mark first response sent
6. Add private notes after every call/message
7. When ready, use **Accept & invite client** (not status alone)

### Screen: Invite client

Path: `/admin/clients/invite/?leadId=...`

```
ADMIN SCREEN — Invite client
--------------------------------
Lead handoff summary (concern, urgency, withdrawal, goals, callback)
Form: Full name | Email | Addiction focus | Preferred contact
Button: Send invitation
```

What the system sends:

- Supabase auth invitation email to set password at `/portal/set-password/`
- Creates `client_profiles` and links the lead
- Sets lead status to **Enrolled**

### Screen: Portal intake (client side)

Path: `/portal/intake/`

```
CLIENT SCREEN — Pre-programme questions
--------------------------------
Questions appear after programme focus is assigned
Client can save progress, then submit once
You review answers under Admin → Clients → Intake
```

---

## Entry routes: what to do for each channel

### A) Website form (Lynn / public lead form)

What the system already does:

- Saves the lead in the database
- Emails the practice notification inbox (Resend)
- Puts the person on `/admin/leads/` as **New**
- Captures consent checkboxes and triage fields

Your steps:

1. Open `/admin/leads/` and click the new name
2. Set status to **Triage review** while you read the detail
3. Confirm follow-up consent and preferred contact
4. Send first response (template) in the allowed channel
5. Set status to **Outreach started** and set a follow-up due time
6. Continue conversation until pathway is agreed → **Care pathway defined** → **Qualified**
7. Invite when they are ready → **Accept & invite client**

Do not leave form leads only in email. Always work them from the Leads screen so SLA and notes stay with the record.

### B) Email enquiry (no form)

What the system does: nothing automatic until you create a path into Leads / invite.

Your steps:

1. Reply warmly and ask preferred contact + permission for WhatsApp if needed
2. Capture the same essentials you would get from the form:
   - Full name, email, phone
   - Concern / addiction focus
   - Urgency and any withdrawal / medical support notes
   - Preferred channel and callback window
3. If they later complete a form, use that lead record as source of truth
4. When they agree to continue, invite via `/admin/clients/invite/` (leadId optional if no lead row exists)
5. Note in client handoff / internal notes that origin was email

Goal: do not keep the whole case only in your inbox. Get them onto platform Leads or Clients ASAP once they are a real prospect.

### C) Phone call

Your steps:

1. Confirm confidentiality and that this is not emergency medical care
2. If severe withdrawal or immediate risk → direct to GP / emergency care first
3. Move them onto WhatsApp only with clear permission
4. Capture notes the same day in admin (lead notes if a lead exists, otherwise after invite)
5. Send any additional questions you still need (or point them to the form if useful)
6. Invite when qualified

### D) WhatsApp (including after phone)

Your steps:

1. Confirm they consented to WhatsApp follow-up
2. Keep first messages short, non-judgmental, no cure promises
3. Mirror key decisions back into the lead record (status, due date, notes)
4. When ready, invite from admin so portal access is tracked

---

## What is sent vs captured vs internal-only

| Item | Who sees it | When |
| --- | --- | --- |
| Lead notification email | Practice inbox | On website form submit |
| Follow-up consent flags | Admin on lead detail | Form submit |
| Emergency acknowledgement | Stored with lead | Form submit |
| First-response templates | Admin copy/paste aid | Manual outreach |
| Internal notes | Admin only | Anytime |
| Invite email | Prospective client | After Accept & invite |
| Portal intake answers | Client + admin | After invite + focus assigned |
| Therapy consent PDF | Not in system yet | Manual / future |

---

## Keeping people warm (anti-cold checklist)

Use this so nobody sits unanswered:

1. **Same day:** open every New / Overdue lead
2. **Before messaging:** check follow-up consent and preferred channel
3. **After first contact:** set status to Outreach started + follow-up due
4. **After every conversation:** add an internal note (even one sentence)
5. **If waiting on them:** leave a clear follow-up due date, not a mental reminder
6. **If not a fit or no reply after agreed attempts:** set Closed and note why
7. **If ready:** invite the same day you agree — do not wait for a separate “forms pack” unless you still need offline paperwork

Suggested SLA (from triage playbook):

- Urgent: within 2 hours
- Priority: within 8 hours
- Routine: within 24 hours

---

## Admin checklist — new person today

Copy this for each new enquiry:

- [ ] Found the person on `/admin/leads/` (or created invite path if email/phone only)
- [ ] Reviewed triage priority, risk, withdrawal, medical support
- [ ] Confirmed follow-up consent / asked permission if no form
- [ ] Sent first response in allowed channel
- [ ] Marked first response sent + set follow-up due
- [ ] Updated status (Triage review → Outreach started → …)
- [ ] Added internal note
- [ ] Agreed next step with the person
- [ ] When ready: **Accept & invite client** with correct email and addiction focus
- [ ] Confirmed they received invite / can set password
- [ ] After focus assigned: remind them to complete `/portal/intake/`
- [ ] Review intake under Admin → Clients → that client → Intake before the intake conversation

---

## Common questions

### “Where is the consent form?”

On the website enquiry form: follow-up channel consent + non-emergency acknowledgement. Those values show on the lead detail page. A separate therapy consent PDF is not generated or emailed by the backend yet.

### “Does the backend send forms when a lead comes in?”

No. The backend notifies the practice and stores the lead. You send the human first response. Portal invite email is sent only when you invite.

### “When do they get portal intake?”

After you invite them and a programme / addiction focus is assigned. Intake is client-side at `/portal/intake/`.

### “Can I mark a lead Enrolled without inviting?”

No. Use **Accept & invite client**. Status alone cannot create portal access.

### “What if Lynn already collected lots of information?”

Use the lead detail as the handoff. You may still invite once they are qualified; you do not need them to re-type everything into a second public form unless you still need missing consent or contact details.

---

## Safety reminders

- Non-judgmental, plain language
- No cure or guaranteed-outcome promises
- Severe withdrawal or immediate risk → GP / emergency care first
- Respect autonomy and the channels they consented to

---

## Quick routes

| Task | Path |
| --- | --- |
| Admin login | `/admin/login/` |
| Leads list | `/admin/leads/` |
| Lead detail | `/admin/leads/[id]/` |
| Invite client | `/admin/clients/invite/` |
| Client profile | `/admin/clients/[id]/` |
| Review intake | `/admin/clients/[id]/intake/` |
| Client portal intake | `/portal/intake/` |
| This guide in admin | `/admin/docs/lead-to-client-onboarding-flow/` |
