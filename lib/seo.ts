import type { Metadata } from "next";
import { keywordsForMetadata, type SeoPageRecord } from "@/content/seo";
import { withBasePath } from "@/lib/basePath";
import { absoluteUrl, siteConfig } from "@/lib/constants";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  noIndex?: boolean;
  keywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
};

export function createMetadata({
  title,
  description,
  path,
  canonicalPath,
  noIndex = false,
  keywords = [],
  ogImage = "/og-default.svg",
  ogImageAlt,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const canonicalUrl = absoluteUrl(canonicalPath ?? path);
  const image = absoluteUrl(ogImage);
  const imageAlt = ogImageAlt ?? `${siteConfig.name} - confidential addiction support`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteConfig.siteUrl),
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.owner }],
    creator: siteConfig.owner,
    publisher: siteConfig.name,
    category: "Addiction support",
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function createPageMetadata(page: SeoPageRecord, overrides: Partial<PageMetadataInput> = {}): Metadata {
  return createMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    canonicalPath: page.canonicalPath,
    noIndex: page.noIndex,
    keywords: keywordsForMetadata(page),
    ogImage: page.ogImage,
    ogImageAlt: page.ogImageAlt,
    ...overrides,
  });
}
