import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { blogChunkPages } from "./blog-chunk-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const archiveDir = path.resolve(__dirname, "../archives/healingfromyouraddiction-co-za/pages");
const chunk = process.env.BLOG_CHUNK || "3";
const pages = blogChunkPages[chunk];

if (!pages?.length) {
  throw new Error(`Unknown BLOG_CHUNK "${chunk}". Add pages to blog-chunk-pages.mjs.`);
}

function cleanTitle(raw) {
  return raw.replace(/\s*–\s*Healing from Your Addiction.*/i, "").trim();
}

function extractSections(html) {
  const $ = cheerio.load(html);
  const root = $(".post-content.entry-content").first();
  const sections = [];
  let current = null;
  const introParagraphs = [];

  root.children().each((_, el) => {
    const tag = (el.tagName || "").toLowerCase();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || tag === "hr" || tag === "table") return;

    if (tag === "h1" || tag === "h2") {
      if (current) sections.push(current);
      current = { h2: text, paragraphs: [], h3Items: [], bullets: [] };
    } else if (tag === "h3" && current) {
      current.h3Items.push({ h3: text, body: "" });
    } else if (tag === "p") {
      if (!current) {
        introParagraphs.push(text);
        return;
      }
      const lastH3 = current.h3Items[current.h3Items.length - 1];
      if (lastH3 && !lastH3.body) {
        lastH3.body = text;
      } else {
        current.paragraphs.push(text);
      }
    } else if ((tag === "ul" || tag === "ol") && current) {
      $(el)
        .find("> li")
        .each((__, li) => {
          const item = $(li).text().replace(/\s+/g, " ").trim();
          if (item) current.bullets.push(item);
        });
    }
  });

  if (current) sections.push(current);

  return {
    introParagraphs,
    sections: sections
      .map((section) => ({
        ...section,
        h3Items: section.h3Items.filter((item) => item.h3),
      }))
      .filter((section) => section.h2 && (section.paragraphs.length || section.h3Items.length || section.bullets.length)),
  };
}

const output = [];

for (const page of pages) {
  const html = fs.readFileSync(path.join(archiveDir, `${page.id}.html`), "utf8");
  const meta = JSON.parse(fs.readFileSync(path.join(archiveDir, `${page.id}.json`), "utf8"));
  const { introParagraphs, sections } = extractSections(html);
  const title = cleanTitle(meta.title);

  const allSections = [];
  if (introParagraphs.length) {
    allSections.push({
      h2: "Overview",
      paragraphs: introParagraphs,
      h3Items: [],
      bullets: [],
    });
  }
  allSections.push(...sections);

  output.push({
    slug: page.slug,
    title,
    description: meta.metaDescription,
    h1: title,
    sections: allSections,
    publishedAt: meta.fetchedAt?.slice(0, 10) ?? "2026-04-01",
  });
}

const outPath = path.resolve(__dirname, `../chunk${chunk}-blog-data.json`);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Wrote ${outPath} (${output.length} posts)`);
