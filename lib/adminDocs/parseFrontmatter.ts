export type AdminDocFrontmatter = {
  title?: string;
  description?: string;
  category?: string;
  order?: number;
};

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseScalar(value: string) {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function splitFrontmatter(raw: string): { frontmatter: AdminDocFrontmatter; body: string } {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter: AdminDocFrontmatter = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = parseScalar(line.slice(separator + 1));
    if (key === "title" && typeof value === "string") frontmatter.title = value;
    if (key === "description" && typeof value === "string") frontmatter.description = value;
    if (key === "category" && typeof value === "string") frontmatter.category = value;
    if (key === "order" && typeof value === "number") frontmatter.order = value;
  }

  return { frontmatter, body: match[2] };
}

export function titleFromMarkdownBody(body: string, fallback: string) {
  const match = body.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}
