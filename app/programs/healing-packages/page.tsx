import { HealingPackagesPage } from "@/components/HealingPackagesPage";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(seoPages.healingPackages);

export default function HealingPackagesRoute() {
  return <HealingPackagesPage />;
}
