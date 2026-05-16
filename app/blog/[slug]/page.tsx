import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import {
  blogCategoryBySlug,
  blogCategoryPath,
  blogPath,
  blogPostBySlug,
  blogPosts,
  blogTagBySlug,
  blogTagPath,
} from "@/content/blog";
import { getSeoByPath } from "@/content/seo";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/constants";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostBySlug.get(slug);
  if (!post) {
    return createMetadata({
      title: "Blog Article Not Found | Healing From Your Addiction",
      description: "The requested blog article could not be found.",
      path: "/blog/",
      noIndex: true,
    });
  }

  const art = artGalleryById.get(post.heroArtId);
  const pageSeo = getSeoByPath(blogPath(post.slug));

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
  const post = blogPostBySlug.get(slug);
  if (!post) notFound();

  const category = blogCategoryBySlug.get(post.categorySlug);
  const art = artGalleryById.get(post.heroArtId);
  const pageSeo = getSeoByPath(blogPath(post.slug));

  return (
    <>
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
          <div className="blog-prose">
            {post.sections.map((section) => (
              <section key={section.h2} className="blog-section">
                <h2>{section.h2}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.h3Items?.map((item) => (
                  <div key={item.h3}>
                    <h3>{item.h3}</h3>
                    <p>{item.body}</p>
                  </div>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

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

