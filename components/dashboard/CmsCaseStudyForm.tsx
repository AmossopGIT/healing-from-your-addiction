import Link from "next/link";
import { caseStudies, caseStudyTypes, caseStudyTypeLabels } from "@/content/caseStudies";
import { artGallery } from "@/content/artGallery";
import { programmes } from "@/content/programmes";
import { CmsHeroArtFields } from "@/components/dashboard/CmsHeroArtFields";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
import { saveCaseStudyDraft, updateCaseStudyFromForm } from "@/lib/cms/actions";
import { cmsCaseStudyHeroArtId } from "@/lib/cms/mappers";
import type { CmsCaseStudyRow } from "@/types/cms";

type CmsCaseStudyFormProps = {
  study?: CmsCaseStudyRow;
};

const addictionOptions = [...new Set([...programmes.map((p) => p.slug), ...caseStudies.map((s) => s.addictionSlug)])].sort();

export function CmsCaseStudyForm({ study }: CmsCaseStudyFormProps) {
  const slug = study?.slug ?? "";
  const action = study ? updateCaseStudyFromForm : saveCaseStudyDraft;
  const galleryItems = artGallery.filter((item) => item.id.startsWith("case-study-") || item.category.includes("case"));

  return (
    <form action={action} className="dashboard-form cms-content-form">
      {study ? <input type="hidden" name="id" value={study.id} /> : null}

      <fieldset className="cms-fieldset">
        <legend>Core content</legend>
        <label className="form-field">
          <span>Slug</span>
          <input name="slug" required defaultValue={study?.slug ?? ""} placeholder="food-binge-eating-hahm-recovery-story" />
        </label>
        <label className="form-field">
          <span>Legacy slug (for redirects)</span>
          <input name="legacySlug" defaultValue={study?.legacy_slug ?? study?.slug ?? ""} />
        </label>
        <label className="form-field">
          <span>Title</span>
          <input name="title" required defaultValue={study?.title ?? ""} />
        </label>
        <label className="form-field">
          <span>H1</span>
          <input name="h1" required defaultValue={study?.h1 ?? ""} />
        </label>
        <label className="form-field">
          <span>Excerpt</span>
          <textarea name="excerpt" rows={3} required defaultValue={study?.excerpt ?? ""} />
        </label>
        <label className="form-field">
          <span>Case study type</span>
          <select name="caseStudyType" required defaultValue={study?.case_study_type ?? "outcome"}>
            {caseStudyTypes.map((type) => (
              <option key={type} value={type}>
                {caseStudyTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Addiction slug</span>
          <select name="addictionSlug" required defaultValue={study?.addiction_slug ?? ""}>
            <option value="">Select addiction focus</option>
            {addictionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Tags (comma-separated slugs)</span>
          <input name="tagSlugs" defaultValue={(study?.tag_slugs ?? []).join(", ")} />
        </label>
      </fieldset>

      <fieldset className="cms-fieldset">
        <legend>SEO metadata</legend>
        <label className="form-field">
          <span>Meta description</span>
          <textarea name="description" rows={3} required defaultValue={study?.description ?? ""} />
        </label>
        <label className="form-field">
          <span>Meta title override (optional)</span>
          <input name="metaTitle" defaultValue={study?.meta_title ?? ""} />
        </label>
        <label className="form-field">
          <span>Meta description override (optional)</span>
          <textarea name="metaDescription" rows={2} defaultValue={study?.meta_description ?? ""} />
        </label>
        <label className="form-field">
          <span>Primary keyword</span>
          <input name="primaryKeyword" required defaultValue={study?.primary_keyword ?? ""} />
        </label>
        <label className="form-field">
          <span>Secondary keywords (comma-separated)</span>
          <input name="secondaryKeywords" defaultValue={(study?.secondary_keywords ?? []).join(", ")} />
        </label>
        <label className="form-field">
          <span>Search intent</span>
          <input name="searchIntent" defaultValue={study?.search_intent ?? "Read an educational addiction case study or programme resource."} />
        </label>
        <label className="form-field">
          <span>Conversion goal</span>
          <input
            name="conversionGoal"
            defaultValue={study?.conversion_goal ?? "Move readers toward a relevant programme page or confidential enquiry."}
          />
        </label>
        <label className="form-field">
          <span>OG image alt override (optional)</span>
          <input name="ogImageAlt" defaultValue={study?.og_image_alt ?? ""} />
        </label>
      </fieldset>

      <CmsHeroArtFields
        contentKind="case-study"
        slug={slug}
        galleryItems={galleryItems}
        defaultArtId={study?.hero_art_id ?? cmsCaseStudyHeroArtId(slug)}
        defaultArtSrc={study?.hero_art_src ?? ""}
        defaultArtAlt={study?.hero_art_alt ?? ""}
      />

      <CmsSectionEditor initialSections={study?.sections ?? []} />

      <div className="cms-form-actions">
        <button type="submit" className="button button-primary">
          {study ? "Save changes" : "Save draft"}
        </button>
        {study ? (
          <Link className="button button-secondary" href={`/case-studies/${study.slug}/`} target="_blank" rel="noreferrer">
            Preview static route
          </Link>
        ) : null}
      </div>
    </form>
  );
}
