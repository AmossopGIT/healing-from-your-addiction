"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  caseStudies,
  caseStudyTypeLabels,
  caseStudyTypes,
  type CaseStudyType,
} from "@/content/caseStudies";

type CaseStudyHubFiltersProps = {
  addictionOptions: string[];
};

export function CaseStudyHubFilters({ addictionOptions }: CaseStudyHubFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") ?? "all";
  const activeAddiction = searchParams.get("addiction") ?? "all";

  const filteredCount = useMemo(() => {
    return caseStudies.filter((study) => {
      if (activeType !== "all" && study.caseStudyType !== activeType) return false;
      if (activeAddiction !== "all" && study.addictionSlug !== activeAddiction) return false;
      return true;
    }).length;
  }, [activeType, activeAddiction]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="case-study-filters">
      <div className="case-study-filter-group" role="group" aria-label="Filter by case study type">
        <span className="case-study-filter-label">Type</span>
        <div className="case-study-filter-pills">
          <button
            type="button"
            className={`case-study-filter-pill${activeType === "all" ? " is-active" : ""}`}
            onClick={() => updateParam("type", "all")}
          >
            All types
          </button>
          {caseStudyTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`case-study-filter-pill${activeType === type ? " is-active" : ""}`}
              onClick={() => updateParam("type", type)}
            >
              {caseStudyTypeLabels[type as CaseStudyType]}
            </button>
          ))}
        </div>
      </div>
      <div className="case-study-filter-group" role="group" aria-label="Filter by addiction topic">
        <span className="case-study-filter-label">Topic</span>
        <div className="case-study-filter-pills">
          <button
            type="button"
            className={`case-study-filter-pill${activeAddiction === "all" ? " is-active" : ""}`}
            onClick={() => updateParam("addiction", "all")}
          >
            All topics
          </button>
          {addictionOptions.map((slug) => (
            <button
              key={slug}
              type="button"
              className={`case-study-filter-pill${activeAddiction === slug ? " is-active" : ""}`}
              onClick={() => updateParam("addiction", slug)}
            >
              {slug.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>
      <p className="case-study-filter-count">
        Showing {filteredCount} of {caseStudies.length} case studies
      </p>
    </div>
  );
}
