import type {
  ArrangementItem,
  ArrangementTimeKind,
} from "@/data/arrangements";

export type CalendarDay = {
  key: string;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  arrangements: ArrangementItem[];
};

export function getArrangementTimeKind(
  arrangement: Pick<ArrangementItem, "timeKind">
): ArrangementTimeKind {
  return arrangement.timeKind ?? "due";
}

export function getArrangementTimeSummary(
  arrangement: ArrangementItem,
  t: (key: string) => string
) {
  const kind = getArrangementTimeKind(arrangement);
  const reminderText = arrangement.reminderText?.trim() ?? "";

  if (kind === "range") {
    const startText = arrangement.timeText.trim();
    const endText = arrangement.endTimeText?.trim() ?? "";
    const rangeText = [startText, endText].filter(Boolean).join(" - ");
    return withOptionalReminder(
      `${t("arrangements.timeKind.range")}：${
        rangeText || t("arrangements.emptyField")
      }`,
      reminderText,
      t
    );
  }

  if (kind === "reminder") {
    return `${t("arrangements.timeKind.reminder")}：${
      reminderText || arrangement.timeText.trim() || t("arrangements.emptyField")
    }`;
  }

  return withOptionalReminder(
    `${t("arrangements.timeKind.due")}：${
      arrangement.timeText.trim() || t("arrangements.emptyField")
    }`,
    reminderText,
    t
  );
}

export function buildCalendarDays({
  arrangements,
  month,
  today,
}: {
  arrangements: ArrangementItem[];
  month: Date;
  today: Date;
}) {
  const byDate = groupArrangementsByDate(arrangements, today);
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDate = addDays(firstDay, -firstDay.getDay());
  const todayKey = formatDateKey(today);

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = addDays(startDate, index);
    const key = formatDateKey(date);
    return {
      key,
      date,
      inMonth: date.getMonth() === month.getMonth(),
      isToday: key === todayKey,
      arrangements: byDate.get(key) ?? [],
    };
  });
}

export function getUnscheduledArrangements(
  arrangements: ArrangementItem[],
  today: Date
) {
  return arrangements.filter((arrangement) => !resolveArrangementDateKey(arrangement, today));
}

export function resolveArrangementDateKey(
  arrangement: ArrangementItem,
  today: Date
) {
  const kind = getArrangementTimeKind(arrangement);
  const text =
    kind === "reminder"
      ? arrangement.reminderText || arrangement.timeText
      : arrangement.timeText || arrangement.reminderText || "";

  return parseDateText(text, today);
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthLabel(date: Date, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
}

export function formatCalendarDateLabel(date: Date, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  } catch {
    return formatDateKey(date);
  }
}

export function getMonthOffset(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function withOptionalReminder(
  mainText: string,
  reminderText: string,
  t: (key: string) => string
) {
  return reminderText
    ? `${mainText} · ${t("arrangements.timeKind.reminder")}：${reminderText}`
    : mainText;
}

function groupArrangementsByDate(arrangements: ArrangementItem[], today: Date) {
  const map = new Map<string, ArrangementItem[]>();
  arrangements.forEach((arrangement) => {
    const key = resolveArrangementDateKey(arrangement, today);
    if (!key) return;
    map.set(key, [...(map.get(key) ?? []), arrangement]);
  });
  return map;
}

function parseDateText(value: string, today: Date) {
  const text = value.trim();
  if (!text) return "";

  const exactDate = parseExactDate(text, today);
  if (exactDate) return formatDateKey(exactDate);
  if (/今天|今晚|today/i.test(text)) return formatDateKey(today);
  if (/明天|明晚|tomorrow/i.test(text)) return formatDateKey(addDays(today, 1));
  if (/后天|後天/.test(text)) return formatDateKey(addDays(today, 2));
  if (/下周末|下週末/.test(text)) return formatDateKey(nextWeekday(today, 6, 7));
  if (/这周末|這週末|本周末|本週末/.test(text)) {
    return formatDateKey(nextWeekday(today, 6, 0));
  }

  const weekday = getChineseWeekday(text);
  return weekday === null ? "" : formatDateKey(nextWeekday(today, weekday, 1));
}

function parseExactDate(text: string, today: Date) {
  const fullDateMatch = /(\d{4})[./年-](\d{1,2})[./月-](\d{1,2})/.exec(text);
  if (fullDateMatch) {
    return buildDate(fullDateMatch[1], fullDateMatch[2], fullDateMatch[3]);
  }

  const monthDayMatch = /(\d{1,2})月(\d{1,2})日?/.exec(text);
  if (!monthDayMatch) return null;

  let date = buildDate(
    String(today.getFullYear()),
    monthDayMatch[1],
    monthDayMatch[2]
  );
  if (date.getTime() < startOfDay(today).getTime()) {
    date = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  }
  return date;
}

function buildDate(year: string, month: string, day: string) {
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function getChineseWeekday(text: string) {
  const match = /(?:周|週|星期)([一二三四五六日天])/.exec(text);
  if (!match) return null;

  const index = "日一二三四五六".indexOf(match[1] === "天" ? "日" : match[1]);
  return index >= 0 ? index : null;
}

function nextWeekday(today: Date, weekday: number, minimumDaysAhead: number) {
  const delta = (weekday - today.getDay() + 7) % 7;
  const daysAhead = delta < minimumDaysAhead ? delta + 7 : delta;
  return addDays(today, daysAhead);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
