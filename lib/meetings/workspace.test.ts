import { describe, expect, it } from "vitest";
import { meetingActions } from "@/content/meetings/catalog";
import { filterActionsForTab, resolveMeetingActions } from "@/lib/meetings/workspace";
import { parseAdminDocBlocks } from "@/lib/adminDocs/renderMarkdown";

describe("meetings workspace buckets", () => {
  it("puts open today actions in Today and hides them from Archive", () => {
    const resolved = resolveMeetingActions(meetingActions, {});
    const today = filterActionsForTab(resolved, "today", "gerald");
    const archive = filterActionsForTab(resolved, "archive", "gerald");

    expect(today.length).toBeGreaterThan(0);
    expect(today.every((action) => action.owner === "gerald")).toBe(true);
    expect(today.every((action) => action.bucket === "today")).toBe(true);
    expect(archive).toHaveLength(0);
  });

  it("moves completed actions into Archive", () => {
    const firstGerald = meetingActions.find((action) => action.owner === "gerald" && action.bucket === "today");
    expect(firstGerald).toBeTruthy();

    const resolved = resolveMeetingActions(meetingActions, { [firstGerald!.id]: "done" });
    const today = filterActionsForTab(resolved, "today", "gerald");
    const archive = filterActionsForTab(resolved, "archive", "gerald");

    expect(today.some((action) => action.id === firstGerald!.id)).toBe(false);
    expect(archive.some((action) => action.id === firstGerald!.id && action.status === "done")).toBe(true);
  });
});

describe("admin doc tables", () => {
  it("parses tables with markdown links without leaking raw rows", () => {
    const blocks = parseAdminDocBlocks(`## Action items

| Status | Action | Due |
| --- | --- | --- |
| Open | Review [Lead triage](/admin/docs/lead-triage-playbook/) | This week |
`);

    expect(blocks.some((block) => block.type === "paragraph" && block.text.includes("| Status |"))).toBe(false);
    const table = blocks.find((block) => block.type === "table");
    expect(table).toMatchObject({
      type: "table",
      headers: ["Status", "Action", "Due"],
      rows: [["Open", "Review [Lead triage](/admin/docs/lead-triage-playbook/)", "This week"]],
    });
  });
});
