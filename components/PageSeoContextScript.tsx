import type { SeoPageRecord } from "@/content/seo";

type PageSeoContextScriptProps = {
  pageSeo: SeoPageRecord;
};

export function PageSeoContextScript({ pageSeo }: PageSeoContextScriptProps) {
  return (
    <script
      id="page-seo-context"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          path: pageSeo.path,
          pageType: pageSeo.pageType,
          primaryKeyword: pageSeo.primaryKeyword,
          conversionGoal: pageSeo.conversionGoal,
        }),
      }}
    />
  );
}
