import fs from "node:fs";
import path from "node:path";
import {
  adminDocRegistry,
  type AdminDocCategory,
  type AdminDocCustomPage,
  type AdminDocRegistryEntry,
} from "@/content/adminDocs";
import { splitFrontmatter, titleFromMarkdownBody } from "@/lib/adminDocs/parseFrontmatter";

export type AdminDocMeta = {
  slug: string;
  title: string;
  description: string;
  category: AdminDocCategory;
  order: number;
  sourcePath?: string;
  customPage?: AdminDocCustomPage;
};

function resolveProjectPath(...segments: string[]) {
  // Keep NFT/Turbopack from treating process.cwd() as a full-project include.
  return path.join(/* turbopackIgnore: true */ process.cwd(), ...segments);
}

const ADMIN_DOCS_DIR = resolveProjectPath("content", "admin-docs");
const VALID_CATEGORIES = new Set<AdminDocCategory>(["Operations", "Content", "Technical", "Marketing", "Planning records"]);

function normalizeCategory(value: string | undefined, fallback: AdminDocCategory): AdminDocCategory {
  if (value && VALID_CATEGORIES.has(value as AdminDocCategory)) {
    return value as AdminDocCategory;
  }
  return fallback;
}

function slugFromFilename(filename: string) {
  return filename.replace(/\.md$/i, "");
}

function discoverLocalDocs(): AdminDocMeta[] {
  if (!fs.existsSync(ADMIN_DOCS_DIR)) return [];

  return fs
    .readdirSync(ADMIN_DOCS_DIR)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const sourcePath = path.join("content/admin-docs", filename).replace(/\\/g, "/");
      const absolutePath = resolveProjectPath(sourcePath);
      const raw = fs.readFileSync(absolutePath, "utf8");
      const { frontmatter, body } = splitFrontmatter(raw);
      const slug = slugFromFilename(filename);
      const fallbackTitle = slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        slug,
        title: frontmatter.title ?? titleFromMarkdownBody(body, fallbackTitle),
        description: frontmatter.description ?? "",
        category: normalizeCategory(frontmatter.category, "Technical"),
        order: frontmatter.order ?? 100,
        sourcePath,
      };
    });
}

function registryToMeta(entry: AdminDocRegistryEntry): AdminDocMeta {
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    order: entry.order,
    sourcePath: entry.sourcePath,
    customPage: entry.customPage,
  };
}

export function getAdminDocCatalog(): AdminDocMeta[] {
  const bySlug = new Map<string, AdminDocMeta>();

  for (const entry of adminDocRegistry.map(registryToMeta)) {
    bySlug.set(entry.slug, entry);
  }

  for (const entry of discoverLocalDocs()) {
    bySlug.set(entry.slug, entry);
  }

  return [...bySlug.values()].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
}

export function getAdminDocBySlug(slug: string): AdminDocMeta | null {
  return getAdminDocCatalog().find((doc) => doc.slug === slug) ?? null;
}

export function getAdminDocCategories(docs: AdminDocMeta[]) {
  const categories = new Set(docs.map((doc) => doc.category));
  return [...categories].sort();
}
