import type { ProgrammeTimeSlot, ProgrammeWeekday } from "@/types/database";

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
 * Generate 8 session dates over 4 weeks, alternating Tue/Fri from the first session.
 * Example (start Tue): Tue, Fri, Tue, Fri, Tue, Fri, Tue, Fri.
 * Example (start Fri): Fri, Tue, Fri, Tue, Fri, Tue, Fri, Tue.
 * Uses fixed day offsets (SAST has no DST) so server timezone does not matter.
 */
export function generateEightSessionDates(firstSessionAt: string, weekday: ProgrammeWeekday) {
  const dates: string[] = [];
  let currentWeekday: ProgrammeWeekday = weekday;
  let cursorMs = new Date(firstSessionAt).getTime();

  for (let i = 0; i < 8; i += 1) {
    dates.push(new Date(cursorMs).toISOString());
    const daysToAdd = currentWeekday === "tue" ? 3 : 4;
    cursorMs += daysToAdd * 24 * 60 * 60 * 1000;
    currentWeekday = currentWeekday === "tue" ? "fri" : "tue";
  }

  return dates;
}

export function slotLabel(weekday: ProgrammeWeekday, timeSlot: ProgrammeTimeSlot) {
  const day = PROGRAMME_WEEKDAYS.find((item) => item.value === weekday)?.label ?? weekday;
  return `${day} at ${timeSlot}`;
}
