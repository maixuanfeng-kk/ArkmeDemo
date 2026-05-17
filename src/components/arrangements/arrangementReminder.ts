import {
  formatDateKey,
  getArrangementTimeKind,
  resolveArrangementDateKey,
} from "@/components/arrangements/arrangementTime";
import type {
  ArrangementItem,
  ArrangementReminderLead,
  ArrangementReminderRepeat,
} from "@/data/arrangements";

export type ReminderKind = "none" | "upcoming" | "ready" | "snoozed" | "handled";

export type ArrangementReminderInfo = {
  arrangement: ArrangementItem;
  kind: ReminderKind;
  targetAt?: number;
  triggerAt?: number;
  snoozedUntil?: number;
};

const leadMinutes: Record<ArrangementReminderLead, number> = {
  none: 0,
  "10m": 10,
  "30m": 30,
  "1h": 60,
  "1d": 24 * 60,
};

const repeatStepMs: Record<Exclude<ArrangementReminderRepeat, "none">, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
};

export function getActionableReminderInfos(
  arrangements: ArrangementItem[],
  now: Date
) {
  return arrangements
    .filter((arrangement) => arrangement.status === "active")
    .map((arrangement) => getArrangementReminderInfo(arrangement, now))
    .filter((info) => info.kind === "ready")
    .sort((left, right) => (left.triggerAt ?? 0) - (right.triggerAt ?? 0));
}

export function getArrangementReminderInfo(
  arrangement: ArrangementItem,
  now: Date
): ArrangementReminderInfo {
  if (!hasArrangementReminderConfigured(arrangement)) {
    return { arrangement, kind: "none" };
  }

  const repeat = arrangement.reminderRepeat ?? "none";
  const baseTarget = getBaseReminderTarget(arrangement, now);

  if (!baseTarget || arrangement.status === "completed") {
    return { arrangement, kind: "none" };
  }

  if (arrangement.reminderState === "handled" && repeat === "none") {
    return { arrangement, kind: "handled", targetAt: baseTarget.getTime() };
  }

  const target = getNextReminderTarget(baseTarget, repeat, arrangement.reminderLastHandledAt);
  const triggerAt = target.getTime() - getLeadMinutes(arrangement.reminderLead) * 60 * 1000;
  const snoozedUntil = arrangement.reminderSnoozedUntil;

  if (arrangement.reminderState === "snoozed" && snoozedUntil && snoozedUntil > now.getTime()) {
    return {
      arrangement,
      kind: "snoozed",
      targetAt: target.getTime(),
      triggerAt,
      snoozedUntil,
    };
  }

  return {
    arrangement,
    kind: now.getTime() >= triggerAt ? "ready" : "upcoming",
    targetAt: target.getTime(),
    triggerAt,
  };
}

export function getReminderLeadMinutes(lead: ArrangementReminderLead = "none") {
  return leadMinutes[lead] ?? 0;
}

export function hasArrangementReminderConfigured(arrangement: ArrangementItem) {
  return Boolean(
      arrangement.timeKind === "reminder" ||
      arrangement.reminderText?.trim() ||
      (arrangement.reminderLead && arrangement.reminderLead !== "none") ||
      (arrangement.reminderRepeat && arrangement.reminderRepeat !== "none")
  );
}

export function formatReminderTime(value: number | undefined, locale: string) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value);
  } catch {
    return new Date(value).toLocaleString();
  }
}

function getBaseReminderTarget(arrangement: ArrangementItem, now: Date) {
  const text = getReminderBasisText(arrangement);
  if (!text) return null;

  const dateKey =
    resolveArrangementDateKey(
      { ...arrangement, timeKind: "reminder", reminderText: text, timeText: text },
      now
    ) || (parseTimeOfDay(text) ? formatDateKey(now) : "");
  if (!dateKey) return null;

  const timeOfDay = parseTimeOfDay(text) ?? getDefaultTimeOfDay(text);
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, timeOfDay.hour, timeOfDay.minute);
}

function getReminderBasisText(arrangement: ArrangementItem) {
  const kind = getArrangementTimeKind(arrangement);
  if (kind === "reminder") {
    return arrangement.reminderText || arrangement.timeText;
  }
  return arrangement.reminderText || arrangement.timeText;
}

function getNextReminderTarget(
  baseTarget: Date,
  repeat: ArrangementReminderRepeat,
  lastHandledAt: number | undefined
) {
  if (repeat === "none" || !lastHandledAt) return baseTarget;

  const stepMs = repeatStepMs[repeat];
  let targetAt = baseTarget.getTime();
  while (targetAt <= lastHandledAt) {
    targetAt += stepMs;
  }
  return new Date(targetAt);
}

function getLeadMinutes(lead: ArrangementReminderLead | undefined) {
  return leadMinutes[lead ?? "none"] ?? 0;
}

function parseTimeOfDay(text: string) {
  const numericTime = /(\d{1,2})(?::|：|点|時|时)(\d{1,2})?/.exec(text);
  if (numericTime) {
    return normalizeHourMinute(
      Number(numericTime[1]),
      Number(numericTime[2] ?? 0),
      text
    );
  }

  const chineseHour = /([凌晨早上午下午晚上中午]*)?([一二两三四五六七八九十]{1,3})点/.exec(text);
  if (!chineseHour) return null;

  return normalizeHourMinute(chineseNumberToHour(chineseHour[2]), 0, text);
}

function normalizeHourMinute(hour: number, minute: number, text: string) {
  let normalizedHour = Number.isFinite(hour) ? Math.max(0, Math.min(23, hour)) : 9;
  const normalizedMinute = Number.isFinite(minute) ? Math.max(0, Math.min(59, minute)) : 0;

  if (/下午|晚上|今晚/.test(text) && normalizedHour < 12) {
    normalizedHour += 12;
  }
  if (/中午/.test(text) && normalizedHour < 11) {
    normalizedHour += 12;
  }

  return { hour: normalizedHour, minute: normalizedMinute };
}

function getDefaultTimeOfDay(text: string) {
  if (/凌晨/.test(text)) return { hour: 6, minute: 0 };
  if (/上午|早上|早晨/.test(text)) return { hour: 9, minute: 0 };
  if (/中午/.test(text)) return { hour: 12, minute: 0 };
  if (/下午/.test(text)) return { hour: 15, minute: 0 };
  if (/晚上|今晚/.test(text)) return { hour: 19, minute: 0 };
  return { hour: 9, minute: 0 };
}

function chineseNumberToHour(value: string) {
  const digits: Record<string, number> = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };
  if (value === "十") return 10;
  if (value.startsWith("十")) return 10 + (digits[value[1]] ?? 0);
  if (value.endsWith("十")) return (digits[value[0]] ?? 1) * 10;
  if (value.includes("十")) {
    return (digits[value[0]] ?? 1) * 10 + (digits[value[2]] ?? 0);
  }
  return digits[value] ?? 9;
}
