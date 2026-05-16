import { ProgrammeLandingPage } from "@/components/ProgrammeLandingPage";
import { gamblingContent } from "@/content/gambling";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(seoPages.gambling);

export default function GamblingAddictionHelpPage() {
  return <ProgrammeLandingPage content={gamblingContent} />;
}
