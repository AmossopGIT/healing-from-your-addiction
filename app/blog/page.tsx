import { SchemaMarkup } from "@/components/SchemaMarkup";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import {
  blogCategories,
  blogCategoryPath,
  blogPath,
  blogPosts,
  blogTagPath,
  blogTags,
} from "@/content/blog";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.blog;

export const metadata = createPageMetadata(pageSeo);

export default function BlogIndexPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog/" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Healing From Your Addiction Blog",
            url: "https://healingfromyouraddiction.co.za/blog/",
            description:
              "Category-based addiction recovery articles with tagged educational content from Healing From Your Addiction.",
          },
        ]}
      />

      <section className="section-band page-hero-flush" aria-labelledby="blog-home-heading">
        <div className="container">
          <p className="eyebrow">Blog hub</p>
          <h1 id="blog-home-heading">Addiction Recovery Blog and Healing Program Articles</h1>
          <p className="section-intro narrow">
            This central blog page links to pillar categories, tag pages, and individual articles so search engines and readers can
            move through the content clearly.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="blog-latest-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Latest posts</p>
            <h2 id="blog-latest-heading">Recent articles</h2>
          </div>
          <div className="blog-grid">
            {blogPosts.map((post) => {
              const art = artGalleryById.get(post.heroArtId);
              const category = blogCategories.find((item) => item.slug === post.categorySlug);
              return (
                <article className="programme-card" key={post.slug}>
                  {art ? <WatercolorArtwork item={art} className="card-artwork" sizes="(min-width: 900px) 28vw, 94vw" /> : null}
                  <p className="status">{category?.title ?? "Category"}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <a className="card-link" href={blogPath(post.slug)}>
                    Read article
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="blog-categories-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Pillar categories</p>
            <h2 id="blog-categories-heading">Browse category pages</h2>
          </div>
          <div className="info-grid">
            {blogCategories.map((category) => {
              const art = artGalleryById.get(category.heroArtId);
              return (
                <article className="info-card" key={category.slug}>
                  {art ? <WatercolorArtwork item={art} className="card-artwork" sizes="(min-width: 900px) 28vw, 94vw" /> : null}
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <a className="card-link" href={blogCategoryPath(category.slug)}>
                    View category
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="blog-tags-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Tagged content</p>
            <h2 id="blog-tags-heading">Browse by tag</h2>
          </div>
          <div className="blog-tag-list">
            {blogTags.map((tag) => (
              <a key={tag.slug} href={blogTagPath(tag.slug)} className="card-link">
                #{tag.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

