export type DateOption = {
  label: string;
  value: string;
};

const dateOptionCount = 30;

export const timeOptions = buildTimeOptions();

export function buildDateOptions(
  today: Date,
  locale: string,
  t: (key: string) => string
): DateOption[] {
  return Array.from({ length: dateOptionCount }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + index
    );
    return {
      value: formatDateValue(date),
      label: formatDateLabel(date, index, locale, t),
    };
  });
}

export function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function parseDateTimeValue(value: string) {
  const match =
    /(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/.exec(value);
  if (!match) return { date: "", time: "" };

  return {
    date: `${match[1]}.${match[2].padStart(2, "0")}.${match[3].padStart(2, "0")}`,
    time: match[4] ? `${match[4].padStart(2, "0")}:${match[5]}` : "",
  };
}

function formatDateLabel(
  date: Date,
  offset: number,
  locale: string,
  t: (key: string) => string
) {
  const dateText = new Intl.DateTimeFormat(locale, {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);
  if (offset === 0) return `${t("arrangements.timeSelect.today")} ${dateText}`;
  if (offset === 1) return `${t("arrangements.timeSelect.tomorrow")} ${dateText}`;
  return dateText;
}

function buildTimeOptions() {
  const options: string[] = [];
  for (let hour = 7; hour <= 22; hour += 1) {
    options.push(`${String(hour).padStart(2, "0")}:00`);
    options.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return options;
}
