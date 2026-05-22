import { BlogCategoryCard } from "@/components/BlogCategoryCard";
import { BlogPostCard } from "@/components/BlogPostCard";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import {
  blogCategories,
  blogCategoryPath,
  blogPosts,
  blogTagPath,
  blogTags,
  getPostsByCategory,
} from "@/content/blog";
import { caseStudies, getFeaturedCaseStudies } from "@/content/caseStudies";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.blog;
const featuredCaseStudies = getFeaturedCaseStudies(3);

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

      <section className="section-band page-hero-flush blog-hub-hero" aria-labelledby="blog-home-heading">
        <div className="container">
          <p className="eyebrow">Resources</p>
          <h1 id="blog-home-heading">Addiction recovery articles, guides, and case studies</h1>
          <p className="section-intro narrow">
            Pattern-focused articles on hypnotherapy, healing programmes, and recovery — plus case studies, scripts, and
            programme resources organised by topic.
          </p>
          <nav className="blog-category-nav" aria-label="Jump to resource topics">
            {blogCategories.map((category) => (
              <SiteLink key={category.slug} href={`#topic-${category.slug}`} className="blog-category-pill">
                {category.title}
              </SiteLink>
            ))}
            <SiteLink href="#case-studies" className="blog-category-pill">
              Case studies
            </SiteLink>
          </nav>
          <p className="blog-hub-count blog-hub-hero-count">
            {blogPosts.length} articles · {caseStudies.length} case studies · {blogCategories.length} topics
          </p>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="blog-categories-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Topics</p>
            <h2 id="blog-categories-heading">Browse by category</h2>
            <p className="section-intro narrow">
              Three pillar topics group the library: programme structure, hypnotherapy methods, and recovery foundations.
            </p>
          </div>
          <div className="blog-category-grid">
            {blogCategories.map((category) => (
              <BlogCategoryCard
                key={category.slug}
                category={category}
                postCount={getPostsByCategory(category.slug).length}
              />
            ))}
          </div>
        </div>
      </section>

      {blogCategories.map((category, index) => {
        const posts = getPostsByCategory(category.slug);
        if (posts.length === 0) return null;

        return (
          <section
            key={category.slug}
            id={`topic-${category.slug}`}
            className={index % 2 === 0 ? "section" : "section section-muted"}
            aria-labelledby={`blog-topic-${category.slug}-heading`}
          >
            <div className="container">
              <div className="section-heading blog-hub-section-heading">
                <div>
                  <p className="eyebrow">{category.title}</p>
                  <h2 id={`blog-topic-${category.slug}-heading`}>{category.title} articles</h2>
                  <p className="section-intro narrow blog-topic-intro">{category.description}</p>
                </div>
                <SiteLink className="card-link blog-hub-view-all" href={blogCategoryPath(category.slug)}>
                  View all in category
                </SiteLink>
              </div>
              <div className="blog-grid">
                {posts.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section id="case-studies" className="section" aria-labelledby="blog-case-studies-heading">
        <div className="container">
          <div className="section-heading blog-hub-section-heading">
            <div>
              <p className="eyebrow">Case studies</p>
              <h2 id="blog-case-studies-heading">Outcome stories and programme resources</h2>
              <p className="section-intro narrow blog-topic-intro">
                Explore anonymized outcome examples, EFT scripts, affirmations, intake questions, and programme outlines
                by addiction topic.
              </p>
            </div>
            <SiteLink className="card-link blog-hub-view-all" href="/case-studies/">
              View all case studies
            </SiteLink>
          </div>
          <div className="blog-grid">
            {featuredCaseStudies.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted blog-hub-tags" aria-labelledby="blog-tags-heading">
        <div className="container blog-hub-tags-inner">
          <div className="blog-hub-tags-copy">
            <p className="eyebrow">Tags</p>
            <h2 id="blog-tags-heading">Find articles by theme</h2>
            <p className="section-intro narrow">
              Tags connect related ideas across categories — dependence types, models, programmes, and South African
              context.
            </p>
          </div>
          <div className="blog-tag-cloud" role="list">
            {blogTags.map((tag) => (
              <SiteLink key={tag.slug} href={blogTagPath(tag.slug)} className="blog-tag-chip" role="listitem">
                {tag.label}
              </SiteLink>
            ))}
          </div>
        </div>
      </section>

      <section className="section blog-hub-cta" aria-labelledby="blog-cta-heading">
        <div className="container">
          <div className="blog-hub-cta-card">
            <h2 id="blog-cta-heading">Ready for structured support?</h2>
            <p>
              Articles explain the pattern-focused approach. When you want personalised help, explore the healing
              programmes or send a confidential enquiry.
            </p>
            <div className="button-row">
              <SiteLink className="button button-primary" href="/programs/">
                View programmes
              </SiteLink>
              <SiteLink className="button button-secondary" href="/contact/">
                Confidential enquiry
              </SiteLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
