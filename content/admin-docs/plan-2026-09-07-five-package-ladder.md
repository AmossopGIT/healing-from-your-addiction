---
title: "Plan: five-package healing ladder"
description: "Confirmed commercial path A–E — Free Start through Master Plan — with C vs D differentiation, UX criteria, and platform backlog."
category: Planning records
order: 20260907
---

# Plan: five-package healing ladder

**Status:** Current commercial model (7 Sep 2026). Supersedes the 31 Aug R350 / R199 / R850 ladder proposal.

**Public page:** [/programs/healing-packages/](/programs/healing-packages/)

**Related:** [31 Aug 2026 meeting](/admin/docs/meeting-2026-08-31-pricing-lead-nurture/) · [Superseded Aug 31 ladder](/admin/docs/plan-2026-08-31-product-ladder/)

## Philosophy

Nobody should be excluded from beginning healing because they cannot afford treatment. Those who can invest more receive increasing personal support, accountability and hypnotherapy.

## The five packages

| Path | Name | Duration | Hypnotherapy | Support level | Investment |
| --- | --- | --- | --- | --- | --- |
| A | Free Start | Self-paced | — | Begin | FREE |
| B | Foundation Plan | 4 months | 4 sessions (1/month) | Essential | R550/month · R2,200 total |
| C | Transformation Plan | 4 months | 8 sessions (2/month) | Deeper | R1,800/month · R7,200 total |
| D | Complete Healing Plan | 4 months | 8 sessions (2/month) | Comprehensive | R12,000 or R3,000 × 4 |
| E | Master Plan — Fast Track | 30 days | 8 sessions | Intensive | On enquiry (price TBD) |

### C vs D (same session count)

- **C** = affordable subscription + essential resources + 8 sessions
- **D** = premium comprehensive four-month programme + 8 sessions + **personal healing guidance between sessions, higher accountability, structured journey, priority scheduling**

Do not sell D as “more hypnotherapy.” Sell D as more support around the same session count.

### E is not “more expensive C”

E compresses eight sessions into **30 days**. Intensity and time commitment are the differentiator, not an extra session count.

## Delivery vs commercial path

- **Packages A–E** = what we sell / how we price the path (public site + enquiries).
- **Admin → Programmes** = interactive delivery templates after a client is invited and enrolled.
- Do not put package prices on the programme library editor. Map package → template in ops notes until productization is built.

## Gap / improvement register

### Content

| Gap | Status |
| --- | --- |
| Free Start content pack (EFT, affirmations, basic info) assembled as a clear downloadable / portal pack | Open — public page links blog / free resources for now |
| Package E rand amount | Open — Gerald to set; public says “On enquiry” |
| Final wording of D-only inclusions | Locked in plan; Gerald may refine |

### UI / UX (public page ship bar)

- First viewport: brand + one headline + philosophy + one CTA pair + art only
- Journey path with anchors A–E (no emoji / rainbow pills)
- Compare table desktop; stacked compare on mobile
- C vs D clear in under ~5 seconds via Support level + “Included beyond Package C”
- E reads as fast-track intensity, not urgency sales styling
- Package CTAs track `package_id`

### Platform (Andy backlog)

| Need | Notes |
| --- | --- |
| Payment gateway | Recurring for B/C; once-off / instalments for D; E when priced |
| Post-form package choice | Capture Free / Foundation / Transformation / Complete / Master / unsure |
| Lead `package_intent` tagging | Align with Team planning ladder tags |
| Client `package_id` field | Optional later — Payment helper text is enough for now |
| Portal entitlement by package | Out of scope until gateway exists |

## Open questions for Gerald

1. Confirm Package E investment amount.
2. Confirm D-only extras wording is clinically accurate.
3. Confirm Free Start materials list and how they are delivered (email, WhatsApp, portal, or public pages).

## Team planning

Day-to-day actions for this model live in **[Admin → Team planning](/admin/planning/)**. Keep action titles aligned with A–E — do not revive R350 / R850 / R199 as the current plan.
