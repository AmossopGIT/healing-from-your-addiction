import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentArticleBody } from "@/components/ContentArticleBody";
import { PageSeoContextScript } from "@/components/PageSeoContextScript";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import {
  blogCategoryBySlug,
  blogCategoryPath,
  blogPath,
  blogPosts,
  blogTagBySlug,
  blogTagPath,
} from "@/content/blog";
import { getSeoByPath } from "@/content/seo";
import { getMergedBlogPostBySlug } from "@/lib/cms/contentSource";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { resolveContentArt } from "@/lib/cms/mappers";
import { cmsBlogPostToSeoRecord } from "@/lib/cms/seo";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/constants";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

export const revalidate = isCmsContentEnabled() ? 300 : false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMergedBlogPostBySlug(slug);
  if (!result) {
    return createMetadata({
      title: "Blog Article Not Found | Healing From Your Addiction",
      description: "The requested blog article could not be found.",
      path: "/blog/",
      noIndex: true,
    });
  }

  const { post, cmsRow } = result;
  const art = resolveContentArt(post.heroArtId, cmsRow, "blog");
  const pageSeo = cmsRow ? cmsBlogPostToSeoRecord(cmsRow) : getSeoByPath(blogPath(post.slug));

  if (pageSeo) {
    return createPageMetadata(pageSeo, {
      ogImage: art?.src,
      ogImageAlt: art?.alt,
    });
  }

  return createMetadata({
    title: `${post.title} | Healing From Your Addiction`,
    description: post.description,
    path: blogPath(post.slug),
    keywords: [post.primaryKeyword, ...post.secondaryKeywords],
    ogImage: art?.src,
    ogImageAlt: art?.alt,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getMergedBlogPostBySlug(slug);
  if (!result) notFound();

  const { post, cmsRow } = result;
  const category = blogCategoryBySlug.get(post.categorySlug);
  const art = resolveContentArt(post.heroArtId, cmsRow, "blog");
  const pageSeo = cmsRow ? cmsBlogPostToSeoRecord(cmsRow) : getSeoByPath(blogPath(post.slug));

  return (
    <>
      {pageSeo ? <PageSeoContextScript pageSeo={pageSeo} /> : null}
      <SchemaMarkup
        data={[
          pageSeo ? webPageSchema(pageSeo) : webPageSchema(post.title, post.description, blogPath(post.slug)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog/" },
            { name: category?.title ?? "Category", path: blogCategoryPath(post.categorySlug) },
            { name: post.title, path: blogPath(post.slug) },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            url: absoluteUrl(blogPath(post.slug)),
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
            author: {
              "@type": "Person",
              name: siteConfig.owner,
            },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.siteUrl,
            },
            keywords: [post.primaryKeyword, ...post.secondaryKeywords, ...post.tagSlugs].join(", "),
            articleSection: category?.title ?? "Blog",
            image: art ? [absoluteUrl(art.src)] : undefined,
          },
        ]}
      />

      <article className="section" aria-labelledby="blog-post-heading">
        <div className="container narrow">
          <p className="eyebrow">Blog article</p>
          <h1 id="blog-post-heading">{post.h1}</h1>
          <p className="lead">{post.excerpt}</p>
          <p className="blog-meta-row">
            <span>Published {post.publishedAt}</span>
            {category ? (
              <>
                <span aria-hidden="true">•</span>
                <SiteLink href={blogCategoryPath(category.slug)}>{category.title}</SiteLink>
              </>
            ) : null}
          </p>
          {art ? <WatercolorArtwork item={art} className="section-artwork blog-hero-art" priority /> : null}
          <ContentArticleBody sections={post.sections} />

          <div className="blog-tag-list">
            {post.tagSlugs.map((tagSlug) => {
              const tag = blogTagBySlug.get(tagSlug);
              return (
                <SiteLink className="card-link" key={tagSlug} href={blogTagPath(tagSlug)}>
                  #{tag?.label ?? tagSlug}
                </SiteLink>
              );
            })}
          </div>
        </div>
      </article>
    </>
  );
}
