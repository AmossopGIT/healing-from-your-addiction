import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgrammeLandingPage } from "@/components/ProgrammeLandingPage";
import { getPillarLandingContent } from "@/content/pillarPages";
import { programmes, programmeBySlug } from "@/content/programmes";
import { getSeoByPath } from "@/content/seo";
import { createMetadata, createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return programmes.map((programme) => ({ slug: programme.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const programme = programmeBySlug.get(slug);
  const content = getPillarLandingContent(slug);
  if (!programme || !content) {
    return createMetadata({
      title: "Programme Not Found | Healing From Your Addiction",
      description: "The requested programme page could not be found.",
      path: "/addiction-healing-programmes/",
      noIndex: true,
    });
  }

  const noIndex = programme.status === "coming-soon" || programme.canonicalHref !== programme.pillarHref;
  const pageSeo = getSeoByPath(programme.primaryHref) ?? getSeoByPath(programme.pillarHref);

  if (pageSeo) {
    return createPageMetadata(pageSeo, {
      path: programme.pillarHref,
      canonicalPath: programme.canonicalHref,
      noIndex: noIndex || pageSeo.noIndex,
    });
  }

  return createMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: programme.pillarHref,
    canonicalPath: programme.canonicalHref,
    noIndex,
  });
}

export default async function PillarProgrammePage({ params }: PageProps) {
  const { slug } = await params;
  const content = getPillarLandingContent(slug);
  if (!content) notFound();

  return <ProgrammeLandingPage content={content} />;
}
