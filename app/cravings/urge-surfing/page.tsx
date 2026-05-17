import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.urgeSurfing;

export const metadata = createPageMetadata(page.seo);

export default function UrgeSurfingPage() {
  return (
    <SeoContentPage
      page={page}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Cravings", path: "/cravings/urge-surfing/" },
        { name: "Urge Surfing", path: page.seo.path },
      ]}
    />
  );
}
