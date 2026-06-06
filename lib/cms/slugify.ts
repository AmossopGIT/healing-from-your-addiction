const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** URL-safe slug from a title (lowercase, hyphens, no leading/trailing hyphens). */
export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function isValidBlogSlug(slug: string): boolean {
  const value = slug.trim();
  return value.length > 0 && value.length <= 120 && SLUG_PATTERN.test(value);
}
