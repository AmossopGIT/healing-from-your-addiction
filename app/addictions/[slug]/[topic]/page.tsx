import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoContentPage } from "@/components/SeoContentPage";
import { phase1Pages } from "@/content/phase1Pages";
import { createMetadata, createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string; topic: string }>;
};

const supportPages = Object.values(phase1Pages).filter((page) => page.seo.path.startsWith("/addictions/") && page.seo.pageType === "support");

export function generateStaticParams() {
  return supportPages.map((page) => {
    const [, , slug, topic] = page.seo.path.split("/");
    return { slug, topic };
  });
}

function getSupportPage(slug: string, topic: string) {
  const path = `/addictions/${slug}/${topic}/`;
  return supportPages.find((page) => page.seo.path === path);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, topic } = await params;
  const page = getSupportPage(slug, topic);
  if (!page) {
    return createMetadata({
      title: "Support Page Not Found | Healing From Your Addiction",
      description: "The requested support page could not be found.",
      path: "/addictions/",
      noIndex: true,
    });
  }

  return createPageMetadata(page.seo);
}

export default async function AddictionSupportPage({ params }: PageProps) {
  const { slug, topic } = await params;
  const page = getSupportPage(slug, topic);
  if (!page) notFound();

  const parentLabel = slug.includes("food") ? "Food Addiction / Binge Eating" : "Gambling Addiction";
  const parentPath = `/addictions/${slug}/`;

  return (
    <SeoContentPage
      page={page}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Addictions", path: "/addictions/" },
        { name: parentLabel, path: parentPath },
        { name: page.hero.title, path: page.seo.path },
      ]}
    />
  );
}
