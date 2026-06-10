import { formatDashboardDate } from "@/lib/dashboard/constants";

export type PortalActivityItem = {
  id: string;
  label: string;
  detail: string;
  href: string | null;
  occurredAt: string;
  dayKey: string;
};

function toDayKey(value: string) {
  return value.slice(0, 10);
}

function dayLabel(dayKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dayKey === today) return "Today";
  if (dayKey === yesterday) return "Yesterday";
  return formatDashboardDate(`${dayKey}T12:00:00.000Z`).split(",")[0];
}

export function groupPortalActivity(items: PortalActivityItem[]) {
  const sorted = [...items].sort((left, right) => (left.occurredAt < right.occurredAt ? 1 : -1));
  const groups = new Map<string, PortalActivityItem[]>();

  for (const item of sorted) {
    const existing = groups.get(item.dayKey) ?? [];
    existing.push(item);
    groups.set(item.dayKey, existing);
  }

  return [...groups.entries()].map(([dayKey, groupItems]) => ({
    dayKey,
    dayLabel: dayLabel(dayKey),
    items: groupItems,
  }));
}

type BuildActivityInput = {
  messages: Array<{ id: string; body: string; created_at: string; isAdmin: boolean }>;
  sessionEvents: Array<{ id: string; label: string; occurredAt: string; href: string }>;
  documentEvents: Array<{ id: string; label: string; occurredAt: string }>;
  intakeEvents: Array<{ id: string; label: string; occurredAt: string }>;
  checkInEvents: Array<{ id: string; label: string; occurredAt: string }>;
};

export function buildPortalActivityFeed(input: BuildActivityInput): PortalActivityItem[] {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const items: PortalActivityItem[] = [];

  for (const message of input.messages) {
    items.push({
      id: `message-${message.id}`,
      label: message.isAdmin ? "Message from Gerald" : "You sent a message",
      detail: message.body.slice(0, 120),
      href: "/portal/messages/",
      occurredAt: message.created_at,
      dayKey: toDayKey(message.created_at),
    });
  }

  for (const sessionEvent of input.sessionEvents) {
    items.push({
      id: `session-${sessionEvent.id}`,
      label: sessionEvent.label,
      detail: "",
      href: sessionEvent.href,
      occurredAt: sessionEvent.occurredAt,
      dayKey: toDayKey(sessionEvent.occurredAt),
    });
  }

  for (const documentEvent of input.documentEvents) {
    items.push({
      id: `document-${documentEvent.id}`,
      label: "New resource shared",
      detail: documentEvent.label,
      href: "/portal/resources/",
      occurredAt: documentEvent.occurredAt,
      dayKey: toDayKey(documentEvent.occurredAt),
    });
  }

  for (const intakeEvent of input.intakeEvents) {
    items.push({
      id: `intake-${intakeEvent.id}`,
      label: intakeEvent.label,
      detail: "",
      href: "/portal/intake/",
      occurredAt: intakeEvent.occurredAt,
      dayKey: toDayKey(intakeEvent.occurredAt),
    });
  }

  for (const checkInEvent of input.checkInEvents) {
    items.push({
      id: `checkin-${checkInEvent.id}`,
      label: checkInEvent.label,
      detail: "",
      href: "/portal/#daily-check-in",
      occurredAt: checkInEvent.occurredAt,
      dayKey: toDayKey(checkInEvent.occurredAt),
    });
  }

  return items.filter((item) => new Date(item.occurredAt).getTime() >= cutoff);
}
