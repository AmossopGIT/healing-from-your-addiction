"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { caseStudies, caseStudyTypes, caseStudyTypeLabels, type CaseStudyType } from "@/content/caseStudies";
import { artGallery } from "@/content/artGallery";
import { programmes } from "@/content/programmes";
import { CmsFormSubmitButton } from "@/components/dashboard/CmsFormSubmitButton";
import { CmsHeroArtFields } from "@/components/dashboard/CmsHeroArtFields";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
import { CmsTagPicker } from "@/components/dashboard/CmsTagPicker";
import { SmartBlogUpload } from "@/components/dashboard/SmartBlogUpload";
import { saveCaseStudyDraft, updateCaseStudyFromForm, type CmsFormActionState } from "@/lib/cms/actions";
import { sectionsHaveContent } from "@/lib/cms/bodyToSections";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";
import { cmsCaseStudyHeroArtId } from "@/lib/cms/mappers";
import { normalizeBlogSections } from "@/lib/cms/normalizeSections";
import { slugifyTitle } from "@/lib/cms/slugify";
import type { SmartBlogImportResult } from "@/lib/cms/smartBlogImport";
import type { CmsCaseStudyRow } from "@/types/cms";

type CmsCaseStudyFormProps = {
  study?: CmsCaseStudyRow;
  initialError?: string | null;
};

const DEFAULT_SEARCH_INTENT = "Read an educational addiction case study or programme resource.";
const DEFAULT_CONVERSION_GOAL = "Move readers toward a relevant programme page or confidential enquiry.";

const addictionOptions = [
  ...new Set([...programmes.map((p) => p.slug), ...caseStudies.map((s) => s.addictionSlug)]),
].sort();

