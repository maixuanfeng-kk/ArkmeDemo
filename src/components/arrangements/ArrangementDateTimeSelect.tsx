import React from "react";
import {
  buildDateOptions,
  formatDateValue,
  parseDateTimeValue,
  timeOptions,
} from "@/components/arrangements/arrangementDateTimeOptions";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementDateTimeSelect({
  compact = false,
  defaultTime,
  label,
  value,
  onChange,
}: {
  compact?: boolean;
  defaultTime: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { resolvedLocale, t } = usePreferences();
  const dateOptions = React.useMemo(
    () => buildDateOptions(new Date(), resolvedLocale, t),
    [resolvedLocale, t]
  );
  const selected = parseDateTimeValue(value);
  const selectedDate = dateOptions.some((option) => option.value === selected.date)
    ? selected.date
    : "";
  const selectedTime = timeOptions.some((option) => option === selected.time)
    ? selected.time
    : "";
  const unmatchedValue =
    value.trim() && (!selectedDate || (selected.time && !selectedTime))
      ? value.trim()
      : "";

  const updateValue = (date: string, time: string) => {
    if (!date) {
      onChange("");
      return;
    }
    onChange(time ? `${date} ${time}` : date);
  };

  return (
    <div>
      <span className="text-[13px] font-medium leading-5 text-primary">
        {label}
      </span>
      {unmatchedValue && (
        <p className="mt-1 rounded-[8px] bg-primary-soft px-2.5 py-1.5 text-[12px] leading-5 text-primary">
          {t("arrangements.timeSelect.recognized")}：{unmatchedValue}
        </p>
      )}
      <div className="mt-1 grid grid-cols-[1.25fr_0.75fr] gap-2">
        <ChoiceSelect
          ariaLabel={`${label}${t("arrangements.timeSelect.date")}`}
          compact={compact}
          value={selectedDate}
          onChange={(nextDate) =>
            updateValue(nextDate, selectedTime || (nextDate ? defaultTime : ""))
          }
        >
          <option value="">{t("arrangements.timeSelect.none")}</option>
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ChoiceSelect>
        <ChoiceSelect
          ariaLabel={`${label}${t("arrangements.timeSelect.time")}`}
          compact={compact}
          value={selectedTime}
          onChange={(nextTime) =>
            updateValue(selectedDate || formatDateValue(new Date()), nextTime)
          }
        >
          <option value="">{t("arrangements.timeSelect.noTime")}</option>
          {timeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </ChoiceSelect>
      </div>
    </div>
  );
}
function ChoiceSelect({
  ariaLabel,
  children,
  compact,
  value,
  onChange,
}: {
  ariaLabel: string;
  children: React.ReactNode;
  compact: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "w-full appearance-none rounded-[8px] border border-primary/20 bg-primary-soft/40 px-2 text-text outline-none transition focus:border-primary focus:bg-input-bg-focus",
        compact ? "h-9 text-[12px]" : "h-11 text-[14px]"
      )}
    >
      {children}
    </select>
  );
}
