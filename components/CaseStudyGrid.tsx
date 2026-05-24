"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import type { CaseStudy } from "@/content/caseStudies";

type CaseStudyGridProps = {
  studies: CaseStudy[];
};

export function CaseStudyGrid({ studies }: CaseStudyGridProps) {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") ?? "all";
  const activeAddiction = searchParams.get("addiction") ?? "all";

  const filtered = useMemo(() => {
    return studies.filter((study) => {
      if (activeType !== "all" && study.caseStudyType !== activeType) return false;
      if (activeAddiction !== "all" && study.addictionSlug !== activeAddiction) return false;
      return true;
    });
  }, [activeType, activeAddiction, studies]);

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
