import type { BlogSection } from "@/content/blog";
import { BlogLyricVideo } from "@/components/BlogLyricVideo";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";

type ContentArticleBodyProps = {
  sections: BlogSection[];
};

export function ContentArticleBody({ sections }: ContentArticleBodyProps) {
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
        );
      })}
    </div>
  );
}
