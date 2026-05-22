import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const configPath = path.join(ROOT, "next.config.ts");

function snippetToTs(snippet) {
  return snippet
    .trim()
    .split("\n")
    .map((line) => {
      const m = line.trim().match(/\{ source: "([^"]+)", destination: "([^"]+)", permanent: true \},?/);
      if (!m) return null;
      return `      {
        source: "${m[1]}",
        destination: "${m[2]}",
        permanent: true,
      }`;
    })
    .filter(Boolean)
    .join(",\n");
}

const legacy = fs.readFileSync(path.join(__dirname, "../case-study-redirects.snippet.txt"), "utf8");
const cs = fs.readFileSync(path.join(__dirname, "../case-study-cs-redirects.snippet.txt"), "utf8");
const block = `${snippetToTs(legacy)},\n${snippetToTs(cs)}`;

let config = fs.readFileSync(configPath, "utf8");
const marker = 'source: "/case-study-307-profound-changes';
const start = config.lastIndexOf("{", config.indexOf(marker));
const end = config.indexOf("    ];", start);
if (start < 0 || end < 0) throw new Error("Could not locate case study redirect block in next.config.ts");

config = `${config.slice(0, start)}${block},\n${config.slice(end)}`;
fs.writeFileSync(configPath, config);
console.log("Updated next.config.ts case study redirects");
