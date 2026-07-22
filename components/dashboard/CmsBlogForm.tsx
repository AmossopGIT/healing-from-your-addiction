"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { blogCategories } from "@/content/blog";
import { artGallery } from "@/content/artGallery";
import { CmsBlogPreview } from "@/components/dashboard/CmsBlogPreview";
import { CmsBlogSeoChecklist } from "@/components/dashboard/CmsBlogSeoChecklist";
import { CmsFormSubmitButton } from "@/components/dashboard/CmsFormSubmitButton";
import { CmsHeroArtFields } from "@/components/dashboard/CmsHeroArtFields";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
import { CmsTagPicker } from "@/components/dashboard/CmsTagPicker";
import { SmartBlogUpload } from "@/components/dashboard/SmartBlogUpload";
import { saveBlogPostDraft, updateBlogFromForm, type CmsFormActionState } from "@/lib/cms/actions";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";
import { cmsBlogHeroArtId } from "@/lib/cms/mappers";
import { normalizeBlogSections } from "@/lib/cms/normalizeSections";
import { slugifyTitle } from "@/lib/cms/slugify";
import type { SmartBlogImportResult } from "@/lib/cms/smartBlogImport";
import type { CmsBlogPostRow } from "@/types/cms";

type CmsBlogFormProps = {
  post?: CmsBlogPostRow;
  /** Optional error from a previous redirect (legacy). Prefer action-state errors. */
  initialError?: string | null;
};

const DEFAULT_SEARCH_INTENT = "Read an educational addiction recovery article.";
const DEFAULT_CONVERSION_GOAL = "Move readers toward a relevant programme page or confidential enquiry.";

