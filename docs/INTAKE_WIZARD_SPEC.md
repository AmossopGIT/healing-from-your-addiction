# Stage 2 portal forms — specification

Payment gateway is **out of scope**. Enrolment and payment remain manual after Gerald reviews the lead.

## Purpose

After public lead capture and client account creation, the portal collects two Stage-2 artifacts before hypnosis/EFT programme release:

1. **Addiction intake** (`/portal/intake/`) — addiction-focus pre-programme questions (kept)
2. **Hypnotherapy consultation** (`/portal/consultation/`) — full consultation + informed consent from Gerald’s paper form

## Stages overview

| Stage | Where | Goal |
| --- | --- | --- |
| 1 | Public site | Light lead capture — name, contact, concern, triage |
| 2a | Portal intake | Addiction-specific pre-programme questions |
| 2b | Portal consultation | Medical/consent consultation form (online wizard or PDF upload) |
| 3 | Admin | Gerald reviews → assigns programme → releases EFT, affirmations, session docs |

## Consultation form

### Access

- Portal-only after onboarding
- Available when Gerald sends the form email **or** the client already has a portal account (invite/signup path)
- Blank PDF: `/api/portal/consultation/blank/` (generated from the current consultation schema and styled for the current portal)

### UX

- 8-step wizard with progress indicator (Need Help–style)
- Autosave / resume
- Download blank PDF + upload completed PDF/image
- Export submitted online answers as PDF
- Safety notice when urgent safety flags are selected

### Data model

Table: `client_consultations` (migration `014_client_consultations.sql`)

Status lifecycle: `not_sent` → `sent` → `delivered` → `opened` → `started` → `in_progress` → `completed` | `uploaded`

Email delivery/open updates via Resend webhook (`/api/webhooks/resend/`). Configure `RESEND_WEBHOOK_SECRET` for signature verification.

### Admin

- `/admin/clients/[id]/consultation/` — responses, timeline, send/resend email, practitioner notes, safety banners
- Clients table shows Consultation status beside Intake

## Addiction intake (unchanged)

- Table: `client_intake_submissions`
- Route: `/portal/intake/`
- Status badges: Not started / In progress / Completed

## Out of scope

- Payment / checkout
- Auto-releasing hypnosis/EFT solely from consultation complete (admin still assigns/releases)
- Automated incomplete reminders (48h / 7d) — future
