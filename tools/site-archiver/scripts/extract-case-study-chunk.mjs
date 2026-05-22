import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { caseStudyPages } from "./case-study-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const archiveDir = path.resolve(__dirname, "../archives/healingfromyouraddiction-co-za/pages");
const chunk = process.env.CASE_STUDY_CHUNK || "a";
const pages = caseStudyPages[chunk];

if (!pages?.length) {
  throw new Error(`Unknown CASE_STUDY_CHUNK "${chunk}". Use a, b, or c.`);
}

function cleanTitle(raw) {
  return raw.replace(/\s*–\s*Healing from Your Addiction.*/i, "").trim();
}

function isBoldHeading($, el) {
  const children = $(el).children();
  if (children.length !== 1) return null;
  const child = children.first();
  const tag = (child.get(0)?.tagName || "").toLowerCase();
  if (tag !== "strong" && tag !== "b") return null;
  const text = child.text().replace(/\s+/g, " ").trim();
  return text.length > 0 && text.length < 120 ? text : null;
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

    const boldHeading = tag === "p" ? isBoldHeading($, el) : null;

    if (tag === "h1" || tag === "h2" || boldHeading) {
      if (current) sections.push(current);
      current = { h2: boldHeading || text, paragraphs: [], h3Items: [], bullets: [] };
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
  const title = cleanTitle(page.title || meta.title);

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
    registry: page,
    title,
    description: meta.metaDescription || title,
    h1: title,
    sections: allSections,
    publishedAt: meta.fetchedAt?.slice(0, 10) ?? "2026-04-01",
  });
}

const outPath = path.resolve(__dirname, `../chunk-${chunk}-case-study-data.json`);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Wrote ${outPath} (${output.length} case studies)`);
