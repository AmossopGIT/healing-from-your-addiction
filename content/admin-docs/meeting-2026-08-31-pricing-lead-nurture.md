---
title: "Meeting: pricing, lead nurture, and platform automation"
description: "31 Aug 2026 — ads are working but many leads cannot pay R12,000 now; plan free content nurture, pricing rethink, and automation."
category: Meetings
order: 20260831
---

# Meeting: pricing, lead nurture, and platform automation

## Meeting details

| Field | Value |
| --- | --- |
| **Date** | 31 August 2026 |
| **Attendees** | Gerald Crawford, Andy |
| **Format** | Planning discussion (voice / sync) |
| **Facilitator** | Joint |

## Summary

Client ads are bringing enquiries, but **getting people into the system** and **converting at R12,000 upfront** is the bottleneck. Many prospects (gambling, food / binge eating) recognise they need help but cannot afford full programme fees today. The plan is to **keep them in the database as leads**, serve **free articles and newsletters** by concern, warm them over time (cold → hot), and **restructure pricing** into smaller weekly or monthly amounts plus lower-cost group access. Payment gateway setup, content automation, and clearer admin workflows are priority platform work.

## Context

- Ads are working; lead volume is improving.
- Gerald collects phone, email, name, and surname manually from WhatsApp and other channels.
- Current programme positioning: **4 weeks, 8 sessions, R12,000** — felt as too large a shock number.
- Gerald already runs **Wednesday evening online group sessions (7–8pm)** at **R350** with strong feedback.
- Gambling platforms use **recurring micro-subscriptions** (daily / weekly / monthly auto-debit) — same mechanism could support healing subscriptions.
- Physical milestone rewards (medals, coins, tokens) discussed as a differentiator for clients who complete stages.

## Decisions

1. **Do not lose unpaid prospects** — keep them in the system as leads and nurture with free content; do not require payment before entering the database.
2. **Restructure how price is presented** — break R12,000 into smaller instalments (e.g. R3,000/week × 4 weeks) and explore monthly subscription tiers (R99–R199/month) rather than leading with the full amount.
3. **Group therapy is a valid lower-cost entry product** — continue and potentially productise Wednesday online sessions while full programme pricing is refined.
4. **Payment gateway is a near-term priority** — Gerald to set up bank account; platform needs online payment so lead type (cold / paying / subscribed) is known in the system.
5. **Gerald to review admin docs** for invite and lead workflow; Andy to resend admin login and consultation form links.
6. **Pricing model to be revisited** — Gerald will research competitors and return with tier proposals; no final numbers locked in this meeting.

## Action items

### Gerald

| Status | Action | Due |
| --- | --- | --- |
| Open | Load all WhatsApp / phone / ad leads into [Admin → Leads](/admin/leads/) — clear the manual entry bottleneck | Ongoing — start this week |
| Open | Review [Lead triage playbook](/admin/docs/lead-triage-playbook/) and [Lead to client onboarding flow](/admin/docs/lead-to-client-onboarding-flow/) | This week |
| Open | Publish new blog drafts via [Admin → Content](/admin/content/blog/) | This week |
| Open | Research competitor pricing; propose tiers (weekly, monthly, group R350, full programme) | Before next pricing sync |
| Open | Set up bank account for payment gateway integration | When ready for Andy |
| Open | Explore physical reward supplier (medals / coins / 3D-printed trophies) for milestone gifts | Open |
| Open | Continue Wednesday group sessions as lower-cost entry offer | Weekly |
| Open | Confirm ads land on addiction-specific pages (gambling, food) — not homepage only | Ongoing |

### Andy (platform)

| Status | Action | Due |
| --- | --- | --- |
| Open | Resend admin login instructions and portal consultation form link to Gerald | Immediate |
| Open | Improve manual lead entry from WhatsApp / phone (faster path when no website form) | TBD |
| Open | Lead segmentation — cold (free content) vs warm vs hot vs paying client | TBD |
| Open | Auto-notify subscribers when blog content is published, filtered by addiction concern | TBD |
| Open | Nurture sequences — e.g. quarterly “Are you ready?” for non-paying leads | TBD |
| Open | Payment gateway once bank account ready — weekly instalments, monthly tier, group session booking | After bank setup |
| Open | Post-session feedback email automation after group / individual sessions | TBD |
| Open | Form completion tracking — % finishing intake and consultation | TBD |
| Open | Group session invite flow from admin | TBD |
| Open | Update programme landing copy — show per-week / per-month pricing, not R12,000 shock upfront | After pricing decision |

### Joint / to decide

| Status | Topic | Options discussed |
| --- | --- | --- |
| Open | Primary offer for cold leads | Free newsletter only vs low-cost group (R350) vs both |
| Open | Monthly subscription price | R99 vs R199 — what content / access is included |
| Open | Full programme payment structure | R3,000/week × 4 vs spread over 12 months vs hybrid |
| Open | Notification channels | Email only vs push vs SMS vs all three |
| Open | Content routing | By lead concern field vs explicit newsletter preference in settings |
| Open | When to invite to portal | Only when paying vs also for free-tier leads (intake without programme) |

## Open questions

- What is the exact “sweet spot” daily or weekly micro-payment (e.g. R5/day SMS tier)?
- Should milestone medals be sent manually at first or tracked in the platform from day one?
- Does a 12-month programme timeline change clinical delivery or only billing presentation?

## Platform notes (as of this meeting)

| Area | Status |
| --- | --- |
| Website lead capture → [Admin → Leads](/admin/leads/) | Live |
| Lead workflow statuses (New → Enrolled) | Live |
| WhatsApp / phone leads | Manual — no auto-import; use invite or lead record |
| [Portal consultation + consent](/portal/consultation/) | Live (HFYA form — not the old Rand Pro form) |
| [Portal intake](/portal/intake/) | Live |
| Payment gateway / checkout | Not built — payment tracked manually on client profile |
| Auto-email on blog publish | Not built — push broadcast is manual at [Notifications](/admin/notifications/) |
| Cold / hot lead taxonomy | Not built — workflow statuses only |
| Quarterly nurture automation | Not built |

**Admin login reference:** `healingfromyouraddiction@geraldcrawford.co.za` at `/admin/login/` (see [How to log in as admin](/admin/docs/how-to-login-as-admin/)).

**Consultation form:** `/portal/consultation/` (blank PDF: `/api/portal/consultation/blank/`).

## Suggested priority order

1. **Fix lead entry bottleneck** — Gerald loads contacts; Andy improves manual entry UX.
2. **Free content + newsletter automation** — publish blogs; auto-notify by concern.
3. **Payment gateway + tiered products** — after bank account; weekly / monthly / group.
4. **Nurture sequences + post-session emails** — warm cold leads toward full programme.
5. **Milestone rewards + premium upsell** — physical tokens and one-on-one tiers.

## Follow-up

- Gerald to review pricing options and sync with Andy on next call.
- Gerald to confirm admin access and read internal docs this week.
- Andy to send login / form links and continue platform automation backlog.

## Related docs

- [Meeting notes index](/admin/docs/meeting-notes-index/)
- [Plan: payment ladder and 30-day commercial test](/admin/docs/plan-2026-08-31-product-ladder/)
- [Lead triage playbook](/admin/docs/lead-triage-playbook/)
- [Lead to client onboarding flow](/admin/docs/lead-to-client-onboarding-flow/)
- [Marketing checklist (Gerald)](/admin/docs/marketing-checklist/)
- [How to log in as admin](/admin/docs/how-to-login-as-admin/)
