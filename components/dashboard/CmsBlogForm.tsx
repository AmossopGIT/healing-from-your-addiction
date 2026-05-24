import Link from "next/link";
import { blogCategories, blogTags } from "@/content/blog";
import { artGallery } from "@/content/artGallery";
import { CmsHeroArtFields } from "@/components/dashboard/CmsHeroArtFields";
import { CmsSectionEditor } from "@/components/dashboard/CmsSectionEditor";
import { saveBlogPostDraft, updateBlogFromForm } from "@/lib/cms/actions";
import { cmsBlogHeroArtId } from "@/lib/cms/mappers";
import type { CmsBlogPostRow } from "@/types/cms";

type CmsBlogFormProps = {
  post?: CmsBlogPostRow;
};

export function CmsBlogForm({ post }: CmsBlogFormProps) {
  const slug = post?.slug ?? "";
  const action = post ? updateBlogFromForm : saveBlogPostDraft;
  const galleryItems = artGallery.filter((item) => item.id.startsWith("blog-") || item.category.includes("blog"));

  return (
    <form action={action} className="dashboard-form cms-content-form">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <fieldset className="cms-fieldset">
        <legend>Core content</legend>
        <label className="form-field">
          <span>Slug</span>
          <input name="slug" required defaultValue={post?.slug ?? ""} placeholder="what-makes-hypnotherapy-programs-effective" />
        </label>
        <label className="form-field">
          <span>Title</span>
          <input name="title" required defaultValue={post?.title ?? ""} />
        </label>
        <label className="form-field">
          <span>H1</span>
          <input name="h1" required defaultValue={post?.h1 ?? ""} />
        </label>
        <label className="form-field">
          <span>Excerpt</span>
          <textarea name="excerpt" rows={3} required defaultValue={post?.excerpt ?? ""} />
        </label>
        <label className="form-field">
          <span>Category</span>
          <select name="categorySlug" required defaultValue={post?.category_slug ?? ""}>
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
          <input name="tagSlugs" defaultValue={(post?.tag_slugs ?? []).join(", ")} placeholder={blogTags.map((tag) => tag.slug).slice(0, 4).join(", ")} />
        </label>
      </fieldset>

      <fieldset className="cms-fieldset">
        <legend>SEO metadata</legend>
        <label className="form-field">
          <span>Meta description</span>
          <textarea name="description" rows={3} required defaultValue={post?.description ?? ""} />
        </label>
        <label className="form-field">
          <span>Meta title override (optional)</span>
          <input name="metaTitle" defaultValue={post?.meta_title ?? ""} />
        </label>
        <label className="form-field">
          <span>Meta description override (optional)</span>
          <textarea name="metaDescription" rows={2} defaultValue={post?.meta_description ?? ""} />
        </label>
        <label className="form-field">
          <span>Primary keyword</span>
          <input name="primaryKeyword" required defaultValue={post?.primary_keyword ?? ""} />
        </label>
        <label className="form-field">
          <span>Secondary keywords (comma-separated)</span>
          <input name="secondaryKeywords" defaultValue={(post?.secondary_keywords ?? []).join(", ")} />
        </label>
        <label className="form-field">
          <span>Search intent</span>
          <input name="searchIntent" defaultValue={post?.search_intent ?? "Read an educational addiction recovery article."} />
        </label>
        <label className="form-field">
          <span>Conversion goal</span>
          <input
            name="conversionGoal"
            defaultValue={post?.conversion_goal ?? "Move readers toward a relevant programme page or confidential enquiry."}
          />
        </label>
        <label className="form-field">
          <span>OG image alt override (optional)</span>
          <input name="ogImageAlt" defaultValue={post?.og_image_alt ?? ""} />
        </label>
      </fieldset>

      <CmsHeroArtFields
        contentKind="blog"
        slug={slug}
        galleryItems={galleryItems}
        defaultArtId={post?.hero_art_id ?? cmsBlogHeroArtId(slug)}
        defaultArtSrc={post?.hero_art_src ?? ""}
        defaultArtAlt={post?.hero_art_alt ?? ""}
      />

      <CmsSectionEditor initialSections={post?.sections ?? []} />

      <div className="cms-form-actions">
        <button type="submit" className="button button-primary">
          {post ? "Save changes" : "Save draft"}
        </button>
        {post ? (
          <Link className="button button-secondary" href={`/blog/${post.slug}/`} target="_blank" rel="noreferrer">
            Preview static route
          </Link>
        ) : null}
      </div>
    </form>
  );
}
