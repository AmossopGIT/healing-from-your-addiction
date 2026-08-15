import fs from "node:fs";
import path from "node:path";
import { getAdminDocBySlug } from "@/lib/adminDocs/catalog";
import { splitFrontmatter } from "@/lib/adminDocs/parseFrontmatter";

export type AdminDocContent = {
  slug: string;
  title: string;
  description: string;
  category: string;
  sourcePath: string;
  body: string;
};

function resolveProjectPath(...segments: string[]) {
  // Keep NFT/Turbopack from treating process.cwd() as a full-project include.
  return path.join(/* turbopackIgnore: true */ process.cwd(), ...segments);
}

export function loadAdminDocContent(slug: string): AdminDocContent | null {
  const meta = getAdminDocBySlug(slug);
  if (!meta?.sourcePath) return null;

  const absolutePath = resolveProjectPath(meta.sourcePath);
  if (!fs.existsSync(absolutePath)) return null;

  const raw = fs.readFileSync(absolutePath, "utf8");
  const { body } = splitFrontmatter(raw);

  return {
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    category: meta.category,
    sourcePath: meta.sourcePath,
    body,
  };
}
