export function getCurrentDate() {
  return new Date();
}

export function getMonthDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function formatTodayLabel(date: Date, locale: string) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = formatWeekday(date, locale);
  return `${year}.${month}.${day}${weekday}`;
}

function formatWeekday(date: Date, locale: string) {
  const chineseWeekdays = ["日", "一", "二", "三", "四", "五", "六"];
  if (locale.startsWith("zh-TW")) {
    return `（週${chineseWeekdays[date.getDay()]}）`;
  }
  if (locale.startsWith("zh")) {
    return `（周${chineseWeekdays[date.getDay()]}）`;
  }

  try {
    const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
    return ` (${weekday})`;
  } catch {
    return "";
  }
}
