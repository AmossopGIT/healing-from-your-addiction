"use client";

import Link from "next/link";
import type { BlogSection } from "@/content/blog";
import { blogCategories, blogCategoryBySlug, blogTagBySlug } from "@/content/blog";
import { ContentArticleBody } from "@/components/ContentArticleBody";
import { ArticleInlineContent } from "@/lib/cms/inlineMarkdown";

type CmsBlogPreviewProps = {
  title: string;
  h1: string;
  excerpt: string;
  description: string;
  slug: string;
  categorySlug: string;
  tagSlugs: string[];
  sections: BlogSection[];
  heroArtSrc: string;
  heroArtAlt: string;
  /** When true, show View live instead of Draft view. */
  isLive?: boolean;
};

export function CmsBlogPreview({
  title,
  h1,
  excerpt,
  description,
  slug,
  categorySlug,
  tagSlugs,
  sections,
  heroArtSrc,
  heroArtAlt,
  isLive = false,
}: CmsBlogPreviewProps) {
  const category = blogCategoryBySlug.get(categorySlug);
  const previewSections = sections.some(
    (section) => section.h2.trim() || (section.paragraphs ?? []).some((p) => p.trim()),
  )
    ? sections
    : [{ h2: "Introduction", paragraphs: ["Your article body will appear here as you write."] }];
  const publicPath = slug ? `/blog/${slug}/` : "";

  return (
    <aside className="cms-blog-preview" aria-label="Live blog preview">
      <div className="cms-blog-preview-header">
        <p className="cms-blog-preview-title">Live preview</p>
        {isLive && publicPath ? (
          <Link className="cms-seo-badge cms-seo-badge-ready cms-preview-live-link" href={publicPath} target="_blank" rel="noreferrer">
            View live
          </Link>
        ) : (
          <span className="cms-seo-badge cms-seo-badge-pending">Draft view</span>
        )}
      </div>

      <div className="cms-blog-preview-scroll">
        <article className="cms-blog-preview-article">
          <p className="eyebrow">Blog article</p>
          <h1>{h1.trim() || title.trim() || "Article title"}</h1>
          <p className="lead">
            <ArticleInlineContent text={excerpt.trim() || description.trim() || "Excerpt appears here under the headline."} />
          </p>
          <p className="blog-meta-row">
            <span>{isLive ? "Live on site" : "Draft preview"}</span>
            {category ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{category.title}</span>
              </>
            ) : null}
          </p>

          {heroArtSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroArtSrc} alt={heroArtAlt || title || "Hero artwork"} className="cms-blog-preview-hero" />
          ) : (
            <div className="cms-blog-preview-hero cms-blog-preview-hero-placeholder">Hero image preview</div>
          )}

          <ContentArticleBody sections={previewSections} />

          {tagSlugs.length ? (
            <div className="blog-tag-list">
              {tagSlugs.map((tagSlug) => {
                const tag = blogTagBySlug.get(tagSlug);
                return (
                  <span className="card-link" key={tagSlug}>
                    #{tag?.label ?? tagSlug}
                  </span>
                );
              })}
            </div>
          ) : null}

          {slug ? <p className="cms-blog-preview-url">/blog/{slug}/</p> : null}
          {!categorySlug ? (
            <p className="cms-field-help">Choose a category from {blogCategories.length} available topics.</p>
          ) : null}
        </article>
      </div>
    </aside>
  );
}
