import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgrammeLandingPage } from "@/components/ProgrammeLandingPage";
import { getPillarLandingContent } from "@/content/pillarPages";
import { programmes } from "@/content/programmes";
import { getSeoByPath } from "@/content/seo";
import { createMetadata, createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return programmes.map((programme) => ({ slug: programme.pillarHref.split("/").filter(Boolean).at(-1) ?? programme.slug }));
}

function programmeFromRouteSlug(routeSlug: string) {
  return programmes.find((programme) => programme.pillarHref === `/addictions/${routeSlug}/`);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const programme = programmeFromRouteSlug(slug);
  if (!programme) {
    return createMetadata({
      title: "Addiction Page Not Found | Healing From Your Addiction",
      description: "The requested addiction support page could not be found.",
      path: "/addictions/",
      noIndex: true,
    });
  }

  const pageSeo = getSeoByPath(programme.pillarHref);
  return pageSeo
    ? createPageMetadata(pageSeo, { noIndex: programme.status === "coming-soon" || pageSeo.noIndex })
    : createMetadata({
        title: `${programme.title} Support South Africa | Healing From Your Addiction`,
        description: programme.description,
        path: programme.pillarHref,
        noIndex: programme.status === "coming-soon",
      });
}

export default async function AddictionPage({ params }: PageProps) {
  const { slug } = await params;
  const programme = programmeFromRouteSlug(slug);
  if (!programme) notFound();

  const content = getPillarLandingContent(programme.slug);
  if (!content) notFound();

  return <ProgrammeLandingPage content={content} />;
}
