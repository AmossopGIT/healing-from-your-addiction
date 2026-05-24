import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const archiveDir = path.resolve(__dirname, "../archives/healingfromyouraddiction-co-za/pages");
const outDir = path.resolve(__dirname, "../trust-pages-data");

const trustPages = [
  { key: "testimonies", id: "fd1399a0806efd9c", slug: "testimonies" },
  { key: "books", id: "1ac35afad5986572", slug: "other-books-written-by-gerald-crawford" },
  { key: "terms", id: "5c7974a07354ef95", slug: "terms-and-conditions-of-use" },
];

const sidebarNoise = new Set([
  "Recent Posts",
  "Recent Comments",
  "Categories",
  "VIP",
  "Archives",
  "Subscribe to my posts",
  "Translate this Page",
  "Using Hypnotherapy to Heal Addictions",
  "Most Problematic Addictions",
  "Press Kit",
  "Case Studies",
]);

function cleanTitle(raw) {
  return raw.replace(/\s*[–-]\s*Healing from Your Addiction.*/i, "").trim();
}

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function findContentRoot($) {
  const selectors = [
    ".post-content.entry-content",
    ".post-content",
    ".entry-content",
    "article .content",
    "article",
    ".post",
  ];
  for (const sel of selectors) {
    const node = $(sel).first();
    if (node.length && normalize(node.text()).length > 200) return node;
  }
  return $("body");
}

