export function isCmsContentEnabled() {
  // Trim: Windows `vercel env add` piping can leave trailing \r\n in stored values.
  return process.env.NEXT_PUBLIC_CMS_CONTENT_ENABLED?.trim() === "true";
}
