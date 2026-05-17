export function formatBlogDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