function extractSections(html) {
  const $ = cheerio.load(html);
  const root = findContentRoot($);
  const sections = [];
  let current = null;
  const introParagraphs = [];
  const testimonies = [];

  root.children().each((_, el) => {
    const tag = (el.tagName || "").toLowerCase();
    const text = normalize($(el).text());
    if (!text || tag === "hr" || tag === "table" || tag === "script" || tag === "style") return;
    if (sidebarNoise.has(text)) return;

    if (tag === "h1") {
      return;
    }
    if (tag === "h2") {
      if (sidebarNoise.has(text)) return;
      if (current) sections.push(current);
      current = { h2: text, paragraphs: [], h3Items: [], bullets: [] };
      return;
    }
    if (tag === "h3") {
      if (sidebarNoise.has(text)) return;
      if (/^\d+\.\s/.test(text) && /Johannesburg|Pretoria|Cape Town|Durban|Male|Female/i.test(text)) {
        testimonies.push({ name: text, quote: "" });
        return;
      }
      if (current) {
        current.h3Items.push({ h3: text, body: "" });
      }
      return;
    }
    if (tag === "p") {
      if (/^\d+\.\s/.test(text) && testimonies.length && !testimonies[testimonies.length - 1].quote) {
        const match = text.match(/^(\d+\.\s[^“"]+)[“"](.+)[”"]\s*$/s);
        if (match) {
          testimonies[testimonies.length - 1] = { name: match[1].trim(), quote: match[2].trim() };
          return;
        }
      }
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
      return;
    }
    if ((tag === "ul" || tag === "ol") && current) {
      $(el)
        .find("> li")
        .each((__, li) => {
          const item = normalize($(li).text());
          if (item) current.bullets.push(item);
        });
    }
  });

  if (current) sections.push(current);

  const books = [];
  if (root.find("li").length) {
    let themeBullets = [];
    let inBookList = false;
    root.children().each((_, el) => {
      const tag = (el.tagName || "").toLowerCase();
      const text = normalize($(el).text());
      if (!text) return;
      if (tag === "p" && text.startsWith("Overall, the books focus on:")) {
        themeBullets = [];
        inBookList = false;
        return;
      }
      if (tag === "li" && !text.includes("– A Book by Gerald Crawford")) {
        themeBullets.push(text);
        return;
      }
      if (tag === "li" && text.includes("– A Book by Gerald Crawford")) {
        inBookList = true;
        const title = text.split("– A Book by Gerald Crawford")[0].trim();
        books.push({ title, description: text });
      }
    });
    if (themeBullets.length && !sections.some((s) => s.h2 === "What these books explore")) {
      sections.unshift({
        h2: "What these books explore",
        paragraphs: ["Overall, the books focus on:"],
        h3Items: [],
        bullets: themeBullets,
      });
    }
    if (books.length) {
      sections.push({
        h2: "Books by Gerald Crawford",
        paragraphs: [],
        h3Items: books.map((b) => ({
          h3: b.title,
          body: b.description.replace(b.title, "").replace(/^–\s*/, "").trim(),
        })),
        bullets: [],
      });
    }
  }

  const termsHeadingMap = {
    INTRODUCTION: "Introduction",
    "USE OF THE WEBSITE": "Use of the website",
    "INTELLECTUAL PROPERTY": "Intellectual property",
    PRIVACY: "Privacy",
    "LINKS TO OTHER WEBSITES": "Links to other websites",
    DISCLAIMER: "Disclaimer",
    "LIMITATION OF LIABILITY": "Limitation of liability",
    "GOVERNING LAW": "Governing law",
    "CHANGES TO THESE TERMS": "Changes to these terms",
    "CONTACT US": "Contact us",
  };

  const termsSections = [];
  if (introParagraphs.length > 5 && sections.length === 0) {
    let termsCurrent = null;
    for (const line of introParagraphs) {
      if (termsHeadingMap[line]) {
        if (termsCurrent) termsSections.push(termsCurrent);
        termsCurrent = { h2: termsHeadingMap[line], paragraphs: [], h3Items: [], bullets: [] };
        continue;
      }
      if (line.startsWith("Effective Date:") || line.startsWith("LAST UPDATED:")) {
        continue;
      }
      if (!termsCurrent) {
        continue;
      }
      if (/^\d+\.\s/.test(line)) {
        termsCurrent.bullets.push(line.replace(/^\d+\.\s*/, ""));
      } else {
        termsCurrent.paragraphs.push(line);
      }
    }
    if (termsCurrent) termsSections.push(termsCurrent);
  }

  return {
    introParagraphs: termsSections.length ? [] : introParagraphs,
    sections: termsSections.length ? termsSections : sections.filter(
      (s) => s.h2 && (s.paragraphs.length || s.h3Items.length || s.bullets.length),
    ),
    testimonies,
    books,
  };
}

function extractTestimoniesFromText(html) {
  const $ = cheerio.load(html);
  const text = normalize(findContentRoot($).text());
  const items = [];
  const re =
    /(\d+\.\s[A-Za-z][^.]*?(?:Male|Female)\s*[–-]\s[^“"]+)[“"]([^”"]+)[”"]/g;
  let m;
  while ((m = re.exec(text))) {
    items.push({ name: m[1].trim(), quote: m[2].trim() });
  }
  return items;
}

fs.mkdirSync(outDir, { recursive: true });

for (const page of trustPages) {
  const htmlPath = path.join(archiveDir, `${page.id}.html`);
  const meta = JSON.parse(fs.readFileSync(path.join(archiveDir, `${page.id}.json`), "utf8"));
  const html = fs.readFileSync(htmlPath, "utf8");
  let { introParagraphs, sections, testimonies, books } = extractSections(html);

  if (page.key === "testimonies") {
    const fromText = extractTestimoniesFromText(html);
    if (fromText.length >= testimonies.length) {
      testimonies = fromText;
    } else {
      const quotes = (sections[0]?.paragraphs ?? []).filter((p) => p.startsWith("\u201c") || p.startsWith('"'));
      testimonies = testimonies.map((item, index) => ({
        ...item,
        quote: quotes[index]?.replace(/^[“"]|[”"]$/g, "") ?? item.quote,
      }));
    }
  }

  const title = cleanTitle(meta.title);
  const payload = {
    key: page.key,
    slug: page.slug,
    title,
    description: meta.metaDescription,
    h1: title,
    introParagraphs,
    sections,
    testimonies: page.key === "testimonies" ? testimonies : undefined,
    books: page.key === "books" ? books : undefined,
    publishedAt: meta.fetchedAt?.slice(0, 10) ?? "2026-05-01",
  };

  fs.writeFileSync(path.join(outDir, `${page.key}.json`), JSON.stringify(payload, null, 2));
  console.log(
    `${page.key}: intro=${introParagraphs.length} sections=${sections.length} testimonies=${testimonies.length}`,
  );
}

console.log(`Wrote JSON to ${outDir}`);
