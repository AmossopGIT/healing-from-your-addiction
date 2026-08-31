import cmsBlogAdmin from "@/docs/CMS_BLOG_ADMIN.md";
import deployProduction from "@/docs/DEPLOY_PRODUCTION.md";
import marketingChecklist from "@/docs/MARKETING_GERALD_CHECKLIST.md";
import howToAddPages from "@/content/admin-docs/how-to-add-pages.md";
import meeting20260831 from "@/content/admin-docs/meeting-2026-08-31-pricing-lead-nurture.md";
import meetingNotesIndex from "@/content/admin-docs/meeting-notes-index.md";
import meetingNotesTemplate from "@/content/admin-docs/meeting-notes-template.md";
import productLadderPlan from "@/content/admin-docs/plan-2026-08-31-product-ladder.md";

/**
 * Markdown admin docs inlined at build time so Vercel serverless does not
 * depend on filesystem tracing for content/admin-docs and selected docs/*.md.
 */
export const adminDocMarkdownBySourcePath: Record<string, string> = {
  "content/admin-docs/how-to-add-pages.md": howToAddPages,
  "content/admin-docs/meeting-notes-index.md": meetingNotesIndex,
  "content/admin-docs/meeting-2026-08-31-pricing-lead-nurture.md": meeting20260831,
  "content/admin-docs/meeting-notes-template.md": meetingNotesTemplate,
  "content/admin-docs/plan-2026-08-31-product-ladder.md": productLadderPlan,
  "docs/CMS_BLOG_ADMIN.md": cmsBlogAdmin,
  "docs/MARKETING_GERALD_CHECKLIST.md": marketingChecklist,
  "docs/DEPLOY_PRODUCTION.md": deployProduction,
};

export function getBundledAdminDocMarkdown(sourcePath: string): string | null {
  return adminDocMarkdownBySourcePath[sourcePath] ?? null;
}
