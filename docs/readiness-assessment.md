# Addiction Healing Readiness Assessment (AHRA)

Reflective assessment based on Gerald Crawford’s “Am I ready to heal from my addiction?” framework:

**Readiness ≈ Commitment × Self-Awareness × Emotional Capacity**

This is a conversation tool — not a diagnosis, admission test, crisis service, or outcome guarantee.

## Where people take it

| Surface | URL | Who |
|--------|-----|-----|
| Public site | `/addiction-healing-readiness-assessment/` | Guests and signed-in clients |
| Client portal | `/portal/readiness/` | Signed-in clients |
| Admin review | `/admin/clients/[id]/readiness/` | Staff |

- **Guests** complete the wizard first, then create a free account or sign in to save and see results.
- **Signed-in clients** skip the account gate; results save straight to their profile and show immediately.
- Same assessment can be started, continued, or retaken on the public page or in the portal.

**Send link (production):** `https://healingfromyouraddiction.co.za/addiction-healing-readiness-assessment/`

## Flow

1. Intro + rating guide (1–10 bands).
2. Three foundation scales (Commitment, Self-Awareness, Emotional Capacity), five items each + confirmation rating.
3. Three readiness gate questions (yes/no + awareness reflection).
4. Safety screening (urgent medical / psychiatric / emergency / danger).
5. Privacy consent (storage, admin review, retention, deletion).
6. **If guest:** inline Create account / Sign in → claim draft → results.
7. **If client:** save to profile → results on the same surface.
8. Admin notification when a completed assessment is saved.

## Scoring (high level)

- Section scores average the five scale items (confirmation ratings inform gates/focus, not the section average).
- Overall readiness index is a normalized 0–100 view of the Commitment × Awareness × Capacity idea.
- Soft language (“may need support first”); scores below 7 on a foundation suggest focus there first.
- Gate “No” answers and urgent safety answers adjust focus / next-step guidance.

Content and scoring live in `content/readinessAssessment.ts` (versioned).

## Key code

| Area | Path |
|------|------|
| Public page | `app/addiction-healing-readiness-assessment/page.tsx` |
| Portal page | `app/portal/(protected)/readiness/page.tsx` |
| Admin review | `app/admin/(protected)/clients/[id]/readiness/page.tsx` |
| Wizard | `components/assessment/ReadinessAssessmentWizard.tsx` |
| Inline auth gate | `components/assessment/ReadinessAccountGate.tsx` |
| Results UI | `components/assessment/ReadinessAssessmentResults.tsx` |
| Server actions | `lib/dashboard/readinessAssessmentActions.ts` |
| Draft crypto | `lib/readiness/draftCrypto.ts` |
| Parse / validate | `lib/readiness/parse.ts` |
| Migrations | `supabase/migrations/019_readiness_assessments.sql`, `020_harden_readiness_assessments.sql` |

## Data & privacy

- Completed answers store on `readiness_assessments` (linked to `client_profiles`), with history via `is_current` / `attempt_number`.
- Anonymous progress can use encrypted server drafts (`readiness_assessment_drafts`, short TTL) plus session storage so email verification on another device can resume.
- Minimal `client_profiles` row is allowed before full onboarding so readiness can save early (`/portal/readiness/` is allowed while onboarding is incomplete).
- Retention guidance: seven years; clients can request deletion (see privacy copy in the wizard).
- Recommended env: `READINESS_DRAFT_SECRET` for draft encryption (falls back to other server secrets if unset).

## Auth rules (important)

- Post-signup / login `next` for readiness must stay on `/portal/readiness/…` (not forced into full onboarding or `/admin/`).
- Middleware honors `?next=/portal/readiness/…` for already-signed-in clients.
- Admin emails cannot complete the client readiness gate; use a client account.
- Staff admin link is hidden on readiness-focused auth copy.

## SEO & analytics

- SEO record: `content/seo.ts` → `seoPages.readinessAssessment`
- Keyword row: `docs/SEO_KEYWORDS.md`
- Events allowlisted in `lib/analytics/schema.ts` (start, step, account gate, save attempt/success/error)

## Tests

```bash
npx vitest run lib/readiness/
```

## Ops checklist before production send

1. Migrations `019` / `020` applied on the HFYA Supabase project.
2. App deployed with this code (route live on production).
3. Optional: set `READINESS_DRAFT_SECRET` in Vercel/env.
4. Smoke: guest complete → signup → portal results; logged-in client complete on public + portal; admin sees review + notification.
