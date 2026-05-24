import type { BlogSection } from "@/content/blog";

type ContentArticleBodyProps = {
  sections: BlogSection[];
};

export function ContentArticleBody({ sections }: ContentArticleBodyProps) {
  return (
    <div className="blog-prose">
      {sections.map((section) => (
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
  );
}
