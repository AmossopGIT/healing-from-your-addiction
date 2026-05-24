import { CTASection } from "@/components/CTASection";
import { Hero } from "@/components/Hero";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import type { GeraldBook, TrustPage } from "@/content/trustPages";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

type BooksContentPageProps = {
  page: TrustPage;
  books: GeraldBook[];
  breadcrumbs: Array<{ name: string; path: string }>;
};

export function BooksContentPage({ page, books, breadcrumbs }: BooksContentPageProps) {
  const themesArt = artGalleryById.get("about-approach");

  return (
    <>
      <SchemaMarkup data={[webPageSchema(page.seo), breadcrumbSchema(breadcrumbs)]} />
      <Hero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        primaryCta={page.hero.primaryCta}
        primaryHref={page.hero.primaryHref}
        secondaryCta={page.hero.secondaryCta}
        secondaryHref={page.hero.secondaryHref}
        heroArtId={page.heroArtId}
      />

      <section className="section" aria-labelledby="books-themes-heading">
        <div className="container books-intro-grid">
          <RevealDiv>
            <p className="eyebrow">Themes</p>
            <h2 id="books-themes-heading">What these books explore</h2>
            <p>Overall, Gerald Crawford&apos;s published work focuses on:</p>
            <ul className="books-theme-list">
              <li>Understanding human behaviour and emotions</li>
              <li>Improving relationships through communication, respect, and emotional support</li>
              <li>Self-awareness and personal growth</li>
              <li>Emotional healing and life purpose</li>
            </ul>
            <p className="books-featured-lead">
              A key example is <strong>What Men Need: Understanding and Nurturing the Modern Male</strong> (2021), which
              helps readers understand men and build healthier relationships through insight, empathy, and communication.
            </p>
            <p>
              Across the catalogue, the broader theme is helping people develop clarity, wisdom, emotional balance, and
              meaningful lives through self-reflection and practical guidance.
            </p>
          </RevealDiv>
          {themesArt ? (
            <WatercolorArtwork
              item={themesArt}
              className="books-intro-art"
              sizes="(min-width: 900px) 34vw, 92vw"
            />
          ) : null}
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="books-catalogue-heading">
        <div className="container">
          <RevealDiv className="section-heading">
            <p className="eyebrow">Published works</p>
            <h2 id="books-catalogue-heading">Books by Gerald Crawford</h2>
            <p className="section-lead">
              Select a title to open its dedicated book site in a new tab. For addiction pattern support with Gerald,
              use the <SiteLink href="/contact/">contact page</SiteLink>.
            </p>
          </RevealDiv>
          <ol className="book-catalogue">
            {books.map((book, index) => (
              <li key={book.title}>
                <RevealArticle delay={index * 0.03}>
                  <TrackedLink
                    href={book.href}
                    className="book-card book-card-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    tracking={{
                      ctaName: book.title,
                      payload: { link_location: "books_catalogue", book_year: book.year, book_url: book.href },
                    }}
                  >
                    <p className="book-card-year">{book.year}</p>
                    <h3 className="book-card-title">{book.title}</h3>
                    <p className="book-card-description">{book.description}</p>
                    <span className="book-card-action">Visit book site</span>
                  </TrackedLink>
                </RevealArticle>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {page.links.length > 0 ? (
        <section className="section" aria-labelledby="books-links-heading">
          <div className="container">
            <RevealDiv className="section-heading">
              <p className="eyebrow">Related pages</p>
              <h2 id="books-links-heading">Continue exploring</h2>
            </RevealDiv>
            <ul className="trust-link-list">
              {page.links.map((link) => (
                <li key={link.href}>
                  <SiteLink href={link.href}>{link.label}</SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.finalCta ? (
        <CTASection
          title={page.finalCta.title}
          body={page.finalCta.body}
          button={page.finalCta.button}
          href={page.finalCta.href ?? "/contact/#enquiry"}
        />
      ) : null}
    </>
  );
}
