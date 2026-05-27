# Healing From Your Addiction

Next.js site for confidential addiction support content, programme pages, and blog resources.

## Live preview (GitHub Pages)

After the repository is connected and Pages is enabled, the site is published at:

https://amossopgit.github.io/healing-from-your-addiction/

Watercolor artwork is served from `public/art/watercolor/` and included in the static export.

## Local development

```bash
npm install
npm run dev
```

## Production build (Node hosting)

```bash
npm run build
npm start
```

## GitHub Pages build (static export)

```bash
$env:GITHUB_PAGES="true"
$env:NEXT_PUBLIC_STATIC_EXPORT="true"
$env:NEXT_PUBLIC_BASE_PATH="/healing-from-your-addiction"
$env:NEXT_PUBLIC_SITE_URL="https://amossopgit.github.io/healing-from-your-addiction"
npm run build
```

The static output is written to `out/`.

## Lead forms and Resend

Enquiry forms POST to `/api/leads/`. Configure Resend on Node/Vercel hosting by setting `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `LEAD_NOTIFICATION_EMAIL` on the server — see [`docs/RESEND_SETUP.md`](docs/RESEND_SETUP.md).

Portal password reset and sign-up emails are sent by **Supabase Auth**. If you see “email rate limit exceeded”, enable Resend SMTP in the Supabase dashboard — see [`docs/SUPABASE_AUTH_EMAIL.md`](docs/SUPABASE_AUTH_EMAIL.md).

**GitHub Pages:** static export cannot run API routes in production. Forms fall back to mailto unless you set `NEXT_PUBLIC_LEAD_ENDPOINT` to a hosted `/api/leads/` URL (for example a Vercel deployment of this repo).

## First-time GitHub setup

1. Create a new repository named `healing-from-your-addiction` under https://github.com/AmossopGIT
2. Push this project to `main`
3. In the repository, open **Settings → Pages**
4. Under **Build and deployment**, set **Source** to **GitHub Actions**
5. After the workflow completes, open the Pages URL above
