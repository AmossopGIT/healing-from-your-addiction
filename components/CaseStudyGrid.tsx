"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { caseStudies } from "@/content/caseStudies";

export function CaseStudyGrid() {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") ?? "all";
  const activeAddiction = searchParams.get("addiction") ?? "all";

  const filtered = useMemo(() => {
    return caseStudies.filter((study) => {
      if (activeType !== "all" && study.caseStudyType !== activeType) return false;
      if (activeAddiction !== "all" && study.addictionSlug !== activeAddiction) return false;
      return true;
    });
  }, [activeType, activeAddiction]);

  if (!filtered.length) {
    return <p className="section-intro">No case studies match these filters. Try another type or topic.</p>;
  }

  return (
    <div className="blog-grid">
      {filtered.map((study) => (
        <CaseStudyCard key={study.slug} study={study} />
      ))}
    </div>
  );
}
