import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { blogCategories, blogCategoryBySlug, blogCategoryPath } from "@/content/blog";
import { getMergedPostsByCategory } from "@/lib/cms/contentSource";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { getSeoByPath } from "@/content/seo";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/constants";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

export const revalidate = isCmsContentEnabled() ? 300 : false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = blogCategoryBySlug.get(slug);
  if (!category) {
    return createMetadata({
      title: "Blog Category Not Found | Healing From Your Addiction",
      description: "The requested blog category could not be found.",
      path: "/blog/",
      noIndex: true,
    });
  }

  const art = artGalleryById.get(category.heroArtId);
  const pageSeo = getSeoByPath(blogCategoryPath(category.slug));

  if (pageSeo) {
    return createPageMetadata(pageSeo, {
      ogImage: art?.src,
      ogImageAlt: art?.alt,
    });
  }

  return createMetadata({
    title: `${category.title} Blog Articles | Healing From Your Addiction`,
    description: category.description,
    path: blogCategoryPath(category.slug),
    keywords: [
      category.primaryKeyword,
      `${category.title.toLowerCase()} addiction articles`,
      "addiction blog category",
      "tagged addiction resources",
    ],
    ogImage: art?.src,
    ogImageAlt: art?.alt,
  });
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = blogCategoryBySlug.get(slug);
  if (!category) notFound();

  const posts = await getMergedPostsByCategory(category.slug);
  const art = artGalleryById.get(category.heroArtId);
  const pageSeo = getSeoByPath(blogCategoryPath(category.slug));

  return (
    <>
      <SchemaMarkup
        data={[
          pageSeo
            ? webPageSchema(pageSeo)
            : webPageSchema(`${category.title} Blog Category`, category.description, blogCategoryPath(category.slug)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog/" },
            { name: category.title, path: blogCategoryPath(category.slug) },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${category.title} articles`,
            url: absoluteUrl(blogCategoryPath(category.slug)),
            description: category.description,
          },
        ]}
      />

      <section className="section-band page-hero-flush" aria-labelledby="blog-category-heading">
        <div className="container">
          <p className="eyebrow">Blog category</p>
          <h1 id="blog-category-heading">{category.title} Articles</h1>
          <p className="section-intro narrow">{category.description}</p>
          {art ? <WatercolorArtwork item={art} className="section-inline-art" /> : null}
        </div>
      </section>

      <section className="section" aria-labelledby="blog-category-posts-heading">
        <div className="container">
          <div className="section-heading blog-hub-section-heading">
            <h2 id="blog-category-posts-heading">Articles in this category</h2>
            <p className="blog-hub-count">{posts.length} articles</p>
          </div>
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

