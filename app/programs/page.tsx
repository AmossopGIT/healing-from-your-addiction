import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";

const page = {
  ...phase1Pages.fourWeekProgram,
  seo: seoPages.programmes,
  hero: {
    ...phase1Pages.fourWeekProgram.hero,
    eyebrow: "Addiction healing programs",
    title: "4-week custom healing programs for addiction patterns",
    description:
      "Explore the structured 8-session programme model and choose the addiction support page that matches the pattern you want help with.",
  },
};

export const metadata = createPageMetadata(page.seo);

export default function ProgramsPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Programs", path: "/programs/" }]} />;
}
