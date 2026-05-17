import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import {
  blogTagBySlug,
  blogTagPath,
  blogTags,
  getPostsByTag,
} from "@/content/blog";
import { getSeoByPath } from "@/content/seo";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/constants";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogTags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = blogTagBySlug.get(slug);
  if (!tag) {
    return createMetadata({
      title: "Blog Tag Not Found | Healing From Your Addiction",
      description: "The requested blog tag could not be found.",
      path: "/blog/",
      noIndex: true,
    });
  }

  const pageSeo = getSeoByPath(blogTagPath(tag.slug));
  if (pageSeo) {
    return createPageMetadata(pageSeo);
  }

  return createMetadata({
    title: `${tag.label} Articles | Healing From Your Addiction`,
    description: `Browse tagged blog articles for ${tag.label.toLowerCase()} from Healing From Your Addiction.`,
    path: blogTagPath(tag.slug),
    keywords: [
      `${tag.label.toLowerCase()} addiction articles`,
      "tagged addiction blog content",
      "addiction support educational tags",
    ],
  });
}

export default async function BlogTagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = blogTagBySlug.get(slug);
  if (!tag) notFound();

  const posts = getPostsByTag(tag.slug);
  const pageSeo = getSeoByPath(blogTagPath(tag.slug));

  return (
    <>
      <SchemaMarkup
        data={[
          pageSeo
            ? webPageSchema(pageSeo)
            : webPageSchema(`${tag.label} tagged articles`, `Tagged articles for ${tag.label}.`, blogTagPath(tag.slug)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog/" },
            { name: `Tag: ${tag.label}`, path: blogTagPath(tag.slug) },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${tag.label} tag`,
            url: absoluteUrl(blogTagPath(tag.slug)),
            description: `Tagged articles for ${tag.label}.`,
          },
        ]}
      />

      <section className="section-band page-hero-flush" aria-labelledby="blog-tag-heading">
        <div className="container">
          <p className="eyebrow">Tagged archive</p>
          <h1 id="blog-tag-heading">Tag: {tag.label}</h1>
          <p className="section-intro narrow">
            This tag page groups related blog content so readers and search engines can discover connected resources.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="blog-tag-posts-heading">
        <div className="container">
          <div className="section-heading">
            <h2 id="blog-tag-posts-heading">Articles with this tag</h2>
          </div>
          <p className="blog-hub-count">{posts.length} articles with this tag</p>
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
          <p className="blog-hub-back">
            <SiteLink className="card-link" href="/blog/">
              Back to all resources
            </SiteLink>
          </p>
        </div>
      </section>
    </>
  );
}

