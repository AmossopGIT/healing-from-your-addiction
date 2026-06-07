"use client";

import Link from "next/link";
import { useState } from "react";
import { blogCategories, blogTags } from "@/content/blog";
import { artGallery } from "@/content/artGallery";
import { BlogTemplateImport } from "@/components/dashboard/BlogTemplateImport";
import { CmsBlogPreview } from "@/components/dashboard/CmsBlogPreview";
import { CmsBlogSeoChecklist } from "@/components/dashboard/CmsBlogSeoChecklist";
import { CmsHeroArtFields } from "@/components/dashboard/CmsHeroArtFields";
import { CmsRichTextArea } from "@/components/dashboard/CmsRichTextArea";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
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

export function CmsBlogForm({ post }: CmsBlogFormProps) {
  const action = post ? updateBlogFromForm : saveBlogPostDraft;
  const galleryItems = artGallery.filter((item) => item.id.startsWith("blog-") || item.category.includes("blog"));

  const [slug, setSlug] = useState(post?.slug ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [h1, setH1] = useState(post?.h1 ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [categorySlug, setCategorySlug] = useState(post?.category_slug ?? "");
  const [tagSlugs, setTagSlugs] = useState((post?.tag_slugs ?? []).join(", "));
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

  function handleTemplateImport(data: BlogTemplateImportData) {
    setSlug(data.slug);
    setTitle(data.title);
    setH1(data.h1);
    setExcerpt(data.excerpt);
    setDescription(data.description);
    setPrimaryKeyword(data.primaryKeyword);
    setSecondaryKeywords(data.secondaryKeywords.join(", "));
    setCategorySlug(data.categorySlug);
    setTagSlugs(data.tagSlugs.join(", "));
    setSearchIntent(data.searchIntent);
    setConversionGoal(data.conversionGoal);
    setEditorInitialSections(data.sections);
    setSections(data.sections);
    setSectionsResetKey((value) => value + 1);
    setImportNotes(data.internalNotes ?? null);
  }

  return (
    <div className="cms-blog-editor-layout">
      <form action={action} className="dashboard-form cms-content-form cms-blog-editor-main" noValidate>
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        <BlogTemplateImport onImport={handleTemplateImport} />
        {importNotes ? (
          <p className="cms-field-help">
            <strong>Internal notes from import (not published):</strong> {importNotes}
          </p>
        ) : null}

        <fieldset className="cms-fieldset">
          <legend>Core content</legend>
          <label className="form-field">
            <span>Slug</span>
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
            <span>H1</span>
            <input name="h1" maxLength={cmsFieldMaxLengths.h1} value={h1} onChange={(event) => setH1(event.target.value)} />
          </label>
          <CmsRichTextArea
            label="Excerpt"
            name="excerpt"
            rows={3}
            maxLength={cmsFieldMaxLengths.excerpt}
            value={excerpt}
            onChange={setExcerpt}
            placeholder="Short summary shown under the headline."
          />
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
          <label className="form-field">
            <span>Tags (comma-separated slugs)</span>
            <input
              name="tagSlugs"
              value={tagSlugs}
              onChange={(event) => setTagSlugs(event.target.value)}
              placeholder={blogTags.map((tag) => tag.slug).slice(0, 4).join(", ")}
            />
          </label>
        </fieldset>

        <fieldset className="cms-fieldset">
          <legend>SEO metadata</legend>
          <CmsBlogSeoChecklist
            title={title}
            description={description}
            metaDescription={metaDescription}
            h1={h1}
            primaryKeyword={primaryKeyword}
            secondaryKeywords={secondaryKeywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)}
            slug={slug}
            categorySlug={categorySlug}
            tagSlugs={tagSlugs.split(",").map((tag) => tag.trim()).filter(Boolean)}
            sections={sections}
            heroArtAlt={heroArtAlt}
          />
          <CmsRichTextArea
            label="Meta description"
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
          onAltChange={setHeroArtAlt}
          onHeroChange={({ heroArtSrc: nextSrc, heroArtAlt: nextAlt }) => {
            setHeroArtSrc(nextSrc);
            setHeroArtAlt(nextAlt);
          }}
        />

        <CmsSectionEditor
          key={sectionsResetKey}
          initialSections={editorInitialSections}
          onSectionsChange={setSections}
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
        tagSlugs={tagSlugs.split(",").map((tag) => tag.trim()).filter(Boolean)}
        sections={sections}
        heroArtSrc={heroArtSrc}
        heroArtAlt={heroArtAlt}
      />
    </div>
  );
}
