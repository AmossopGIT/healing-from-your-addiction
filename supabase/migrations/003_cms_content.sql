-- CMS content: blog posts, case studies, editorial workflow

CREATE TABLE IF NOT EXISTS cms_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  h1 TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  primary_keyword TEXT NOT NULL,
  secondary_keywords TEXT[] NOT NULL DEFAULT '{}',
  search_intent TEXT,
  conversion_goal TEXT,
  canonical_path TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  og_image_alt TEXT,
  category_slug TEXT NOT NULL,
  tag_slugs TEXT[] NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '[]',
  hero_art_id TEXT NOT NULL,
  hero_art_src TEXT NOT NULL,
  hero_art_alt TEXT NOT NULL,
  hero_art_prompt TEXT,
  hero_art_palette TEXT[] NOT NULL DEFAULT '{}',
  workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    workflow_status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'archived')
  ),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  review_notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_blog_posts_slug_idx ON cms_blog_posts(slug);
CREATE INDEX IF NOT EXISTS cms_blog_posts_status_idx ON cms_blog_posts(workflow_status);
CREATE INDEX IF NOT EXISTS cms_blog_posts_published_at_idx ON cms_blog_posts(published_at DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS cms_case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  legacy_slug TEXT NOT NULL DEFAULT '',
  archive_page_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  h1 TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  primary_keyword TEXT NOT NULL,
  secondary_keywords TEXT[] NOT NULL DEFAULT '{}',
  search_intent TEXT,
  conversion_goal TEXT,
  canonical_path TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  og_image_alt TEXT,
  case_study_type TEXT NOT NULL CHECK (
    case_study_type IN ('outcome', 'script', 'questions', 'affirmations', 'programme')
  ),
  addiction_slug TEXT NOT NULL,
  tag_slugs TEXT[] NOT NULL DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '[]',
  hero_art_id TEXT NOT NULL,
  hero_art_src TEXT NOT NULL,
  hero_art_alt TEXT NOT NULL,
  hero_art_prompt TEXT,
  hero_art_palette TEXT[] NOT NULL DEFAULT '{}',
  workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    workflow_status IN ('draft', 'in_review', 'approved', 'scheduled', 'published', 'archived')
  ),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  review_notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_case_studies_slug_idx ON cms_case_studies(slug);
CREATE INDEX IF NOT EXISTS cms_case_studies_status_idx ON cms_case_studies(workflow_status);
CREATE INDEX IF NOT EXISTS cms_case_studies_published_at_idx ON cms_case_studies(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS cms_case_studies_legacy_slug_idx ON cms_case_studies(legacy_slug);

CREATE TABLE IF NOT EXISTS cms_workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('blog_post', 'case_study')),
  content_id UUID NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  notes TEXT,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_workflow_events_content_idx ON cms_workflow_events(content_type, content_id);

CREATE TRIGGER cms_blog_posts_updated_at
  BEFORE UPDATE ON cms_blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cms_case_studies_updated_at
  BEFORE UPDATE ON cms_case_studies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Public read for published / due scheduled content
CREATE OR REPLACE FUNCTION cms_is_publicly_visible(status TEXT, scheduled TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
  SELECT status = 'published'
    OR (status = 'scheduled' AND scheduled IS NOT NULL AND scheduled <= NOW());
$$ LANGUAGE sql IMMUTABLE;

ALTER TABLE cms_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_workflow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY cms_blog_posts_admin_all ON cms_blog_posts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY cms_blog_posts_public_read ON cms_blog_posts FOR SELECT USING (
  cms_is_publicly_visible(workflow_status, scheduled_for)
);

CREATE POLICY cms_case_studies_admin_all ON cms_case_studies FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY cms_case_studies_public_read ON cms_case_studies FOR SELECT USING (
  cms_is_publicly_visible(workflow_status, scheduled_for)
);

CREATE POLICY cms_workflow_events_admin_all ON cms_workflow_events FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Public artwork bucket for CMS uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-artwork',
  'cms-artwork',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY cms_artwork_storage_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'cms-artwork');

CREATE POLICY cms_artwork_storage_admin_write ON storage.objects
  FOR ALL USING (bucket_id = 'cms-artwork' AND is_admin())
  WITH CHECK (bucket_id = 'cms-artwork' AND is_admin());
