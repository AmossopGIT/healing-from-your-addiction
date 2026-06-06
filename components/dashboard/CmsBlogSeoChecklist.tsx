"use client";

import {
  countSeoChecklistIssues,
  evaluateBlogSeoChecklist,
  getBrandTitleSuffix,
  getFullBlogTitle,
  isSeoChecklistReady,
  type SeoChecklistInput,
} from "@/lib/cms/seoChecklist";

type CmsBlogSeoChecklistProps = SeoChecklistInput;

export function CmsBlogSeoChecklist(props: CmsBlogSeoChecklistProps) {
  const items = evaluateBlogSeoChecklist(props);
  const ready = isSeoChecklistReady(items);
  const { errors, warnings } = countSeoChecklistIssues(items);
  const fullTitle = getFullBlogTitle(props.title);

  return (
    <div className="cms-seo-checklist">
      <div className="cms-seo-checklist-header">
        <p className="cms-seo-checklist-label">SEO checklist</p>
        <span className={ready ? "cms-seo-badge cms-seo-badge-ready" : "cms-seo-badge cms-seo-badge-pending"}>
          {ready ? "Ready to publish" : "Complete before publish"}
        </span>
      </div>

      <ul className="cms-seo-checklist-items">
        {items.map((item) => (
          <li key={item.id} className={`cms-seo-checklist-item cms-seo-checklist-item-${item.severity}`}>
            <span className="cms-seo-checklist-icon" aria-hidden="true">
              {item.ok ? "✓" : item.severity === "error" ? "!" : "•"}
            </span>
            <span>
              <span>{item.label}</span>
              {!item.ok && item.hint ? <span className="cms-seo-checklist-hint">{item.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>

      <div className="cms-seo-checklist-footer">
        <p>
          <strong>Search title:</strong> {fullTitle || `…${getBrandTitleSuffix()}`}
        </p>
        <p>
          {errors > 0 ? `${errors} blocking issue${errors === 1 ? "" : "s"}` : "No blocking issues"}
          {warnings > 0 ? ` · ${warnings} recommendation${warnings === 1 ? "" : "s"}` : ""}
        </p>
        <p>On publish, keywords, robots, publisher, and article meta tags are added automatically.</p>
      </div>
    </div>
  );
}
