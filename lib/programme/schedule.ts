import type { ProgrammeTimeSlot, ProgrammeWeekday, SessionProgressStatus } from "@/types/database";

export const PROGRAMME_WEEKDAYS: { value: ProgrammeWeekday; label: string }[] = [
  { value: "tue", label: "Tuesday" },
  { value: "fri", label: "Friday" },
];

export const PROGRAMME_TIME_SLOTS: { value: ProgrammeTimeSlot; label: string }[] = [
  { value: "11:00", label: "11:00" },
  { value: "16:00", label: "16:00" },
];

export const PROGRAMME_TIMEZONE = "Africa/Johannesburg";

export function getMeetUrlForTimeSlot(timeSlot: ProgrammeTimeSlot) {
  if (timeSlot === "11:00") {
    return process.env.NEXT_PUBLIC_MEET_URL_11?.trim() || "https://meet.google.com/hfya-session-11";
  }
  return process.env.NEXT_PUBLIC_MEET_URL_16?.trim() || "https://meet.google.com/hfya-session-16";
}

export function sessionDurationMinutes(sessionNumber: number) {
  return sessionNumber <= 1 ? 90 : 45;
}

/** JS getDay(): 0=Sun … 2=Tue … 5=Fri */
function weekdayToJsDay(weekday: ProgrammeWeekday) {
  return weekday === "tue" ? 2 : 5;
}

function parseTimeSlot(timeSlot: ProgrammeTimeSlot) {
  const [hours, minutes] = timeSlot.split(":").map(Number);
  return { hours, minutes };
}

/** Build first session instant in Africa/Johannesburg as ISO string. */
export function computeFirstSessionAt(input: {
  fromDate?: string | null;
  weekday: ProgrammeWeekday;
  timeSlot: ProgrammeTimeSlot;
}) {
  const { hours, minutes } = parseTimeSlot(input.timeSlot);
  const targetDay = weekdayToJsDay(input.weekday);
  const start = input.fromDate ? new Date(`${input.fromDate}T12:00:00+02:00`) : new Date();
  const cursor = new Date(start);

  for (let i = 0; i < 14; i += 1) {
    if (cursor.getDay() === targetDay) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");
      return `${y}-${m}-${d}T${hh}:${mm}:00+02:00`;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return new Date().toISOString();
}

/**
 * Generate live coaching session dates alternating Tue/Fri from the first session.
 * Count comes from the published programme cadence (default 8).
 * Example (start Tue, count 8): Tue, Fri, Tue, Fri, Tue, Fri, Tue, Fri.
 * Uses fixed day offsets (SAST has no DST) so server timezone does not matter.
 */
export function generateSessionDates(
  firstSessionAt: string,
  weekday: ProgrammeWeekday,
  sessionCount = 8,
) {
  const count = Math.max(0, Math.floor(sessionCount));
  const dates: string[] = [];
  let currentWeekday: ProgrammeWeekday = weekday;
  let cursorMs = new Date(firstSessionAt).getTime();

  for (let i = 0; i < count; i += 1) {
    dates.push(new Date(cursorMs).toISOString());
    const daysToAdd = currentWeekday === "tue" ? 3 : 4;
    cursorMs += daysToAdd * 24 * 60 * 60 * 1000;
    currentWeekday = currentWeekday === "tue" ? "fri" : "tue";
  }

  return dates;
}

/** @deprecated Prefer generateSessionDates with an explicit count from programme cadence. */
export function generateEightSessionDates(firstSessionAt: string, weekday: ProgrammeWeekday) {
  return generateSessionDates(firstSessionAt, weekday, 8);
}

export function slotLabel(weekday: ProgrammeWeekday, timeSlot: ProgrammeTimeSlot) {
  const day = PROGRAMME_WEEKDAYS.find((item) => item.value === weekday)?.label ?? weekday;
  return `${day} at ${timeSlot}`;
}

/** Slot pickers submit one radio value so weekday and time cannot be mismatched. */
export function encodeSlotValue(weekday: ProgrammeWeekday, timeSlot: ProgrammeTimeSlot) {
  return `${weekday}|${timeSlot}`;
}

export function decodeSlotValue(value: string) {
  const [weekday, timeSlot] = value.split("|");
  const validWeekday = PROGRAMME_WEEKDAYS.some((item) => item.value === weekday);
  const validSlot = PROGRAMME_TIME_SLOTS.some((item) => item.value === timeSlot);
  if (!validWeekday || !validSlot) return null;
  return { weekday: weekday as ProgrammeWeekday, timeSlot: timeSlot as ProgrammeTimeSlot };
}

export const PROGRAMME_SLOT_OPTIONS = PROGRAMME_WEEKDAYS.flatMap((day) =>
  PROGRAMME_TIME_SLOTS.map((slot) => ({
    value: encodeSlotValue(day.value, slot.value),
    weekday: day.value,
    timeSlot: slot.value,
    label: slotLabel(day.value, slot.value),
  })),
);

/**
 * Session instants are stored as UTC, but everything the client and Gerald read
 * must be South African time regardless of where the server renders.
 */
function sastFormatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-ZA", { ...options, timeZone: PROGRAMME_TIMEZONE });
}

