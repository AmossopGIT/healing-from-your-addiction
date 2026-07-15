# CMS Blog Admin

Admin workflow for creating and editing blog posts at `/admin/content/blog/new/` and `/admin/content/blog/[id]/`.

## Features

### Smart Upload

Paste or upload a `.md` / `.txt` file in the **Smart Upload** panel. The importer auto-detects format:

1. **Labeled writer template** — `TITLE:`, `--- BODY ---`, etc. (download from the panel or `/templates/blog-post-template.md`)
2. **Plain ChatGPT / Docs markdown** — `# Title` or a short first headline line, then `##` sections

Staff action: **Fill form from paste**. If the form already has content, confirm before overwrite.

| Detected as | Fills |
|-------------|--------|
| Template | Title, slug, excerpt, meta, keywords, category, tags, body sections |
| Article body | Title, slug, H1, excerpt, meta description (from first paragraph), body sections — staff pick category/tags |

Parser: `lib/cms/smartBlogImport.ts` (+ `lib/cms/templateImport.ts` for labeled templates)  
UI: `components/dashboard/SmartBlogUpload.tsx`

Supported template labels:

| Label | Maps to |
|-------|---------|
| `TITLE:` | Article title |
| `SLUG:` | URL slug (auto-generated from title if blank) |
| `META DESCRIPTION:` | Meta description |
| `SEO KEYWORDS:` | Primary + secondary keywords (comma-separated) |
| `H1:` | On-page H1 (defaults to title) |
| `EXCERPT:` | Excerpt (defaults to meta description or first paragraph) |
| `CATEGORY:` | Category slug (must match an allowed category) |
| `TAGS:` | Comma-separated tag slugs |
| `SEARCH INTENT:` / `CONVERSION GOAL:` | SEO workflow fields |
| `--- BODY ---` … `--- END BODY ---` | Markdown body (`##` → sections, bullets, links) |
| `INTERNAL NOTES` | Reviewer notes (not saved to CMS) |

### Essentials-first form

After upload, staff review:

1. **Essentials** — title, slug (auto from title until edited), excerpt, category, tags
2. **Body** — section count + H2 list; expand **Edit sections** only to fine-tune
3. **Hero artwork**
4. **SEO** — checklist + meta description + keywords; overrides behind **More SEO settings**

### Live side preview

The blog editor uses a two-column layout:

- **Left:** Smart Upload, essentials, body summary, hero, SEO
- **Right:** sticky **Live preview** panel (`components/dashboard/CmsBlogPreview.tsx`)

Preview updates as you type title, H1, excerpt, hero image, sections, category, and tags. On viewports under 1100px the preview stacks below the form.

### SEO checklist

Live guidance panel (`components/dashboard/CmsBlogSeoChecklist.tsx`) powered by `lib/cms/seoChecklist.ts`:

- Title length (30–65 characters)
- Meta description length (120–160 recommended)
- Primary keyword presence in title, H1, description, slug, intro, hero alt
- Category, tags, internal links, section structure
- Pass / warning / error states

Publish workflow still enforces hard gates via `lib/cms/validation.ts` (title length, meta length, hero alt, sections, etc.).

### Rich text formatting

Paragraph and bullet fields (inside **Edit sections**) include a formatting toolbar (`components/dashboard/CmsRichTextArea.tsx`):

| Tool | Inserts |
|------|---------|
| **B** | `**bold**` |
| **I** | `*italic*` |
| **H2 / H3** | `##` / `###` heading lines |
| **Sm / Lg** | `<small>` / large span classes |
| **Link** | `[text](/path/)` |
| **Img** | `![alt](/path.png)` |
| **Video** | Reminder to use section video fields |

Rendered on the public site via `lib/cms/inlineMarkdown.tsx` in `components/ContentArticleBody.tsx`.

### Section editor

Each section supports:

- H2 heading
- Paragraph blocks (blank line separates paragraphs)
- Bullet list
- H3 subsections (expand **Subheadings & video**)
- YouTube ID or self-hosted MP4 per section

Sections JSON stays available behind an advanced details panel.

### Blog categories

Categories are defined in `content/blog.ts` → `blogCategories`. Current slugs:

- `healing-program`
- `hypnotherapy`
- `addiction-recovery`
- `behavioral-addictions`
- `gambling-addiction`
- `food-addiction`
- `eft-tapping`
- `triggers-cravings`
- `family-support`
- `programme-guides`
- `south-africa-resources`

Add new categories in `blogCategories` before using them in the CMS or template import.

### Draft save behaviour

Draft save requires only **slug + title** in the admin UI.

Before writing to Supabase, `lib/cms/draftDefaults.ts` fills required NOT NULL columns (description, excerpt, H1, keywords, category, hero art, starter section).

The form uses `noValidate` so browser validation does not block incomplete drafts.

After save, the edit page loads the row via `fetchCmsBlogPostById()` with normalization in `lib/cms/normalizeCmsRow.ts`.

## Admin routes

| Route | Purpose |
|-------|---------|
| `/admin/content/blog/` | Blog post list |
| `/admin/content/blog/new/` | New post + Smart Upload |
| `/admin/content/blog/[id]/` | Edit post + workflow panel |

## Tests

```bash
npm test
```

Coverage:

- `lib/cms/smartBlogImport.test.ts` — smart detect (template vs ChatGPT article)
- `lib/cms/templateImport.test.ts` — template parsing, slug generation, body → sections
- `lib/cms/seoChecklist.test.ts` — SEO checklist rules
- `lib/cms/draftDefaults.test.ts` — draft default field filling

Config: `vitest.config.ts`

## Related files

| Area | Path |
|------|------|
| Server actions | `lib/cms/actions.ts` |
| Publish validation | `lib/cms/validation.ts` |
| SEO record mapping | `lib/cms/seo.ts` |
| Public blog render | `app/blog/[slug]/page.tsx` |
| Writer template | `public/templates/blog-post-template.md` |
| Styles | `app/globals.css` (`.cms-blog-editor-layout`, `.cms-smart-upload`, `.cms-blog-preview`) |

## Workflow reminder

1. Smart Upload the article (or write essentials by hand)
2. Check title, excerpt, category, tags, and **Live preview**
3. Add hero artwork
4. Glance at **SEO checklist** → **Save draft**
5. Use workflow panel: review → approve → publish
