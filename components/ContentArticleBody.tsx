import type { BlogSection } from "@/content/blog";
import { BlogLyricVideo } from "@/components/BlogLyricVideo";
import { BlogAudioPlayer } from "@/components/BlogAudioPlayer";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { ArticleInlineContent } from "@/lib/cms/inlineMarkdown";

type ContentArticleBodyProps = {
  sections: BlogSection[];
  sourceSlug?: string;
  showAudio?: boolean;
};

export function ContentArticleBody({ sections, sourceSlug, showAudio = true }: ContentArticleBodyProps) {
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
            {section.image ? (
              <figure className="blog-inline-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={section.image.src} alt={section.image.alt} />
                {section.image.caption ? <figcaption>{section.image.caption}</figcaption> : null}
              </figure>
            ) : null}
            {showAudio && section.audio ? (
              <BlogAudioPlayer
                title={section.audio.title}
                src={section.audio.src}
                description={section.audio.description}
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
