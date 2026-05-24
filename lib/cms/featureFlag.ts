export function isCmsContentEnabled() {
  return process.env.NEXT_PUBLIC_CMS_CONTENT_ENABLED === "true";
}
