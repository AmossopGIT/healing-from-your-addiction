import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(
  path.join(__dirname, "../archives/healingfromyouraddiction-co-za/pages/1ac35afad5986572.html"),
  "utf8",
);
const $ = cheerio.load(html);
const root = $(".post-content, .entry-content").first();
const links = [];
root.find("a[href]").each((_, el) => {
  const href = $(el).attr("href");
  const text = $(el).text().replace(/\s+/g, " ").trim();
  if (!href || !text) return;
  if (text.includes("Book by Gerald Crawford") || text.length > 30) {
    links.push({ text, href });
  }
});
console.log(JSON.stringify(links, null, 2));
