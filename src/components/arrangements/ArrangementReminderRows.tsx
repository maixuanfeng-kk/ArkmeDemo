import ArrangementDetailRow from "@/components/arrangements/ArrangementDetailRow";
import {
  formatReminderTime,
  getArrangementReminderInfo,
  hasArrangementReminderConfigured,
  type ArrangementReminderInfo,
} from "@/components/arrangements/arrangementReminder";
import { ClockIcon } from "@/components/arrangements/icons";
import type { ArrangementItem } from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementReminderRows({
  arrangement,
  locale,
}: {
  arrangement: ArrangementItem;
  locale: string;
}) {
  const { t } = usePreferences();
  const lead = arrangement.reminderLead ?? "none";
  const repeat = arrangement.reminderRepeat ?? "none";
  const info = getArrangementReminderInfo(arrangement, new Date());
  const settingText = getReminderSettingText(arrangement, lead, repeat, t);

  if (!hasArrangementReminderConfigured(arrangement)) {
    return null;
  }

  return (
    <>
      {settingText && (
        <ArrangementDetailRow
          icon={<ClockIcon className="h-4 w-4" />}
          label={t("arrangements.field.reminderSetting")}
          value={settingText}
          tone="time"
        />
      )}
      {info.kind !== "none" && (
        <ArrangementDetailRow
          icon={<ClockIcon className="h-4 w-4" />}
          label={t("arrangements.field.reminderState")}
          value={getReminderStateText(info, locale, t)}
          tone="time"
        />
      )}
    </>
  );
}

function getReminderSettingText(
  arrangement: ArrangementItem,
  lead: string,
  repeat: string,
  t: (key: string) => string
) {
  const hasLeadOrRepeat = lead !== "none" || repeat !== "none";
  const basisText =
    arrangement.reminderText ||
    (hasLeadOrRepeat ? arrangement.timeText : "");

  return [
    arrangement.timeKind === "reminder" && !hasLeadOrRepeat ? "" : basisText,
    lead !== "none" ? t(`arrangements.reminder.lead.${lead}`) : "",
    repeat !== "none" ? t(`arrangements.reminder.repeat.${repeat}`) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function getReminderStateText(
  info: ArrangementReminderInfo,
  locale: string,
  t: (key: string) => string
) {
  if (info.kind === "ready") return t("arrangements.reminder.state.ready");
  if (info.kind === "handled") return t("arrangements.reminder.state.handled");
  if (info.kind === "snoozed") {
    return `${t("arrangements.reminder.state.snoozed")} ${formatReminderTime(
      info.snoozedUntil,
      locale
    )}`;
  }
  if (info.kind === "upcoming") {
    return `${t("arrangements.reminder.state.upcoming")} ${formatReminderTime(
      info.triggerAt,
      locale
    )}`;
  }
  return t("arrangements.reminder.state.none");
}
