import { describe, expect, it } from "vitest";
import { interactiveProgrammes } from "@/content/interactiveProgrammes";
import {
  applyActivityPatches,
  parseProgrammeImportJson,
} from "@/lib/programme/interactive/adminDraft";

describe("programme admin draft helpers", () => {
  const gambling = interactiveProgrammes.find((programme) => programme.slug === "gambling")!;

  it("patches title and affirmation without changing locked fields", () => {
    const target = gambling.activities.find((activity) => activity.type === "daily_affirmation")!;
    const result = applyActivityPatches(gambling.activities, [
      {
        id: target.id,
        title: "Updated day title",
        affirmation: "I choose a calmer path today.",
        points: 12,
      },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const updated = result.activities.find((activity) => activity.id === target.id)!;
    expect(updated.title).toBe("Updated day title");
    expect(updated.affirmation).toBe("I choose a calmer path today.");
    expect(updated.points).toBe(12);
    expect(updated.origin).toBe(target.origin);
    expect(updated.type).toBe(target.type);
    expect(updated.moduleId).toBe(target.moduleId);
    expect(updated.sortOrder).toBe(target.sortOrder);
  });

  it("rejects unknown activity ids", () => {
    const result = applyActivityPatches(gambling.activities, [{ id: "not-a-real-id", title: "x" }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/Unknown activity id/);
  });

  it("rejects PDF magic in programme import", () => {
    const result = parseProgrammeImportJson("%PDF-1.4 fake", { filename: "pack.pdf" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]).toMatch(/PDF or Word/);
  });

  it("imports a minimal valid programme JSON as draft-ready", () => {
    const sample = {
      ...gambling,
      slug: "custom-imported-demo",
      title: "Custom Imported Demo",
      reviewStatus: "approved",
      needsManualReview: false,
      status: "published",
    };
    const result = parseProgrammeImportJson(JSON.stringify(sample));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.programme.slug).toBe("custom-imported-demo");
    expect(result.programme.status).toBe("draft");
    expect(result.programme.reviewStatus).toBe("pending");
    expect(result.programme.needsManualReview).toBe(true);
  });
});