export function formatSessionDateTime(value: string) {
  return sastFormatter({ dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

export function formatSessionDateShort(value: string) {
  return sastFormatter({ weekday: "short", day: "numeric", month: "short" }).format(new Date(value));
}

export function formatSessionTime(value: string) {
  return sastFormatter({ hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function formatSessionDayNumber(value: string) {
  return sastFormatter({ day: "numeric" }).format(new Date(value));
}

export function formatSessionMonth(value: string) {
  return sastFormatter({ month: "long", year: "numeric" }).format(new Date(value));
}

/**
 * Whole-day difference from today in SAST, used for "in 3 days" style copy.
 * Reads formatted parts rather than splitting a locale string, whose field
 * order varies by environment.
 */
export function daysUntil(value: string, now = new Date()) {
  const formatter = sastFormatter({ year: "numeric", month: "2-digit", day: "2-digit" });
  const utcNoonInSast = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((item) => item.type === type)?.value ?? 0);
    return Date.UTC(part("year"), part("month") - 1, part("day"), 12);
  };
  const diffMs = utcNoonInSast(new Date(value)) - utcNoonInSast(now);
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function relativeSessionLabel(value: string, now = new Date()) {
  const days = daysUntil(value, now);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export type ProgrammeCalendarEntry = {
  id: string;
  sessionNumber: number;
  weekNumber: number;
  title: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  status: SessionProgressStatus;
  href?: string;
  recordingUrl?: string | null;
};

/** Groups entries into week rows so both portal and admin render the same shape. */
export function groupEntriesByWeek(entries: ProgrammeCalendarEntry[]) {
  const weeks = new Map<number, ProgrammeCalendarEntry[]>();
  for (const entry of entries) {
    const list = weeks.get(entry.weekNumber) ?? [];
    list.push(entry);
    weeks.set(entry.weekNumber, list);
  }
  return [...weeks.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekNumber, items]) => ({
      weekNumber,
      entries: items.sort((a, b) => a.sessionNumber - b.sessionNumber),
    }));
}

export function findNextSession(entries: ProgrammeCalendarEntry[], now = new Date()) {
  const upcoming = entries
    .filter((entry) => entry.scheduledAt && entry.status !== "completed")
    .filter((entry) => new Date(entry.scheduledAt as string).getTime() >= now.getTime() - 60 * 60 * 1000)
    .sort((a, b) => new Date(a.scheduledAt as string).getTime() - new Date(b.scheduledAt as string).getTime());
  return upcoming[0] ?? null;
}

function icsEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function icsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Minimal RFC 5545 feed so clients can import scheduled live sessions into any calendar app. */
export function buildProgrammeIcs(input: {
  programmeTitle: string;
  meetUrl: string | null;
  entries: ProgrammeCalendarEntry[];
}) {
  const now = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Healing From Your Addiction//Programme//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(input.programmeTitle)}`,
    `X-WR-TIMEZONE:${PROGRAMME_TIMEZONE}`,
  ];

  for (const entry of input.entries) {
    if (!entry.scheduledAt) continue;
    const start = new Date(entry.scheduledAt);
    const end = new Date(start.getTime() + (entry.durationMinutes ?? 45) * 60 * 1000);
    const description = input.meetUrl
      ? `Session ${entry.sessionNumber} of your programme. Join: ${input.meetUrl}`
      : `Session ${entry.sessionNumber} of your programme.`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${entry.id}@healingfromyouraddiction.co.za`,
      `DTSTAMP:${icsStamp(now)}`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${icsEscape(`Session ${entry.sessionNumber} — ${entry.title}`)}`,
      `DESCRIPTION:${icsEscape(description)}`,
    );
    if (input.meetUrl) {
      lines.push(`LOCATION:${icsEscape(input.meetUrl)}`, `URL:${icsEscape(input.meetUrl)}`);
    }
    lines.push("BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Session starts soon", "END:VALARM");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
