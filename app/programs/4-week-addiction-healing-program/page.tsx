import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.fourWeekProgram;

export const metadata = createPageMetadata(page.seo);

export default function FourWeekProgramPage() {
  return (
    <SeoContentPage
      page={page}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Programs", path: "/programs/" },
        { name: "4-Week Addiction Healing Program", path: page.seo.path },
      ]}
    />
  );
}
