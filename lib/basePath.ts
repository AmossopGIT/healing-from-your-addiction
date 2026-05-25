export const siteBasePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (process.env.GITHUB_PAGES === "true" ? "/healing-from-your-addiction" : "")
).replace(/\/$/, "");

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!siteBasePath) {
    return normalizedPath;
  }

  if (normalizedPath === siteBasePath || normalizedPath.startsWith(`${siteBasePath}/`)) {
    return normalizedPath;
  }

  return `${siteBasePath}${normalizedPath}`;
}

export function withoutBasePath(path: string) {
  if (!siteBasePath) {
    return path || "/";
  }

  if (path === siteBasePath) {
    return "/";
  }

  if (path.startsWith(`${siteBasePath}/`)) {
    return path.slice(siteBasePath.length) || "/";
  }

  return path || "/";
}
