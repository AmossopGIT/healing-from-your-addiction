import { describe, expect, it } from "vitest";
import { getAdminDocBySlug, getAdminDocCatalog } from "@/lib/adminDocs/catalog";
import { splitFrontmatter, titleFromMarkdownBody } from "@/lib/adminDocs/parseFrontmatter";
import { parseAdminDocBlocks } from "@/lib/adminDocs/renderMarkdown";

describe("splitFrontmatter", () => {
  it("parses yaml frontmatter and body", () => {
    const raw = `---
title: Test page
description: A short guide
category: Operations
order: 3
---

# Heading
Body text
`;

    const { frontmatter, body } = splitFrontmatter(raw);
    expect(frontmatter.title).toBe("Test page");
    expect(frontmatter.description).toBe("A short guide");
    expect(frontmatter.category).toBe("Operations");
    expect(frontmatter.order).toBe(3);
    expect(body.trim()).toBe("# Heading\nBody text");
  });
});

describe("titleFromMarkdownBody", () => {
  it("uses the first h1 when present", () => {
    expect(titleFromMarkdownBody("# Lead triage\n\nDetails", "Fallback")).toBe("Lead triage");
  });
});

describe("parseAdminDocBlocks", () => {
  it("parses headings, lists, and code blocks", () => {
    const blocks = parseAdminDocBlocks(`## Section\n\nIntro paragraph.\n\n- One\n- Two\n\n\`\`\`ts\nconst x = 1;\n\`\`\``);

    expect(blocks).toEqual([
      { type: "heading", level: 2, text: "Section" },
      { type: "paragraph", text: "Intro paragraph." },
      { type: "ul", items: ["One", "Two"] },
      { type: "code", language: "ts", text: "const x = 1;" },
    ]);
  });
});

describe("getAdminDocCatalog", () => {
  it("includes registered, local, and custom admin docs", () => {
    const docs = getAdminDocCatalog();
    expect(docs.some((doc) => doc.slug === "how-to-add-pages")).toBe(true);
    expect(docs.some((doc) => doc.slug === "how-to-login-as-admin")).toBe(true);
    expect(docs.some((doc) => doc.slug === "lead-triage-playbook")).toBe(true);
    expect(getAdminDocBySlug("lead-triage-playbook")?.customPage).toBe("lead-triage-playbook");
    expect(docs.some((doc) => doc.slug === "lead-to-client-onboarding-flow")).toBe(true);
    expect(docs.some((doc) => doc.slug === "after-invite-start-the-course")).toBe(true);
    expect(docs.some((doc) => doc.slug === "meeting-notes-index")).toBe(true);
    expect(docs.some((doc) => doc.slug === "meeting-2026-08-31-pricing-lead-nurture")).toBe(true);
    expect(getAdminDocBySlug("meeting-2026-08-31-pricing-lead-nurture")?.category).toBe("Planning records");
    expect(getAdminDocBySlug("how-to-add-pages")?.sourcePath).toBe("content/admin-docs/how-to-add-pages.md");
    expect(getAdminDocBySlug("how-to-login-as-admin")?.customPage).toBe("admin-login-guide");
    expect(getAdminDocBySlug("lead-to-client-onboarding-flow")?.customPage).toBe("lead-onboarding-guide");
    expect(getAdminDocBySlug("after-invite-start-the-course")?.customPage).toBe("programme-start-guide");
  });
});

describe("loadAdminDocContent", () => {
  it("loads meeting notes from the bundled markdown map", async () => {
    const { loadAdminDocContent } = await import("@/lib/adminDocs/loadDoc");
    const doc = loadAdminDocContent("meeting-notes-index");
    expect(doc).not.toBeNull();
    expect(doc?.title).toBe("Meeting notes index");
    expect(doc?.body).toContain("Planning records index");
  });
});
