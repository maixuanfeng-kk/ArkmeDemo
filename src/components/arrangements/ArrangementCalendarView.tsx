import React from "react";
import ArrangementCalendarListItem from "@/components/arrangements/ArrangementCalendarListItem";
import {
  buildCalendarDays,
  formatCalendarDateLabel,
  formatMonthLabel,
  getMonthOffset,
  getUnscheduledArrangements,
} from "@/components/arrangements/arrangementTime";
import { CalendarIcon } from "@/components/arrangements/icons";
import type { ArrangementItem } from "@/data/arrangements";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementCalendarView({
  arrangements,
  locale,
  month,
  selectedDateKey,
  today,
  onMonthChange,
  onOpen,
  onSelectDate,
}: {
  arrangements: ArrangementItem[];
  locale: string;
  month: Date;
  selectedDateKey: string;
  today: Date;
  onMonthChange: (month: Date) => void;
  onOpen: (arrangement: ArrangementItem) => void;
  onSelectDate: (dateKey: string) => void;
}) {
  const { t } = usePreferences();
  const days = React.useMemo(
    () => buildCalendarDays({ arrangements, month, today }),
    [arrangements, month, today]
  );
  const selectedDay = days.find((day) => day.key === selectedDateKey);
  const selectedArrangements = selectedDay?.arrangements ?? [];
  const unscheduledArrangements = React.useMemo(
    () => getUnscheduledArrangements(arrangements, today),
    [arrangements, today]
  );

  return (
    <div className="mt-4 space-y-3">
      <section className="rounded-[20px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,248,246,0.92)_100%)] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="h-9 rounded-[14px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.78)] px-3 text-[13px] font-semibold text-text-muted transition active:scale-[0.98]"
            onClick={() => onMonthChange(getMonthOffset(month, -1))}
          >
            {t("arrangements.calendar.prev")}
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[rgba(9,184,62,0.1)] text-primary">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <h2 className="truncate text-[18px] font-semibold leading-5 text-text">
              {formatMonthLabel(month, locale)}
            </h2>
          </div>
          <button
            type="button"
            className="h-9 rounded-[14px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.78)] px-3 text-[13px] font-semibold text-text-muted transition active:scale-[0.98]"
            onClick={() => onMonthChange(getMonthOffset(month, 1))}
          >
            {t("arrangements.calendar.next")}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] leading-4 text-text-tertiary">
          {getWeekdayLabels(locale).map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day) => (
            <button
              key={day.key}
              type="button"
              className={cn(
                "flex aspect-square min-h-[38px] flex-col items-center justify-center rounded-[8px] border text-[12px] transition active:scale-[0.97]",
                day.key === selectedDateKey
                  ? "border-primary/15 bg-[rgba(9,184,62,0.1)] text-primary shadow-[0_8px_18px_rgba(9,184,62,0.08)]"
                  : "border-transparent bg-[rgba(255,255,255,0.82)] text-text",
                !day.inMonth && "opacity-35",
                day.isToday && day.key !== selectedDateKey && "border-primary/20"
              )}
              onClick={() => onSelectDate(day.key)}
            >
              <span className="font-semibold leading-4">{day.date.getDate()}</span>
              {day.arrangements.length > 0 && (
                <span className="mt-0.5 h-1.5 min-w-[6px] rounded-full bg-primary px-1 text-[0px]">
                  {day.arrangements.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[20px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.88)] px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold leading-5 text-text">
              {selectedDay
                ? formatCalendarDateLabel(selectedDay.date, locale)
                : t("arrangements.calendar.selectedDay")}
            </h3>
            <p className="mt-0.5 text-[12px] leading-5 text-text-muted">
              {selectedArrangements.length}
              {t("arrangements.itemUnit")}
            </p>
          </div>
        </div>

        {selectedArrangements.length > 0 ? (
          <div className="mt-3 space-y-2">
            {selectedArrangements.map((arrangement) => (
              <ArrangementCalendarListItem
                key={arrangement.id}
                arrangement={arrangement}
                onOpen={() => onOpen(arrangement)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-[16px] bg-[rgba(43,43,43,0.035)] px-3 py-3 text-[13px] leading-5 text-text-muted">
            {t("arrangements.calendar.emptyDay")}
          </p>
        )}
      </section>

      {unscheduledArrangements.length > 0 && (
        <section className="rounded-[20px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.88)] px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
          <h3 className="text-[16px] font-semibold leading-5 text-text">
            {t("arrangements.calendar.unscheduled")}
          </h3>
          <div className="mt-3 space-y-2">
            {unscheduledArrangements.map((arrangement) => (
              <ArrangementCalendarListItem
                key={arrangement.id}
                arrangement={arrangement}
                onOpen={() => onOpen(arrangement)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function getWeekdayLabels(locale: string) {
  const baseDate = new Date("2026-02-01T00:00:00");
  return Array.from({ length: 7 }, (_, index) => {
    try {
      return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + index)
      );
    } catch {
      return ["日", "一", "二", "三", "四", "五", "六"][index];
    }
  });
}
