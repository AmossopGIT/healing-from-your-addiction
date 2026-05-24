# Architecture

## Stack

- Next.js App Router
- React
- TypeScript
- CSS in `app/globals.css`
- Data-driven content files under `content/`
- Reusable components under `components/`

## Folder structure

```txt
app/
  page.tsx
  gambling-addiction-help/page.tsx
  food-addiction-binge-eating-help/page.tsx
  about-the-therapist/page.tsx
  addiction-healing-programmes/page.tsx
  contact/page.tsx
  thank-you/page.tsx
  api/leads/route.ts
components/
content/
lib/
public/
docs/
```

## Content model

Gambling and food pages use `LandingPageContent`. Future addiction categories should be added by creating a new content file and rendering it with `ProgrammeLandingPage`.

## Form handling

Current implementation posts to `/api/leads/`, validates basic fields, ignores honeypot spam and redirects client-side to `/thank-you/` after success.

Lead notifications are sent with [Resend](https://resend.com) when `RESEND_API_KEY` and related server env vars are set. See `docs/RESEND_SETUP.md`.

When Supabase is configured, validated leads are also persisted to the `leads` table via the service role client.

## Dashboard architecture

Authenticated admin and client dashboards use Supabase Auth + Postgres with RLS:

- `/admin/*` — lead CRM, client invites, programme management (admin role only)
- `/portal/*` — client programme portal (client role only, invite-only registration)

Key paths:

- `lib/supabase/` — browser/server/service Supabase clients and auth helpers
- `middleware.ts` — session refresh and role-based route protection
- `supabase/migrations/` — schema, RLS policies, storage bucket
- `app/admin/(protected)/` — admin dashboard routes
- `app/portal/(protected)/` — client portal routes

Dashboard routes are excluded from the public sitemap and use `noIndex` metadata.

Deploy dashboard features on a server-capable host (for example Vercel). Static GitHub Pages export cannot run authenticated API routes in-app.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_CONTACT_PHONE`
- `RESEND_API_KEY` (server only)
- `RESEND_FROM_EMAIL` (server only)
- `LEAD_NOTIFICATION_EMAIL` (server only)
- `NEXT_PUBLIC_LEAD_ENDPOINT` (optional, for static sites calling a remote API)
- `LEAD_API_ALLOWED_ORIGINS` (optional CORS allowlist)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

## SEO architecture

Use `createMetadata` for titles, descriptions, canonical URLs and Open Graph metadata.

Use schema helpers for:

- Organization
- ProfessionalService
- WebPage
- FAQPage
- BreadcrumbList
