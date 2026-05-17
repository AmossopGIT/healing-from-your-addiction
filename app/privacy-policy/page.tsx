import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.privacyPolicy;

export const metadata = createPageMetadata(page.seo);

export default function PrivacyPolicyPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: page.seo.path }]} />;
}
