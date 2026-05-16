import { absoluteUrl, siteConfig } from "@/lib/constants";
import type { SeoPageRecord } from "@/content/seo";
import type { FAQ } from "@/content/types";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    email: siteConfig.email,
    founder: {
      "@type": "Person",
      name: siteConfig.owner,
    },
  };
}

export function professionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    founder: {
      "@type": "Person",
      name: siteConfig.owner,
    },
    email: siteConfig.email,
    description: siteConfig.description,
    serviceType: [
      "Hypnotherapy support",
      "EFT support",
      "Addiction pattern support",
      "Craving and trigger support",
    ],
  };
}

export function webPageSchema(page: SeoPageRecord): Record<string, unknown>;
export function webPageSchema(name: string, description: string, path: string): Record<string, unknown>;
export function webPageSchema(pageOrName: SeoPageRecord | string, description?: string, path?: string) {
  const page =
    typeof pageOrName === "string"
      ? {
          title: pageOrName,
          description: description ?? siteConfig.description,
          path: path ?? "/",
          primaryKeyword: "",
          secondaryKeywords: [],
          pageType: "home",
        }
      : pageOrName;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(page.path),
    inLanguage: "en-ZA",
    keywords: [page.primaryKeyword, ...page.secondaryKeywords].filter(Boolean).join(", "),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };
}

export function serviceSchema(page: SeoPageRecord) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title.replace(` | ${siteConfig.name}`, ""),
    description: page.description,
    url: absoluteUrl(page.path),
    serviceType: page.primaryKeyword,
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    provider: {
      "@type": "ProfessionalService",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      founder: {
        "@type": "Person",
        name: siteConfig.owner,
      },
    },
    audience: {
      "@type": "Audience",
      audienceType: "Adults seeking confidential addiction pattern support",
    },
  };
}

export function faqSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
