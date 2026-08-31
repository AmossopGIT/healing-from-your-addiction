---
title: Meeting notes index
description: Chronological record of internal planning meetings — decisions and full write-ups.
category: Meetings
order: 1
---

# Meeting notes index

Day-to-day actions live in **[Admin → Meetings](/admin/meetings/)** (Today · Future · Archive).

Use this page only for full meeting write-ups and PDFs.

## Records

| Date | Topic | Doc |
| --- | --- | --- |
| 31 Aug 2026 | Payment ladder and 30-day commercial test (plan) | [Open plan](/admin/docs/plan-2026-08-31-product-ladder/) |
| 31 Aug 2026 | Pricing, lead nurture, and platform automation | [Open meeting record](/admin/docs/meeting-2026-08-31-pricing-lead-nurture/) |

## Related operational docs

- [Lead triage playbook](/admin/docs/lead-triage-playbook/) — first response and status workflow
- [Lead to client onboarding flow](/admin/docs/lead-to-client-onboarding-flow/) — invite and intake steps
- [Marketing checklist (Gerald)](/admin/docs/marketing-checklist/) — ads, content, and weekly rhythm
- [How to log in as admin](/admin/docs/how-to-login-as-admin/) — admin access reference

## For developers (adding a new meeting)

1. Duplicate [`meeting-notes-template`](/admin/docs/meeting-notes-template/) in `content/admin-docs/`.
2. Add structured actions in `content/meetings/catalog.ts` so they appear on Today / Future.
3. Register the markdown file in `content/adminDocs.ts` and `scripts/generate-admin-doc-markdown.mjs`, then run `npm run admin-docs:bundle`.
