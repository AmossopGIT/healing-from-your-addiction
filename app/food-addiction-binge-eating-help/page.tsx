import { ProgrammeLandingPage } from "@/components/ProgrammeLandingPage";
import { foodContent } from "@/content/food";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(seoPages.food);

export default function FoodAddictionHelpPage() {
  return <ProgrammeLandingPage content={foodContent} />;
}
