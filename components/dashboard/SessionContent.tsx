import { caseStudies } from "@/content/caseStudies";
import type { ProgrammeContentType } from "@/types/database";
import Link from "next/link";

type SessionContentProps = {
  contentRef: string;
  contentType: ProgrammeContentType;
};

export function SessionContent({ contentRef, contentType }: SessionContentProps) {
  if (contentRef.startsWith("placeholder-")) {
    return (
      <p className="dashboard-empty">
        This session will be shared after your live session with Gerald. Your therapist will unlock it in your portal.
      </p>
    );
  }

  const study = caseStudies.find((item) => item.slug === contentRef);
  if (!study) {
    return <p className="dashboard-empty">Content is being prepared for this session.</p>;
  }

  return (
    <article className="session-content prose">
      <p className="eyebrow">{contentType}</p>
      <h2>{study.h1}</h2>
      {study.sections.map((section) => (
        <section key={section.h2}>
          <h3>{section.h2}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {section.bullets?.length ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.h3Items?.map((item) => (
            <div key={item.h3}>
              <h4>{item.h3}</h4>
              <p>{item.body}</p>
            </div>
          ))}
        </section>
      ))}
      <p>
        <Link href={`/case-studies/${study.slug}/`} className="text-link">
          View on public site
        </Link>
      </p>
    </article>
  );
}
