import { TestimoniesDisclaimer } from "@/components/TestimoniesDisclaimer";
import { TrustContentPage } from "@/components/TrustContentPage";
import { trustPages } from "@/content/trustPages";
import { createPageMetadata } from "@/lib/seo";

const page = trustPages.testimonies;

export const metadata = createPageMetadata(page.seo);

export default function TestimoniesPage() {
  return (
    <TrustContentPage
      page={page}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Testimonies", path: page.seo.path },
      ]}
      topSlot={<TestimoniesDisclaimer />}
      bottomSlot={<TestimoniesDisclaimer />}
    />
  );
}
