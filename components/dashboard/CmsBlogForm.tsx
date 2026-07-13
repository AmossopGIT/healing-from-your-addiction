"use client";

import Link from "next/link";
import { useState } from "react";
import { blogCategories } from "@/content/blog";
import { artGallery } from "@/content/artGallery";
import { BlogTemplateImport, type BlogTemplateImportMode } from "@/components/dashboard/BlogTemplateImport";
import { CmsBlogPreview } from "@/components/dashboard/CmsBlogPreview";
import { CmsBlogSeoChecklist } from "@/components/dashboard/CmsBlogSeoChecklist";
import { CmsHeroArtFields } from "@/components/dashboard/CmsHeroArtFields";
import { CmsRichTextArea } from "@/components/dashboard/CmsRichTextArea";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
import { CmsTagPicker } from "@/components/dashboard/CmsTagPicker";
import { saveBlogPostDraft, updateBlogFromForm } from "@/lib/cms/actions";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";
import { cmsBlogHeroArtId } from "@/lib/cms/mappers";
import { normalizeBlogSections } from "@/lib/cms/normalizeSections";
import type { BlogTemplateImportData } from "@/lib/cms/templateImport";
import type { CmsBlogPostRow } from "@/types/cms";

type CmsBlogFormProps = {
  post?: CmsBlogPostRow;
};

const DEFAULT_SEARCH_INTENT = "Read an educational addiction recovery article.";
const DEFAULT_CONVERSION_GOAL = "Move readers toward a relevant programme page or confidential enquiry.";

