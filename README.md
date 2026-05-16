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

## Lead forms on GitHub Pages

Static hosting cannot run Next.js API routes. On GitHub Pages, enquiry forms open the visitor's email client with a pre-filled message. For server-side lead capture, set `NEXT_PUBLIC_LEAD_ENDPOINT` to your form provider or backend URL in the deployment environment.

## First-time GitHub setup

1. Create a new repository named `healing-from-your-addiction` under https://github.com/AmossopGIT
2. Push this project to `main`
3. In the repository, open **Settings → Pages**
4. Under **Build and deployment**, set **Source** to **GitHub Actions**
5. After the workflow completes, open the Pages URL above
