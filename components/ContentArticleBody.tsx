import type { BlogSection } from "@/content/blog";
import { BlogLyricVideo } from "@/components/BlogLyricVideo";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { ArticleInlineContent } from "@/lib/cms/inlineMarkdown";

type ContentArticleBodyProps = {
  sections: BlogSection[];
  sourceSlug?: string;
};

export function ContentArticleBody({ sections, sourceSlug }: ContentArticleBodyProps) {
  return (
    <div className="blog-prose">
      {sections.map((section) => {
        const sectionArt = section.artId ? artGalleryById.get(section.artId) : undefined;

        return (
          <section key={section.h2} className="blog-section">
            <h2>{section.h2}</h2>
            {sectionArt ? (
              <WatercolorArtwork item={sectionArt} className="section-artwork blog-section-art" />
            ) : null}
            {section.video ? (
              <BlogLyricVideo
                title={section.video.title}
                description={section.video.description}
                youtubeId={section.video.youtubeId}
                src={section.video.src}
                posterSrc={section.video.posterSrc}
              />
            ) : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>
                <ArticleInlineContent text={paragraph} sourceSlug={sourceSlug} />
              </p>
            ))}
            {section.h3Items?.map((item) => (
              <div key={item.h3}>
                <h3>{item.h3}</h3>
                <p>
                  <ArticleInlineContent text={item.body} sourceSlug={sourceSlug} />
                </p>
              </div>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>
                    <ArticleInlineContent text={bullet} sourceSlug={sourceSlug} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
