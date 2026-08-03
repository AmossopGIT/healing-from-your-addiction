/**
 * Smoke-check gambling (behavioral), alcohol (substance), cannabis (OCR)
 * for seed-shaped content, preview activity resolution, and daily check-in fields.
 */
import { getInteractiveProgramme } from "../content/interactiveProgrammes/index.ts";
import { validateInteractiveProgramme } from "../content/interactiveProgrammes/validate.ts";
import { findActivity, getOrderedActivities } from "../lib/programme/interactive/content.ts";
import {
  extractDailyCheckInPayload,
  isHighUrge,
  splitResponses,
  summarizeJourney,
  validateActivityResponses,
} from "../lib/programme/interactive/progress.ts";
import { generateSessionDates } from "../lib/programme/schedule.ts";

const SLUGS = ["gambling", "alcohol", "cannabis"] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const slug of SLUGS) {
  const programme = getInteractiveProgramme(slug);
  assert(programme, `${slug}: missing definition`);

  const issues = validateInteractiveProgramme(programme).filter((issue) => issue.level === "error");
  assert(issues.length === 0, `${slug}: validation errors ${issues.map((i) => i.message).join("; ")}`);

  const ordered = getOrderedActivities(programme);
  assert(ordered.length > 0, `${slug}: no activities`);

  const first = ordered[0];
  assert(findActivity(programme, first.id)?.id === first.id, `${slug}: preview activity lookup failed`);

  const daily = ordered.find((activity) => activity.type === "daily_affirmation");
  assert(daily, `${slug}: missing daily affirmation`);
  assert(daily.fields?.some((field) => field.kind === "mood"), `${slug}: daily mood field missing`);
  assert(daily.fields?.some((field) => field.key === "urge_level"), `${slug}: urge field missing`);

  const sample = {
    mood: "steady",
    urge_level: 2,
    pause_taken: true,
    practice_done: true,
    private_note: "smoke private",
    share_with_admin: false,
  };
  assert(validateActivityResponses(daily, sample) === null, `${slug}: sample daily responses invalid`);

  const split = splitResponses(daily, sample);
  assert(split.publicResponses.mood === "steady", `${slug}: mood should be public`);
  assert(split.privateResponses.private_note === "smoke private", `${slug}: note should be private`);

  const checkIn = extractDailyCheckInPayload(sample, split.privateResponses, false);
  assert(checkIn?.craving_level === 2, `${slug}: check-in payload missing`);
  assert(checkIn?.note === null, `${slug}: unshared note must stay out of check-in`);

  assert(isHighUrge(daily, { urge_level: 5 }, programme.dailyCheckIn.highUrgeThreshold), `${slug}: high urge detection failed`);

  const summary = summarizeJourney(programme, [], first.id);
  assert(summary.currentActivity?.id === first.id, `${slug}: journey current activity mismatch`);

  const liveCount = programme.cadence.liveSessionCount;
  const dates = generateSessionDates("2026-08-04T09:00:00.000Z", "tue", liveCount);
  assert(dates.length === liveCount, `${slug}: cadence session count mismatch`);

  const originSource = programme.activities.filter((a) => a.origin === "source").length;
  const originPlatform = programme.activities.filter((a) => a.origin === "platform").length;
  assert(originSource > 0 && originPlatform > 0, `${slug}: expected source and platform activities`);

  if (slug === "gambling") assert(programme.category === "behavioral", "gambling should be behavioral");
  if (slug === "alcohol") assert(programme.category === "substance", "alcohol should be substance");
  if (slug === "cannabis") {
    assert(programme.sourceStatus === "ocr-extracted", "cannabis should be OCR-extracted");
    assert(programme.needsManualReview === true, "cannabis should need manual review");
  }

  console.log(
    `OK ${slug}: v${programme.version} · ${ordered.length} activities · cadence ${liveCount} · source/platform ${originSource}/${originPlatform} · first=${first.id}`,
  );
}

console.log("Smoke content checks passed for gambling, alcohol, cannabis.");