function parseTagList(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function CmsBlogForm({ post }: CmsBlogFormProps) {
  const action = post ? updateBlogFromForm : saveBlogPostDraft;
  const galleryItems = artGallery.filter((item) => item.id.startsWith("blog-") || item.category.includes("blog"));

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [h1, setH1] = useState(post?.h1 ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [categorySlug, setCategorySlug] = useState(post?.category_slug ?? "");
  const [tagSlugs, setTagSlugs] = useState<string[]>(post?.tag_slugs ?? []);
  const [description, setDescription] = useState(post?.description ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [primaryKeyword, setPrimaryKeyword] = useState(post?.primary_keyword ?? "");
  const [secondaryKeywords, setSecondaryKeywords] = useState((post?.secondary_keywords ?? []).join(", "));
  const [searchIntent, setSearchIntent] = useState(post?.search_intent ?? DEFAULT_SEARCH_INTENT);
  const [conversionGoal, setConversionGoal] = useState(post?.conversion_goal ?? DEFAULT_CONVERSION_GOAL);
  const [ogImageAlt, setOgImageAlt] = useState(post?.og_image_alt ?? "");
  const [heroArtAlt, setHeroArtAlt] = useState(post?.hero_art_alt ?? "");
  const [heroArtSrc, setHeroArtSrc] = useState(post?.hero_art_src ?? "");
  const initialSections = normalizeBlogSections(post?.sections ?? []);
  const [sections, setSections] = useState(initialSections);
  const [editorInitialSections, setEditorInitialSections] = useState(initialSections);
  const [sectionsResetKey, setSectionsResetKey] = useState(0);
  const [importNotes, setImportNotes] = useState<string | null>(null);

  const heroArtId = slug ? cmsBlogHeroArtId(slug) : post?.hero_art_id ?? "";
  const hasExistingContent = Boolean(
    title.trim() ||
      excerpt.trim() ||
      description.trim() ||
      slug.trim() ||
      tagSlugs.length ||
      sections.some(
        (section) =>
          section.h2.trim() ||
          (section.paragraphs ?? []).some((paragraph) => paragraph.trim()) ||
          (section.bullets ?? []).some((bullet) => bullet.trim()),
      ),
  );

  function fillIfEmpty(current: string, next: string) {
    return current.trim() ? current : next;
  }

  function handleTemplateImport(data: BlogTemplateImportData, mode: BlogTemplateImportMode) {
    const hard = mode === "hard";

    setSlug(hard ? data.slug : fillIfEmpty(slug, data.slug));
    setTitle(hard ? data.title : fillIfEmpty(title, data.title));
    setH1(hard ? data.h1 : fillIfEmpty(h1, data.h1));
    setExcerpt(hard ? data.excerpt : fillIfEmpty(excerpt, data.excerpt));
    setDescription(hard ? data.description : fillIfEmpty(description, data.description));
    setPrimaryKeyword(hard ? data.primaryKeyword : fillIfEmpty(primaryKeyword, data.primaryKeyword));
    setSecondaryKeywords(
      hard ? data.secondaryKeywords.join(", ") : fillIfEmpty(secondaryKeywords, data.secondaryKeywords.join(", ")),
    );
    setCategorySlug(hard ? data.categorySlug : fillIfEmpty(categorySlug, data.categorySlug));
    setTagSlugs(hard ? data.tagSlugs : tagSlugs.length ? tagSlugs : data.tagSlugs);
    setSearchIntent(hard ? data.searchIntent : fillIfEmpty(searchIntent, data.searchIntent));
    setConversionGoal(hard ? data.conversionGoal : fillIfEmpty(conversionGoal, data.conversionGoal));

    const shouldReplaceSections =
      hard ||
      !sections.some(
        (section) =>
          section.h2.trim() ||
          (section.paragraphs ?? []).some((paragraph) => paragraph.trim()) ||
          (section.bullets ?? []).some((bullet) => bullet.trim()),
      );

    if (shouldReplaceSections) {
      setEditorInitialSections(data.sections);
      setSections(data.sections);
      setSectionsResetKey((value) => value + 1);
    }

    setImportNotes(data.internalNotes ?? null);
  }

  return (
    <div className="cms-blog-editor-layout">
      <form action={action} className="dashboard-form cms-content-form cms-blog-editor-main" noValidate>
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        <div className="cms-staff-guide">
          <p className="cms-staff-guide-title">How to add a blog post</p>
          <ol>
            <li>Import a template (soft or hard), or fill the fields below by hand.</li>
            <li>
              Write the <strong>excerpt</strong> (short lead under the headline) and the <strong>body</strong>{" "}
              (article sections).
            </li>
            <li>Pick category and tags, add hero art, check SEO, then save draft.</li>
          </ol>
        </div>

        <BlogTemplateImport onImport={handleTemplateImport} hasExistingContent={hasExistingContent} />
        {importNotes ? (
          <p className="cms-field-help">
            <strong>Internal notes from import (not published):</strong> {importNotes}
          </p>
        ) : null}

        <fieldset className="cms-fieldset">
          <legend>1. Title and URL</legend>
          <p className="cms-field-help">These identify the post in the admin list and on the public site URL.</p>
          <label className="form-field">
            <span>Slug (URL path)</span>
            <input
              name="slug"
              required
              maxLength={cmsFieldMaxLengths.slug}
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="what-makes-hypnotherapy-programs-effective"
            />
          </label>
          <label className="form-field">
            <span>Title</span>
            <input
              name="title"
              required
              maxLength={cmsFieldMaxLengths.title}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>H1 (page headline — leave blank to use title)</span>
            <input name="h1" maxLength={cmsFieldMaxLengths.h1} value={h1} onChange={(event) => setH1(event.target.value)} />
          </label>
        </fieldset>

        <fieldset className="cms-fieldset">
          <legend>2. Excerpt (lead under headline)</legend>
          <p className="cms-field-help">
            Short summary shown under the H1 on the public page — not the full article. Keep it to a few sentences. The
            full article goes in Body below.
          </p>
          <label className="form-field">
            <span>Excerpt</span>
            <textarea
              name="excerpt"
              rows={4}
              required
              maxLength={cmsFieldMaxLengths.excerpt}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              placeholder="Short summary shown under the headline — not the full article body."
            />
            <span className="cms-field-help">
              {excerpt.length}/{cmsFieldMaxLengths.excerpt} characters
            </span>
          </label>
        </fieldset>

        <CmsSectionEditor
          key={sectionsResetKey}
          initialSections={editorInitialSections}
          onSectionsChange={setSections}
        />

        <fieldset className="cms-fieldset">
          <legend>4. Category and tags</legend>
          <label className="form-field">
            <span>Category</span>
            <select name="categorySlug" value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
              <option value="">Select category</option>
              {blogCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <CmsTagPicker value={tagSlugs} onChange={setTagSlugs} />
        </fieldset>

        <fieldset className="cms-fieldset">
          <legend>5. SEO metadata</legend>
          <p className="cms-field-help">
            Meta description is for search engines. It is separate from the excerpt readers see under the headline.
          </p>
          <CmsBlogSeoChecklist
            title={title}
            description={description}
            metaDescription={metaDescription}
            h1={h1}
            primaryKeyword={primaryKeyword}
            secondaryKeywords={parseTagList(secondaryKeywords)}
            slug={slug}
            categorySlug={categorySlug}
            tagSlugs={tagSlugs}
            sections={sections}
            heroArtAlt={heroArtAlt}
          />
          <CmsRichTextArea
            label="Meta description (search engines)"
            name="description"
            rows={3}
            maxLength={cmsFieldMaxLengths.description}
            value={description}
            onChange={setDescription}
          />
          <label className="form-field">
            <span>Meta title override (optional)</span>
            <input
              name="metaTitle"
              maxLength={cmsFieldMaxLengths.metaTitle}
              value={metaTitle}
              onChange={(event) => setMetaTitle(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Meta description override (optional)</span>
            <textarea
              name="metaDescription"
              rows={2}
              maxLength={cmsFieldMaxLengths.metaDescription}
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Primary keyword</span>
            <input
              name="primaryKeyword"
              maxLength={cmsFieldMaxLengths.keyword}
              value={primaryKeyword}
              onChange={(event) => setPrimaryKeyword(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Secondary keywords (comma-separated)</span>
            <input
              name="secondaryKeywords"
              value={secondaryKeywords}
              onChange={(event) => setSecondaryKeywords(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Search intent</span>
            <input
              name="searchIntent"
              maxLength={cmsFieldMaxLengths.searchIntent}
              value={searchIntent}
              onChange={(event) => setSearchIntent(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Conversion goal</span>
            <input
              name="conversionGoal"
              maxLength={cmsFieldMaxLengths.conversionGoal}
              value={conversionGoal}
              onChange={(event) => setConversionGoal(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>OG image alt override (optional)</span>
            <input
              name="ogImageAlt"
              maxLength={cmsFieldMaxLengths.ogImageAlt}
              value={ogImageAlt}
              onChange={(event) => setOgImageAlt(event.target.value)}
            />
          </label>
        </fieldset>

        <CmsHeroArtFields
          contentKind="blog"
          slug={slug}
          galleryItems={galleryItems}
          defaultArtId={post?.hero_art_id ?? heroArtId}
          defaultArtSrc={post?.hero_art_src ?? ""}
          defaultArtAlt={post?.hero_art_alt ?? ""}
          legend="6. Hero artwork"
          onAltChange={setHeroArtAlt}
          onHeroChange={({ heroArtSrc: nextSrc, heroArtAlt: nextAlt }) => {
            setHeroArtSrc(nextSrc);
            setHeroArtAlt(nextAlt);
          }}
        />

        <div className="cms-form-actions">
          <button type="submit" className="button button-primary">
            {post ? "Save changes" : "Save draft"}
          </button>
          {post ? (
            <Link className="button button-secondary" href={`/blog/${post.slug}/`} target="_blank" rel="noreferrer">
              Preview public page
            </Link>
          ) : null}
        </div>
      </form>

      <CmsBlogPreview
        title={title}
        h1={h1}
        excerpt={excerpt}
        description={description}
        slug={slug}
        categorySlug={categorySlug}
        tagSlugs={tagSlugs}
        sections={sections}
        heroArtSrc={heroArtSrc}
        heroArtAlt={heroArtAlt}
      />
    </div>
  );
}
