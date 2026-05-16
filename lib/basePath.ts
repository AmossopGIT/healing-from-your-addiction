const basePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (process.env.GITHUB_PAGES === "true" ? "/healing-from-your-addiction" : "")
).replace(/\/$/, "");

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!basePath) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}
