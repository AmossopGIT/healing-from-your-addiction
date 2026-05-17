import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.medicalDisclaimer;

export const metadata = createPageMetadata(page.seo);

export default function MedicalDisclaimerPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Medical Disclaimer", path: page.seo.path }]} />;
}
