import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

export type PageContext = {
  title: string;
  metaDescription: string;
  canonical: string | null;
  lang: string | null;
  headings: { level: number; text: string }[];
  excerpt: string;
  wordCount: number;
};

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function textFromCheerio($: CheerioAPI, selector: string): string {
  return collapseWhitespace($(selector).first().text() || "");
}

export function extractContext(html: string, pageUrl: URL): PageContext {
  const $ = cheerio.load(html);

  const title = collapseWhitespace($("title").first().text() || "");
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  const canonicalHref = $('link[rel="canonical"]').attr("href");
  let canonical: string | null = null;
  if (canonicalHref) {
    try {
      canonical = new URL(canonicalHref, pageUrl).href;
    } catch {
      canonical = null;
    }
  }
  const lang = $("html").attr("lang")?.trim() || null;

  const headings: { level: number; text: string }[] = [];
  for (let h = 1; h <= 3; h++) {
    $(`h${h}`).each((_, el) => {
      const t = collapseWhitespace($(el).text());
      if (t) headings.push({ level: h, text: t });
    });
  }

  $("script, style, noscript, svg").remove();
  const blocks: string[] = [];
  $("h1,h2,h3,h4,p,li").each((_, el) => {
    const t = collapseWhitespace($(el).text());
    if (t) blocks.push(t);
  });
  const bodyText =
    blocks.length > 0 ? blocks.join(" ") : collapseWhitespace($("body").text() || $.root().text());
  const words = bodyText.split(/\s+/).filter(Boolean);
  const excerpt = bodyText.slice(0, 1200);

  return {
    title,
    metaDescription,
    canonical,
    lang,
    headings: headings.slice(0, 40),
    excerpt,
    wordCount: words.length,
  };
}

export function extractLinks(html: string, pageUrl: URL): string[] {
  const $ = cheerio.load(html);
  const out: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      return;
    }
    try {
      const u = new URL(href, pageUrl);
      if (u.protocol === "http:" || u.protocol === "https:") {
        out.push(u.href);
      }
    } catch {
      /* skip */
    }
  });
  return out;
}
