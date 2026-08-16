import { describe, expect, it } from "vitest";
import { composeIntakeStoredValue, resolveIntakeInput, splitIntakeStoredValue } from "@/lib/intake/inputHints";

describe("resolveIntakeInput", () => {
  it("maps frequency questions to single chips", () => {
    const hint = resolveIntakeInput("How often do you currently use it?");
    expect(hint.kind).toBe("chips_single");
    expect(hint.options?.length).toBeGreaterThan(2);
  });

  it("maps trigger questions to multi chips", () => {
    const hint = resolveIntakeInput("What situations most often lead you to use cannabis?");
    expect(hint.kind).toBe("chips_multi");
  });

  it("keeps reflective questions as short text", () => {
    const hint = resolveIntakeInput("What thoughts typically come up just before you use?");
    expect(hint.kind).toBe("short_text");
  });
});

describe("compose and split intake values", () => {
  it("round-trips chip selections with notes", () => {
    const stored = composeIntakeStoredValue({
      kind: "chips_multi",
      selections: ["Stress", "Anxiety"],
      note: "Mostly evenings",
    });
    expect(stored).toContain("Stress; Anxiety");
    const parsed = splitIntakeStoredValue(stored);
    expect(parsed.selections).toEqual(["Stress", "Anxiety"]);
    expect(parsed.note).toBe("Mostly evenings");
  });
});
