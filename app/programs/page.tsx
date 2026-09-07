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
    title: "Healing programmes and progressive support packages",
    description:
      "Explore addiction-specific programmes and compare Free Start tools, monthly hypnotherapy plans, comprehensive four-month healing, and the 30-day Master Plan fast-track.",
    secondaryCta: "Compare healing packages",
    secondaryHref: seoPages.healingPackages.path,
  },
  links: [
    { label: "Addiction Healing Packages", href: seoPages.healingPackages.path, linkArtId: "programme-overview" },
    ...phase1Pages.fourWeekProgram.links.filter((link) => link.href !== seoPages.healingPackages.path),
  ],
};

export const metadata = createPageMetadata(page.seo);

export default function ProgramsPage() {
  return <SeoContentPage page={page} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Programs", path: "/programs/" }]} />;
}
