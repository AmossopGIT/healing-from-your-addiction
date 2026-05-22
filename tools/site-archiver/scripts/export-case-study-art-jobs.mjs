import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");

// Parse case study chunks for heroArtId + type + addiction
const jobs = [];
for (const n of [1, 2, 3]) {
  const text = fs.readFileSync(path.join(ROOT, `content/caseStudyArchiveChunk${n}.ts`), "utf8");
  const blocks = text.split(/\n  \},\n/);
  for (const block of blocks) {
    const slug = block.match(/"slug": "(cs-[^"]+)"/)?.[1];
    const heroArtId = block.match(/"heroArtId": "(case-study-[^"]+)"/)?.[1];
    const caseStudyType = block.match(/"caseStudyType": "([^"]+)"/)?.[1];
    const addictionSlug = block.match(/"addictionSlug": "([^"]+)"/)?.[1];
    const title = block.match(/"title": "([^"]+)"/)?.[1];
    if (!slug || !heroArtId) continue;
    jobs.push({ slug, heroArtId, caseStudyType, addictionSlug, title });
  }
}

const basePrompt =
  "Minimal watercolor illustration for Healing From Your Addiction, warm cream paper background #f7f3ea, anonymous black ink main subject, soft teal watercolor wash #e2eeea, tiny muted gold pause point #a87727, rounded organic shapes, lots of negative space, calm confidential mood, hand-painted texture, no text, no logos, no realistic faces, no dramatic scene, no medical imagery, no stigma, flat composition, clean website artwork.";

const typeSymbol = {
  outcome: "stepping stones on a path with a calm pause point",
  script: "two calm hands near a gentle loop suggesting EFT or script work",
  questions: "a small stack of cards or list shapes suggesting intake questions",
  affirmations: "a single anonymous figure beside a soft upward path and pause marker",
  programme: "a folder-like shape with stepping stones suggesting a structured programme",
};

const addictionSymbol = {
  gambling: "a subtle card or chip shape without logos",
  "food-binge-eating": "a bowl and glass outline",
  alcohol: "a glass outline with a pause loop",
  cannabis: "a simple leaf silhouette with a loop",
  pornography: "a privacy screen shape with a loop",
  sex: "two abstract figures with space between them",
  shopping: "a small bag shape with a loop",
  gaming: "a simple controller outline",
  nicotine: "a small cigarette-shaped line with loop",
  "social-media": "a phone rectangle with looping dots",
  internet: "a browser window shape with a loop",
};

for (const job of jobs) {
  const ts = typeSymbol[job.caseStudyType] ?? typeSymbol.outcome;
  const as = addictionSymbol[job.addictionSlug] ?? "a calm loop and pathway";
  job.filename = `art-watercolor-${job.heroArtId}.png`;
  job.prompt = `${basePrompt} Show ${ts} and ${as}. Theme: ${job.title}. Keep symbolic, calm, non-stigmatizing.`;
}

fs.writeFileSync(path.join(__dirname, "../case-study-art-jobs.json"), JSON.stringify(jobs, null, 2));
console.log(`Exported ${jobs.length} art jobs`);
