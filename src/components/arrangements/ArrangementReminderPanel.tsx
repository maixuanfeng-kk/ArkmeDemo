import type React from "react";
import {
  formatReminderTime,
  type ArrangementReminderInfo,
} from "@/components/arrangements/arrangementReminder";
import { ClockIcon } from "@/components/arrangements/icons";
import type { ArrangementItem } from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementReminderPanel({
  infos,
  locale,
  onComplete,
  onHandled,
  onLater,
  onOpen,
  onSnooze,
}: {
  infos: ArrangementReminderInfo[];
  locale: string;
  onComplete: (arrangement: ArrangementItem) => void;
  onHandled: (arrangement: ArrangementItem) => void;
  onLater: (arrangement: ArrangementItem) => void;
  onOpen: (arrangement: ArrangementItem) => void;
  onSnooze: (arrangement: ArrangementItem) => void;
}) {
  const { t } = usePreferences();
  if (infos.length === 0) return null;

  return (
    <section className="mt-4 rounded-[20px] border border-[rgba(43,43,43,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(246,250,246,0.92)_100%)] px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[rgba(9,184,62,0.1)] text-primary">
          <ClockIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-semibold leading-5 text-text">
              {t("arrangements.reminder.panelTitle")}
            </h2>
            <span className="shrink-0 rounded-full border border-primary/12 bg-[rgba(9,184,62,0.08)] px-2.5 py-1 text-[11px] font-semibold leading-4 text-primary">
              {infos.length}
              {t("arrangements.itemUnit")}
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-text-muted">
            {t("arrangements.reminder.panelDesc")}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {infos.map((info) => (
          <ReminderPanelItem
            key={info.arrangement.id}
            info={info}
            locale={locale}
            onComplete={onComplete}
            onHandled={onHandled}
            onLater={onLater}
            onOpen={onOpen}
            onSnooze={onSnooze}
          />
        ))}
      </div>
    </section>
  );
}

function ReminderPanelItem({
  info,
  locale,
  onComplete,
  onHandled,
  onLater,
  onOpen,
  onSnooze,
}: {
  info: ArrangementReminderInfo;
  locale: string;
  onComplete: (arrangement: ArrangementItem) => void;
  onHandled: (arrangement: ArrangementItem) => void;
  onLater: (arrangement: ArrangementItem) => void;
  onOpen: (arrangement: ArrangementItem) => void;
  onSnooze: (arrangement: ArrangementItem) => void;
}) {
  const { t } = usePreferences();
  const arrangement = info.arrangement;
  const reminderTime = formatReminderTime(info.triggerAt, locale);

  return (
    <div className="rounded-[18px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.78)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <p className="text-[11px] font-medium leading-4 text-text-tertiary">
        {reminderTime
          ? `${t("arrangements.reminder.readyAt")} ${reminderTime}`
          : t("arrangements.reminder.ready")}
      </p>
      <p className="mt-2 break-words text-[16px] font-semibold leading-6 text-text">
        {arrangement.title}
      </p>
      <div className="mt-2 space-y-1.5">
        <button
          type="button"
          className="h-10 w-full rounded-[14px] border border-primary/14 bg-[rgba(9,184,62,0.08)] text-[13px] font-semibold text-primary transition active:scale-[0.98]"
          onClick={() => onOpen(arrangement)}
        >
          {t("arrangements.reminder.action.open")}
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          <ReminderActionButton onClick={() => onSnooze(arrangement)}>
            {t("arrangements.reminder.action.snooze")}
          </ReminderActionButton>
          <ReminderActionButton onClick={() => onHandled(arrangement)}>
            {t("arrangements.reminder.action.handled")}
          </ReminderActionButton>
          <ReminderActionButton onClick={() => onComplete(arrangement)}>
            {t("arrangements.reminder.action.complete")}
          </ReminderActionButton>
          <ReminderActionButton onClick={() => onLater(arrangement)}>
            {t("arrangements.reminder.action.later")}
          </ReminderActionButton>
        </div>
      </div>
    </div>
  );
}

function ReminderActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="h-9 rounded-[12px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.7)] text-[12px] font-semibold text-text-muted transition active:scale-[0.98]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
