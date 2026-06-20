export type AdminDocCategory = "Operations" | "Content" | "Technical" | "Marketing";

export type AdminDocCustomPage = "admin-login-guide";

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
    slug: "how-to-login-as-admin",
    title: "How to log in as admin",
    description: "Open the admin sign-in page, enter your credentials, and confirm you reach the admin dashboard.",
    category: "Operations",
    order: 2,
    customPage: "admin-login-guide",
  },
  {
    slug: "lead-triage-playbook",
    title: "Lead triage playbook",
    description: "First-response targets, status workflow, and safety language for enquiries.",
    category: "Operations",
    order: 10,
    sourcePath: "docs/LEAD_TRIAGE_PLAYBOOK.md",
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
