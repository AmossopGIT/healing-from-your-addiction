import { describe, expect, it } from "vitest";
import { interactiveProgrammes } from "@/content/interactiveProgrammes";
import { validateAllInteractiveProgrammes } from "@/content/interactiveProgrammes/validate";
import {
  extractDailyCheckInPayload,
  isHighUrge,
  mergeAdminVisibleResponses,
  splitResponses,
  summarizeJourney,
} from "@/lib/programme/interactive/progress";
import { generateSessionDates, generateEightSessionDates } from "@/lib/programme/schedule";
import { reportingRowsToCsv, type ProgrammeFunnelRow } from "@/lib/programme/interactive/reporting";

describe("interactive programmes", () => {
  it("loads all 23 programmes", () => {
    expect(interactiveProgrammes).toHaveLength(23);
  });

  it("has no validation errors", () => {
    const errors = validateAllInteractiveProgrammes().filter((issue) => issue.level === "error");
    expect(errors).toEqual([]);
  });

  it("uses source-defined structure metadata", () => {
    for (const programme of interactiveProgrammes) {
      expect(programme.structure?.slug).toBe(programme.slug);
      expect(programme.cadence?.liveSessionCount).toBeGreaterThan(0);
      expect(programme.dailyCheckIn?.includeMood).toBe(true);
      const sourceCount = programme.activities.filter((activity) => activity.origin === "source").length;
      const platformCount = programme.activities.filter((activity) => activity.origin === "platform").length;
      expect(sourceCount).toBeGreaterThan(0);
      expect(platformCount).toBeGreaterThan(0);
    }
  });

  it("summarizes journey progress", () => {
    const gambling = interactiveProgrammes.find((programme) => programme.slug === "gambling");
    expect(gambling).toBeTruthy();
    const summary = summarizeJourney(gambling!, [], gambling!.activities[0]?.id);
    expect(summary.totalActivities).toBe(gambling!.activities.length);
    expect(summary.percentComplete).toBe(0);
    expect(summary.currentActivity?.id).toBe(gambling!.activities[0]?.id);
  });

  it("marks vector-print PDFs as OCR-extracted and flags wording review", () => {
    const ocr = interactiveProgrammes.filter((programme) => programme.sourceStatus === "ocr-extracted");
    expect(ocr.map((programme) => programme.slug).sort()).toEqual(["cannabis", "nicotine", "opioid"]);
    expect(ocr.every((programme) => programme.needsManualReview === true)).toBe(true);
  });

  it("splits private answers from public progress metadata", () => {
    const gambling = interactiveProgrammes.find((programme) => programme.slug === "gambling")!;
    const daily = gambling.activities.find((activity) => activity.type === "daily_affirmation")!;
    const { publicResponses, privateResponses } = splitResponses(daily, {
      mood: "steady",
      urge_level: 2,
      pause_taken: true,
      private_note: "keep private",
      share_with_admin: false,
    });
    expect(publicResponses.mood).toBe("steady");
    expect(publicResponses.urge_level).toBe(2);
    expect(privateResponses.private_note).toBe("keep private");
    expect(publicResponses.private_note).toBeUndefined();
  });

  it("extracts canonical daily check-in values and high-urge flags", () => {
    const gambling = interactiveProgrammes.find((programme) => programme.slug === "gambling")!;
    const daily = gambling.activities.find((activity) => activity.type === "daily_affirmation")!;
    const payload = extractDailyCheckInPayload(
      { mood: "anxious", urge_level: 5, pause_taken: true },
      { private_note: "hard day" },
      true,
    );
    expect(payload).toEqual({
      mood: "anxious",
      craving_level: 5,
      pause_taken: true,
      note: "hard day",
    });
    expect(isHighUrge(daily, { urge_level: 5 }, 4)).toBe(true);
    expect(isHighUrge(daily, { urge_level: 2 }, 4)).toBe(false);
  });

  it("only merges shared private answers for admin rendering", () => {
    const hidden = mergeAdminVisibleResponses({
      publicResponses: { mood: "calm" },
      legacyResponses: {},
      sharedPrivateResponses: { private_note: "secret" },
      sharedWithAdmin: false,
    });
    expect(hidden).toEqual({ mood: "calm" });

    const shared = mergeAdminVisibleResponses({
      publicResponses: { mood: "calm" },
      legacyResponses: {},
      sharedPrivateResponses: { private_note: "shared note" },
      sharedWithAdmin: true,
    });
    expect(shared).toEqual({ mood: "calm", private_note: "shared note" });
  });

  it("generates live-session schedules from cadence count and preserves eight-session helper", () => {
    const first = "2026-08-04T09:00:00.000Z";
    expect(generateSessionDates(first, "tue", 4)).toHaveLength(4);
    expect(generateSessionDates(first, "tue", 10)).toHaveLength(10);
    expect(generateEightSessionDates(first, "tue")).toHaveLength(8);
  });

  it("serializes reporting rows to csv", () => {
    const rows: ProgrammeFunnelRow[] = [
      {
        addictionSlug: "gambling",
        title: "Gambling",
        enrollments: 2,
        started: 1,
        completed: 0,
        avgCompletedActivities: 3.5,
        inactiveActiveClients: 1,
        safetyFlags: 0,
        avgDaysToStart: 1.2,
      },
    ];
    const csv = reportingRowsToCsv(rows);
    expect(csv).toContain("programme_slug,title,enrollments");
    expect(csv).toContain("gambling");
  });
});
