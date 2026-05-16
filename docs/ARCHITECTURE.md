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
  about-gerald-crawford/page.tsx
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

Before launch, connect the API route to secure email, CRM, Supabase or another protected lead destination.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_CONTACT_PHONE`

## SEO architecture

Use `createMetadata` for titles, descriptions, canonical URLs and Open Graph metadata.

Use schema helpers for:

- Organization
- ProfessionalService
- WebPage
- FAQPage
- BreadcrumbList
