import { NoteIcon } from "@/components/arrangements/icons";
import {
  formatReminderTime,
  getArrangementReminderInfo,
  hasArrangementReminderConfigured,
} from "@/components/arrangements/arrangementReminder";
import type { ArrangementItem } from "@/data/arrangements";
import { getArrangementTitleParts } from "@/data/arrangementTitleMerge";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementActionList({
  arrangement,
  locale,
}: {
  arrangement: ArrangementItem;
  locale: string;
}) {
  const { t } = usePreferences();
  const parts = getArrangementTitleParts(arrangement.title);
  const reminderLine = getActionReminderLine(arrangement, locale, t);
  if (parts.length <= 1) return null;

  return (
    <section className="rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.78)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(9,184,62,0.1)] text-primary">
          <NoteIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium leading-4 text-primary">
            {t("arrangements.field.actionList")}
          </p>
          <ol className="mt-3 space-y-2">
            {parts.map((part, index) => (
              <li key={part} className="flex gap-2">
                <span className="shrink-0 text-[13px] font-semibold leading-5 text-primary">
                  {index + 1}.
                </span>
                <span className="min-w-0">
                  <span className="block break-words text-[15px] font-semibold leading-5 text-text">
                    {part}
                  </span>
                  <span className="mt-1 block text-[12px] leading-4 text-text-muted">
                    {reminderLine}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function getActionReminderLine(
  arrangement: ArrangementItem,
  locale: string,
  t: (key: string) => string
) {
  if (!hasArrangementReminderConfigured(arrangement)) {
    return t("arrangements.reminder.actionLine.none");
  }

  const info = getArrangementReminderInfo(arrangement, new Date());
  if (info.kind === "ready") return t("arrangements.reminder.actionLine.ready");
  if (info.kind === "handled") return t("arrangements.reminder.actionLine.handled");
  if (info.kind === "snoozed") {
    return `${t("arrangements.reminder.actionLine.snoozed")} ${formatReminderTime(
      info.snoozedUntil,
      locale
    )}`;
  }

  const nextTime = formatReminderTime(info.triggerAt, locale);
  return nextTime
    ? `${t("arrangements.reminder.actionLine.upcoming")} ${nextTime}`
    : t("arrangements.reminder.actionLine.none");
}
