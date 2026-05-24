import { TrustContentPage } from "@/components/TrustContentPage";
import { trustPages } from "@/content/trustPages";
import { createPageMetadata } from "@/lib/seo";

const page = trustPages.terms;

export const metadata = createPageMetadata(page.seo);

export default function TermsPage() {
  return (
    <TrustContentPage
      page={page}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Terms and Conditions", path: page.seo.path },
      ]}
    />
  );
}
