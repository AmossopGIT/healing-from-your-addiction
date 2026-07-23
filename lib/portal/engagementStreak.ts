function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function computeEngagementStreak(activityDates: string[]) {
  const uniqueDates = [
    ...new Set(
      activityDates
        .map(toDateKey)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort();
  if (!uniqueDates.length) return 0;

  const today = toDateKey(new Date());
  if (!today) return 0;

  const latest = uniqueDates[uniqueDates.length - 1];
  if (latest !== today && latest !== addDays(today, -1)) {
    return 0;
  }

  let streak = 0;
  let cursor = latest;

  while (uniqueDates.includes(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function countPausesThisWeek(checkIns: Array<{ check_in_date: string; pause_taken: boolean }>) {
  const now = new Date();
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);

  const weekStartKey = toDateKey(weekStart);
  if (!weekStartKey) return 0;

  return checkIns.filter((checkIn) => checkIn.check_in_date >= weekStartKey && checkIn.pause_taken).length;
}

export function computeAbstinenceDays(startDate: string | null) {
  if (!startDate) return 0;

  const start = new Date(`${startDate}T12:00:00.000Z`);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const diffMs = todayUtc.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}
