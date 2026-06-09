# Stage 2 portal intake wizard — specification (draft)

Payment gateway is **out of scope**. Enrolment and payment remain manual after Gerald reviews the lead.

## Purpose

Replace paper/WhatsApp intake with a structured, saveable wizard in the client portal after:

1. Public lead capture (short form — unchanged)
2. Client account created (signup or admin invite)
3. Basic onboarding complete (`/portal/onboarding/`)

## Stages overview

| Stage | Where | Goal |
| --- | --- | --- |
| 1 | Public site | Light lead capture — name, contact, concern, triage |
| 2 | Portal wizard | Full intake — medical profile, symptoms, readiness, goals |
| 3 | Admin | Gerald reviews → assigns programme → releases EFT, affirmations, session docs |

## Wizard requirements

### UX

- Multi-step wizard with progress indicator (e.g. 6–8 steps)
- Save partial progress to database on each step
- Resume from last incomplete step on return
- Email reminder if incomplete after 48h / 7d (Resend templates — future)
- Mobile-friendly; same validation patterns as `LeadForm`

### Data model (proposed)

Table: `client_intake_responses`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| client_profile_id | uuid | FK → client_profiles |
| step_key | text | e.g. `medical_history`, `withdrawal`, `goals` |
| responses | jsonb | Step answers |
| completed_at | timestamptz | Null until step submitted |
| updated_at | timestamptz | |

Table: `client_intake_progress`

| Column | Type | Notes |
| --- | --- | --- |
| client_profile_id | uuid | PK |
| current_step | text | |
| percent_complete | int | |
| completed_at | timestamptz | Full intake done |

### Suggested steps (pending Gerald’s question list)

1. **About you** — age, location, occupation (optional)
2. **Primary pattern** — confirm addiction focus; co-occurring concerns (weight, anxiety, sleep)
3. **History** — duration, previous treatment, what helped / did not
4. **Withdrawal & medical** — withdrawal risk, GP involvement, medications (routes to medical pathway if severe)
5. **Triggers & context** — high-risk times, environments, emotional drivers
6. **Readiness** — decision to heal, support system, leave/time availability for intensive month
7. **Goals** — what success looks like; constraints
8. **Review & submit** — summary; consent to programme communication

### Admin visibility

- `/admin/clients/[id]/` shows intake % complete and link to responses
- Flag clients with `withdrawal_risk` severe for manual review before programme assign

### Deliverables after intake complete (existing flow)

1. Customised 30-question reflection (or integrated into wizard)
2. 4-week programme outline assigned via admin
3. EFT script released as programme session
4. Affirmations released as programme session
5. First session script unlocked

These map to existing `programme_sessions` content types: `questions`, `overview`, `eft`, `affirmations`, `hypno`.

## Gerald action required

Send the current paper/form question list so step copy and field keys can be finalised before build.

## Out of scope (this spec)

- Payment / checkout
- Automated document generation from answers (manual + template assignment first)
- Calendar booking (optional Cal.com link on thank-you — separate task)