function parseKeywordList(raw: string) {
  return raw
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function CmsBlogForm({ post, initialError = null }: CmsBlogFormProps) {
  const [actionState, formAction] = useActionState<CmsFormActionState, FormData>(
    post ? updateBlogFromForm : saveBlogPostDraft,
    {},
  );
  const formError = actionState.error || initialError;
  const galleryItems = artGallery.filter((item) => item.id.startsWith("blog-") || item.category.includes("blog"));
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [title, setTitle] = useState(post?.title ?? "");
  const [h1, setH1] = useState(post?.h1 ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [categorySlug, setCategorySlug] = useState(post?.category_slug ?? "");
  const [tagSlugs, setTagSlugs] = useState<string[]>(post?.tag_slugs ?? []);
  const [description, setDescription] = useState(post?.description ?? "");
  const [descriptionTouched, setDescriptionTouched] = useState(Boolean(post?.description));
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
  const [nextStepTip, setNextStepTip] = useState<string | null>(null);

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

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugTouched) {
      setSlug(slugifyTitle(nextTitle));
    }
  }

  function handleExcerptChange(nextExcerpt: string) {
    setExcerpt(nextExcerpt);
    if (!descriptionTouched) {
      setDescription(nextExcerpt.slice(0, cmsFieldMaxLengths.description));
    }
  }

  function handleSmartImport(result: SmartBlogImportResult) {
    const { data } = result;

    setSlug(data.slug);
    setSlugTouched(Boolean(data.slug));
    setTitle(data.title);
    setH1(data.h1 || data.title);
    setExcerpt(data.excerpt);
    setDescription(data.description || data.excerpt.slice(0, cmsFieldMaxLengths.description));
    setDescriptionTouched(Boolean(data.description || data.excerpt));
    setPrimaryKeyword(data.primaryKeyword);
    setSecondaryKeywords(data.secondaryKeywords.join(", "));
    setCategorySlug(data.categorySlug);
    setTagSlugs(data.tagSlugs);
    setSearchIntent(data.searchIntent);
    setConversionGoal(data.conversionGoal);
    setEditorInitialSections(data.sections);
    setSections(data.sections);
    setSectionsResetKey((value) => value + 1);
    setImportNotes(data.internalNotes ?? null);
    setNextStepTip("Next: pick category and tags, add hero art, then Save draft.");

    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <div className="cms-blog-editor-layout">
      <form action={formAction} className="dashboard-form cms-content-form cms-blog-editor-main" noValidate>
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="cms-staff-guide">
          <p className="cms-staff-guide-title">Quick path</p>
          <ol>
            <li>Paste or upload the article in Smart Upload.</li>
            <li>Check title, excerpt, category, and tags.</li>
            <li>Add hero art, glance at SEO, then Save draft.</li>
          </ol>
        </div>

        <SmartBlogUpload onImport={handleSmartImport} hasExistingContent={hasExistingContent} />
        {importNotes ? (
          <p className="cms-field-help">
            <strong>Internal notes from import (not published):</strong> {importNotes}
          </p>
        ) : null}
        {nextStepTip ? <p className="cms-inline-status">{nextStepTip}</p> : null}

        <fieldset className="cms-fieldset" id="cms-blog-essentials">
          <legend>Essentials</legend>
          <p className="cms-field-help">These show on the public post. Slug updates from the title until you edit it.</p>
          <label className="form-field">
            <span>Title</span>
            <input
              ref={titleInputRef}
              name="title"
              required
              maxLength={cmsFieldMaxLengths.title}
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Slug (URL path)</span>
            <input
              name="slug"
              required
              maxLength={cmsFieldMaxLengths.slug}
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="what-makes-hypnotherapy-programs-effective"
            />
          </label>
          <label className="form-field">
            <span>H1 (page headline — leave blank to use title)</span>
            <input name="h1" maxLength={cmsFieldMaxLengths.h1} value={h1} onChange={(event) => setH1(event.target.value)} />
          </label>
          <label className="form-field">
            <span>Excerpt (lead under headline)</span>
            <textarea
              name="excerpt"
              rows={3}
              required
              maxLength={cmsFieldMaxLengths.excerpt}
              value={excerpt}
              onChange={(event) => handleExcerptChange(event.target.value)}
              placeholder="Short summary under the headline — not the full article."
            />
            <span className="cms-field-help">
              {excerpt.length}/{cmsFieldMaxLengths.excerpt} characters
            </span>
          </label>
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

        <CmsSectionEditor
          key={sectionsResetKey}
          initialSections={editorInitialSections}
          onSectionsChange={setSections}
          collapsible
          defaultOpen={false}
        />

        <CmsHeroArtFields
          contentKind="blog"
          slug={slug}
          galleryItems={galleryItems}
          defaultArtId={post?.hero_art_id ?? heroArtId}
          defaultArtSrc={post?.hero_art_src ?? ""}
          defaultArtAlt={post?.hero_art_alt ?? ""}
          legend="Hero artwork"
          onAltChange={setHeroArtAlt}
          onHeroChange={({ heroArtSrc: nextSrc, heroArtAlt: nextAlt }) => {
            setHeroArtSrc(nextSrc);
            setHeroArtAlt(nextAlt);
          }}
        />

        <fieldset className="cms-fieldset">
          <legend>SEO</legend>
          <CmsBlogSeoChecklist
            title={title}
            description={description}
            metaDescription={metaDescription}
            h1={h1}
            primaryKeyword={primaryKeyword}
            secondaryKeywords={parseKeywordList(secondaryKeywords)}
            slug={slug}
            categorySlug={categorySlug}
            tagSlugs={tagSlugs}
            sections={sections}
            heroArtAlt={heroArtAlt}
          />
          <label className="form-field">
            <span>Meta description (search engines)</span>
            <textarea
              name="description"
              rows={3}
              maxLength={cmsFieldMaxLengths.description}
              value={description}
              onChange={(event) => {
                setDescriptionTouched(true);
                setDescription(event.target.value);
              }}
            />
            <span className="cms-field-help">
              Fills from excerpt automatically until you edit it. {description.length}/{cmsFieldMaxLengths.description}
            </span>
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

          <details className="cms-section-details cms-seo-advanced-details">
            <summary>More SEO settings</summary>
            <div className="cms-section-details-body">
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
            </div>
          </details>
        </fieldset>

        <div className="cms-form-actions">
          {formError ? (
            <p className="form-error" role="alert">
              Could not save: {formError}
            </p>
          ) : null}
          <CmsFormSubmitButton
            idleLabel={post ? "Save changes" : "Save draft"}
            pendingLabel={post ? "Saving…" : "Saving draft…"}
          />
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
