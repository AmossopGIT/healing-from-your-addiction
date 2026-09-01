export type AdminDocCategory = "Operations" | "Content" | "Technical" | "Marketing" | "Planning records";

export type AdminDocCustomPage =
  | "admin-login-guide"
  | "lead-onboarding-guide"
  | "lead-triage-playbook"
  | "programme-start-guide";

export type AdminDocRegistryEntry = {
  slug: string;
  title: string;
  description: string;
  category: AdminDocCategory;
  order: number;
  /** Path relative to project root */
  sourcePath?: string;
  customPage?: AdminDocCustomPage;
};

/** Register repo docs that should appear in the admin docs hub. */
export const adminDocRegistry: AdminDocRegistryEntry[] = [
  {
    slug: "how-to-add-pages",
    title: "Adding internal admin pages",
    description: "How to publish new documentation in the admin docs hub.",
    category: "Technical",
    order: 1,
    sourcePath: "content/admin-docs/how-to-add-pages.md",
  },
  {
    slug: "meeting-notes-index",
    title: "Meeting notes index",
    description: "Chronological record of internal planning meetings — decisions, action items, and follow-ups.",
    category: "Planning records",
    order: 1,
    sourcePath: "content/admin-docs/meeting-notes-index.md",
  },
  {
    slug: "meeting-2026-08-31-pricing-lead-nurture",
    title: "Meeting: pricing, lead nurture, and platform automation",
    description:
      "31 Aug 2026 — ads are working but many leads cannot pay R12,000 now; plan free content nurture, pricing rethink, and automation.",
    category: "Planning records",
    order: 20260831,
    sourcePath: "content/admin-docs/meeting-2026-08-31-pricing-lead-nurture.md",
  },
  {
    slug: "plan-2026-08-31-product-ladder",
    title: "Plan: payment ladder and 30-day commercial test",
    description:
      "Product ladder so leads can take a safe first paid step (R350) instead of jumping from an ad to R12,000 — plus what to test first.",
    category: "Planning records",
    order: 20260832,
    sourcePath: "content/admin-docs/plan-2026-08-31-product-ladder.md",
  },
  {
    slug: "meeting-notes-template",
    title: "Meeting notes template",
    description: "Copy this template when adding a new internal meeting record to the admin docs hub.",
    category: "Planning records",
    order: 9999,
    sourcePath: "content/admin-docs/meeting-notes-template.md",
  },
  {
    slug: "how-to-login-as-admin",
    title: "How to log in as admin",
    description: "Open the admin sign-in page, enter your credentials, and confirm you reach the admin dashboard.",
    category: "Operations",
    order: 2,
    customPage: "admin-login-guide",
  },
  {
    slug: "lead-to-client-onboarding-flow",
    title: "Lead to client onboarding flow",
    description: "Where new enquiries land, what consent is captured, and the steps from lead to portal invite and intake.",
    category: "Operations",
    order: 8,
    customPage: "lead-onboarding-guide",
  },
  {
    slug: "after-invite-start-the-course",
    title: "After invite: start the course",
    description:
      "Week 1 launch steps after a client is invited — assign the interactive programme, release receipts and guides, and confirm the live slot.",
    category: "Operations",
    order: 9,
    customPage: "programme-start-guide",
  },
  {
    slug: "lead-triage-playbook",
    title: "Lead triage playbook",
    description: "First-response targets, status workflow, and safety language for enquiries.",
    category: "Operations",
    order: 10,
    customPage: "lead-triage-playbook",
  },
  {
    slug: "cms-blog-admin",
    title: "CMS blog admin",
    description: "Template import, live preview, SEO checklist, and publishing workflow.",
    category: "Content",
    order: 20,
    sourcePath: "docs/CMS_BLOG_ADMIN.md",
  },
  {
    slug: "marketing-checklist",
    title: "Marketing checklist (Gerald)",
    description: "Launch tasks for admin access, intake, ads, and content production.",
    category: "Marketing",
    order: 30,
    sourcePath: "docs/MARKETING_GERALD_CHECKLIST.md",
  },
  {
    slug: "deploy-production",
    title: "Production deploy",
    description: "Environment variables, Supabase, Resend, and go-live verification.",
    category: "Technical",
    order: 40,
    sourcePath: "docs/DEPLOY_PRODUCTION.md",
  },
];
