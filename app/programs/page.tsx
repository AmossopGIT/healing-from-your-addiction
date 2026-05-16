import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createPageMetadata } from "@/lib/seo";

const page = phase1Pages.fourWeekProgram;

export const metadata = createPageMetadata(page.seo, {
  path: "/programs/",
  title: "Addiction Healing Programs South Africa | Healing From Your Addiction",
});

export default function ProgramsPage() {
  return <SeoContentPage page={{ ...page, seo: { ...page.seo, path: "/programs/" } }} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Programs", path: "/programs/" }]} />;
}
