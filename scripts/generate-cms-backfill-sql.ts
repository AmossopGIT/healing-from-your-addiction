import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

type Payload = {
  blogs: Record<string, unknown>[];
  caseStudies: Record<string, unknown>[];
};

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function insertBlog(row: Record<string, unknown>) {
  const slug = row.slug as string;
  const json = sqlString(JSON.stringify(row));
  return `
INSERT INTO cms_blog_posts (
  slug, title, description, excerpt, h1, meta_title, meta_description,
  primary_keyword, secondary_keywords, search_intent, conversion_goal,
  canonical_path, noindex, og_image_alt, category_slug, tag_slugs, sections,
  hero_art_id, hero_art_src, hero_art_alt, hero_art_prompt, hero_art_palette,
  workflow_status, published_at
)
SELECT
  x.slug, x.title, x.description, x.excerpt, x.h1, x.meta_title, x.meta_description,
  x.primary_keyword, x.secondary_keywords, x.search_intent, x.conversion_goal,
  x.canonical_path, x.noindex, x.og_image_alt, x.category_slug, x.tag_slugs, x.sections,
  x.hero_art_id, x.hero_art_src, x.hero_art_alt, x.hero_art_prompt, x.hero_art_palette,
  x.workflow_status, x.published_at
FROM jsonb_populate_record(null::cms_blog_posts, ${json}::jsonb) AS x
WHERE NOT EXISTS (SELECT 1 FROM cms_blog_posts WHERE slug = ${sqlString(slug)});
`.trim();
}

function insertCaseStudy(row: Record<string, unknown>) {
  const slug = row.slug as string;
  const json = sqlString(JSON.stringify(row));
  return `
INSERT INTO cms_case_studies (
  slug, legacy_slug, archive_page_id, title, description, excerpt, h1, meta_title, meta_description,
  primary_keyword, secondary_keywords, search_intent, conversion_goal,
  canonical_path, noindex, og_image_alt, case_study_type, addiction_slug, tag_slugs, sections,
  hero_art_id, hero_art_src, hero_art_alt, hero_art_prompt, hero_art_palette,
  workflow_status, published_at
)
SELECT
  x.slug, x.legacy_slug, x.archive_page_id, x.title, x.description, x.excerpt, x.h1, x.meta_title, x.meta_description,
  x.primary_keyword, x.secondary_keywords, x.search_intent, x.conversion_goal,
  x.canonical_path, x.noindex, x.og_image_alt, x.case_study_type, x.addiction_slug, x.tag_slugs, x.sections,
  x.hero_art_id, x.hero_art_src, x.hero_art_alt, x.hero_art_prompt, x.hero_art_palette,
  x.workflow_status, x.published_at
FROM jsonb_populate_record(null::cms_case_studies, ${json}::jsonb) AS x
WHERE NOT EXISTS (SELECT 1 FROM cms_case_studies WHERE slug = ${sqlString(slug)});
`.trim();
}

const payload = JSON.parse(
  readFileSync(path.join(process.cwd(), "tmp", "cms-backfill-payload.json"), "utf8"),
) as Payload;

const statements = [
  ...payload.blogs.map(insertBlog),
  ...payload.caseStudies.map(insertCaseStudy),
];

const outDir = path.join(process.cwd(), "tmp");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "cms-backfill.sql"), statements.join(";\n\n") + ";\n");
console.log(`Wrote ${statements.length} insert statements.`);
