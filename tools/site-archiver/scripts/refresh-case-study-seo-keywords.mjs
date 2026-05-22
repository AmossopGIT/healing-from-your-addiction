import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const studies = [];

for (const n of [1, 2, 3]) {
  const text = fs.readFileSync(path.join(ROOT, `content/caseStudyArchiveChunk${n}.ts`), "utf8");
  const re =
    /"slug": "([^"]+)"[\s\S]*?"title": "([^"]+)"[\s\S]*?"description": "([^"]+)"[\s\S]*?"primaryKeyword": "([^"]+)"[\s\S]*?"secondaryKeywords": \[([\s\S]*?)\]/g;
  let m;
  while ((m = re.exec(text))) {
    const secondary = [...m[5].matchAll(/"([^"]+)"/g)].map((x) => x[1]).slice(0, 3);
    studies.push({ slug: m[1], title: m[2], description: m[3], primary: m[4], secondary });
  }
}

const mdPath = path.join(ROOT, "docs/SEO_KEYWORDS.md");
let md = fs.readFileSync(mdPath, "utf8");
md = md.replace(/\n## Case studies[\s\S]*?(?=\n## Notes)/, "\n");

const hubRow = `| Case Studies Hub | \`/case-studies/\` | addiction hypnotherapy case studies South Africa | addiction recovery case studies; EFT tapping scripts addiction; hypnotherapy programme examples; addiction support resources | Explore case studies and programme resources by addiction topic. | Move readers into a relevant case study or programme enquiry. |`;

const studyRows = studies
  .map((s) => {
    const sec = s.secondary.join("; ");
    return `| ${s.title.replace(/\|/g, "/")} | \`/case-studies/${s.slug}/\` | ${s.primary} | ${sec} | Read an educational addiction case study or programme resource. | Move readers toward programme support or enquiry. |`;
  })
  .join("\n");

md = md.replace("## Notes", `## Case studies\n\n${hubRow}\n${studyRows}\n\n## Notes`);
fs.writeFileSync(mdPath, md);
console.log(`Refreshed SEO_KEYWORDS with ${studies.length} case studies`);
