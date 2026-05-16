import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.addictions;

export const metadata = createPageMetadata(page.seo);

export default function AddictionsPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Addictions", path: page.seo.path }]} />;
}
