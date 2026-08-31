---
title: Adding internal admin pages
description: How to publish new documentation in the admin docs hub.
category: Technical
order: 1
---

# Adding internal admin pages

Use this section for team-only runbooks, checklists, and operational notes. Pages are admin-authenticated and excluded from search engines.

## Quick start

1. Create a markdown file in `content/admin-docs/`, for example `content/admin-docs/client-onboarding.md`.
2. Add optional frontmatter at the top:

```md
---
title: Client onboarding
description: Steps after a lead becomes an enrolled client.
category: Operations
order: 5
---
```

3. Write the page body using normal markdown headings, lists, links, and code blocks.
4. Register the page in `content/adminDocs.ts`, add the file path to `scripts/generate-admin-doc-markdown.mjs`, then run `npm run admin-docs:bundle` (or rely on `prebuild`) so production can load it on Vercel.
5. Open `/admin/docs/` and confirm the new page appears in the hub.
6. Use **Download PDF** on any doc page to save a printable copy.

The filename becomes the URL slug. `client-onboarding.md` is served at `/admin/docs/client-onboarding/`.

## Rich guides with screens

For step-by-step guides that need styled in-app screen previews (like the admin login guide), register a custom page in `content/adminDocs.ts` with `customPage: "admin-login-guide"` and add a dedicated React guide component under `components/dashboard/adminDocs/`.

## Categories

Use one of these category values in frontmatter:

- `Operations`
- `Content`
- `Marketing`
- `Technical`
- `Meetings` — internal meeting records and planning history (see [Meeting notes index](/admin/docs/meeting-notes-index/))

If you omit `category`, the page defaults to **Technical**.

## Surfacing repo docs

To show an existing file from the `docs/` folder without moving it, register it in `content/adminDocs.ts`:

```ts
{
  slug: "resend-setup",
  title: "Resend setup",
  description: "Lead notification email configuration.",
  category: "Technical",
  order: 50,
  sourcePath: "docs/RESEND_SETUP.md",
}
```

Local files in `content/admin-docs/` take precedence when slugs match.

## Supported markdown

- Headings (`#` through `####`)
- Paragraphs and line breaks
- Bullet and numbered lists
- **Bold**, *italic*, and [links](/admin/content/)
- Fenced code blocks and inline `code`
- Blockquotes
- Simple tables

## Tips

- Keep titles plain and action-oriented.
- Link to live admin routes (`/admin/leads/`, `/admin/content/`) when helpful.
- Avoid client-identifying details in internal docs.
- Prefer short pages with one clear purpose; split long guides into separate slugs.
