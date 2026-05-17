import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.eftTappingForCravings;

export const metadata = createPageMetadata(page.seo);

export default function EftTappingForCravingsPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "EFT Tapping for Cravings", path: page.seo.path }]} />;
}
