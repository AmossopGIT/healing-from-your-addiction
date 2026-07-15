export const ADMIN_TABLE_PAGE_SIZE = 20;

export type PaginatedSlice<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export function parsePageParam(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function paginateItems<T>(items: T[], page: number, pageSize = ADMIN_TABLE_PAGE_SIZE): PaginatedSlice<T> {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalCount,
    totalPages,
  };
}

export function buildPageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
  pageParam = "page",
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === pageParam) continue;
    if (value) search.set(key, value);
  }
  if (page > 1) search.set(pageParam, String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
