import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.hypnotherapyForAddiction;

export const metadata = createPageMetadata(page.seo);

export default function HypnotherapyForAddictionPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Hypnotherapy for Addiction", path: page.seo.path }]} />;
}