export function CmsCaseStudyForm({ study, initialError = null }: CmsCaseStudyFormProps) {
  const [actionState, formAction] = useActionState<CmsFormActionState, FormData>(
    study ? updateCaseStudyFromForm : saveCaseStudyDraft,
    {},
  );
  const formError = actionState.error || initialError;
  const formErrors = actionState.errors?.length
    ? actionState.errors
    : formError
      ? [formError]
      : [];
  const galleryItems = artGallery.filter((item) => item.id.startsWith("case-study-") || item.category.includes("case"));
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [slug, setSlug] = useState(study?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(study?.slug));
  const [legacySlug, setLegacySlug] = useState(study?.legacy_slug ?? study?.slug ?? "");
  const [title, setTitle] = useState(study?.title ?? "");
  const [h1, setH1] = useState(study?.h1 ?? "");
  const [excerpt, setExcerpt] = useState(study?.excerpt ?? "");
  const [caseStudyType, setCaseStudyType] = useState<CaseStudyType>(study?.case_study_type ?? "outcome");
  const [addictionSlug, setAddictionSlug] = useState(study?.addiction_slug ?? "");
  const [tagSlugs, setTagSlugs] = useState<string[]>(study?.tag_slugs ?? []);
  const [description, setDescription] = useState(study?.description ?? "");
  const [descriptionTouched, setDescriptionTouched] = useState(Boolean(study?.description));
  const [metaTitle, setMetaTitle] = useState(study?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(study?.meta_description ?? "");
  const [primaryKeyword, setPrimaryKeyword] = useState(study?.primary_keyword ?? "");
  const [secondaryKeywords, setSecondaryKeywords] = useState((study?.secondary_keywords ?? []).join(", "));
  const [searchIntent, setSearchIntent] = useState(study?.search_intent ?? DEFAULT_SEARCH_INTENT);
  const [conversionGoal, setConversionGoal] = useState(study?.conversion_goal ?? DEFAULT_CONVERSION_GOAL);
  const [ogImageAlt, setOgImageAlt] = useState(study?.og_image_alt ?? "");
  const initialSections = normalizeBlogSections(study?.sections ?? []);
  const [sections, setSections] = useState(initialSections);
  const [editorInitialSections, setEditorInitialSections] = useState(initialSections);
  const [sectionsResetKey, setSectionsResetKey] = useState(0);
  const [importNotes, setImportNotes] = useState<string | null>(null);
  const [nextStepTip, setNextStepTip] = useState<string | null>(null);

  const heroArtId = slug ? cmsCaseStudyHeroArtId(slug) : study?.hero_art_id ?? "";
  const sectionsJson = useMemo(() => JSON.stringify(sections), [sections]);
  const bodyReady = sectionsHaveContent(sections);
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
      const nextSlug = slugifyTitle(nextTitle);
      setSlug(nextSlug);
      setLegacySlug(nextSlug);
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
    setLegacySlug(data.slug);
    setTitle(data.title);
    setH1(data.h1 || data.title);
    setExcerpt(data.excerpt);
    setDescription(data.description || data.excerpt.slice(0, cmsFieldMaxLengths.description));
    setDescriptionTouched(Boolean(data.description || data.excerpt));
    setPrimaryKeyword(data.primaryKeyword);
    setSecondaryKeywords(data.secondaryKeywords.join(", "));
    setTagSlugs(data.tagSlugs);
    setSearchIntent(data.searchIntent || DEFAULT_SEARCH_INTENT);
    setConversionGoal(data.conversionGoal || DEFAULT_CONVERSION_GOAL);
    setEditorInitialSections(data.sections);
    setSections(data.sections);
    setSectionsResetKey((value) => value + 1);
    setImportNotes(data.internalNotes ?? null);
    setNextStepTip("Next: set case study type and addiction focus, add hero art, then Save draft.");

    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <form action={formAction} className="dashboard-form cms-content-form" noValidate>
      {study ? <input type="hidden" name="id" value={study.id} /> : null}

      {formErrors.length ? (
        <div className="cms-publish-blockers" role="alert">
          <p className="form-error">Could not save. Fix these and try again:</p>
          <ul>
            {formErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="cms-staff-guide">
        <p className="cms-staff-guide-title">Quick path</p>
        <ol>
          <li>
            Paste the full case study in Smart Upload <em>or</em> fill Essentials manually and paste the body with Smart
            Body Upload.
          </li>
          <li>Set case study type and addiction focus.</li>
          <li>Add hero art, then Save draft — publish from the workflow panel when ready.</li>
        </ol>
      </div>

      <SmartBlogUpload
        onImport={handleSmartImport}
        hasExistingContent={hasExistingContent}
        contentNoun="case study"
      />
      {importNotes ? (
        <p className="cms-field-help">
          <strong>Internal notes from import (not published):</strong> {importNotes}
        </p>
      ) : null}
      {nextStepTip ? <p className="cms-inline-status">{nextStepTip}</p> : null}

      <fieldset className="cms-fieldset">
        <legend>Essentials</legend>
        <p className="cms-field-help">These show on the public page. Slug updates from the title until you edit it.</p>
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
            placeholder="food-binge-eating-hahm-recovery-story"
          />
        </label>
        <label className="form-field">
          <span>Legacy slug (for redirects)</span>
          <input
            name="legacySlug"
            maxLength={cmsFieldMaxLengths.slug}
            pattern="[a-z0-9-]+"
            value={legacySlug}
            onChange={(event) => setLegacySlug(event.target.value)}
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
          />
          <span className="cms-field-help">
            {excerpt.length}/{cmsFieldMaxLengths.excerpt} characters
          </span>
        </label>
        <label className="form-field">
          <span>Case study type</span>
          <select
            name="caseStudyType"
            required
            value={caseStudyType}
            onChange={(event) => setCaseStudyType(event.target.value as CaseStudyType)}
          >
            {caseStudyTypes.map((type) => (
              <option key={type} value={type}>
                {caseStudyTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Addiction focus</span>
          <select
            name="addictionSlug"
            required
            value={addictionSlug}
            onChange={(event) => setAddictionSlug(event.target.value)}
          >
            <option value="">Select addiction focus</option>
            {addictionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <CmsTagPicker value={tagSlugs} onChange={setTagSlugs} />
      </fieldset>

      <textarea
        className="sr-only"
        name="sectionsJson"
        value={sectionsJson}
        readOnly
        aria-hidden="true"
        tabIndex={-1}
      />

      <CmsSectionEditor
        key={sectionsResetKey}
        initialSections={editorInitialSections}
        slug={slug}
        onSectionsChange={setSections}
        collapsible
        defaultOpen={false}
        includeFormField={false}
      />
      {!bodyReady ? (
        <p className="cms-field-help">
          Body is empty — use Smart Body Upload, top Smart Upload, or expand <strong>Edit sections</strong> before
          saving.
        </p>
      ) : (
        <p className="cms-inline-status">
          Body ready to save ({sections.length} section{sections.length === 1 ? "" : "s"},{" "}
          {sectionsJson.length.toLocaleString()} characters).
        </p>
      )}

      <CmsHeroArtFields
        contentKind="case-study"
        slug={slug}
        galleryItems={galleryItems}
        defaultArtId={study?.hero_art_id ?? heroArtId}
        defaultArtSrc={study?.hero_art_src ?? ""}
        defaultArtAlt={study?.hero_art_alt ?? ""}
      />

      <fieldset className="cms-fieldset">
        <legend>SEO</legend>
        <label className="form-field">
          <span>Meta description (search engines)</span>
          <textarea
            name="description"
            rows={3}
            required
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
            required
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
        {formErrors.length ? (
          <div className="cms-publish-blockers" role="alert">
            <p className="form-error">Could not save:</p>
            <ul>
              {formErrors.map((message) => (
                <li key={`footer-${message}`}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <CmsFormSubmitButton
          idleLabel={study ? "Save changes" : "Save draft"}
          pendingLabel={study ? "Saving…" : "Saving draft…"}
        />
        {study ? (
          <Link className="button button-secondary" href={`/case-studies/${study.slug}/`} target="_blank" rel="noreferrer">
            {study.workflow_status === "published" ? "View live page" : "Preview public page"}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
