import React from "react";
import ArrangementConfirmDialog from "@/components/arrangements/ArrangementConfirmDialog";
import ArrangementActionList from "@/components/arrangements/ArrangementActionList";
import ArrangementAiMetadataRows from "@/components/arrangements/ArrangementAiMetadataRows";
import ArrangementDetailActions from "@/components/arrangements/ArrangementDetailActions";
import ArrangementDetailHero from "@/components/arrangements/ArrangementDetailHero";
import ArrangementDetailRow from "@/components/arrangements/ArrangementDetailRow";
import ArrangementReminderRows from "@/components/arrangements/ArrangementReminderRows";
import { getArrangementTimeKind } from "@/components/arrangements/arrangementTime";
import {
  CalendarIcon,
  ClockIcon,
  NoteIcon,
  PinIcon,
  UserIcon,
  XIcon,
} from "@/components/arrangements/icons";
import { formatTimestamp } from "@/components/arrangements/ui";
import type { ArrangementPendingAction } from "@/components/arrangements/types";
import {
  getArrangementRelatedSources,
  type ArrangementItem,
  type ArrangementStatus,
} from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementDetailSheet({
  arrangement,
  locale,
  onClose,
  onDelete,
  onMove,
}: {
  arrangement: ArrangementItem;
  locale: string;
  onClose: () => void;
  onDelete: (arrangement: ArrangementItem) => void;
  onMove: (arrangement: ArrangementItem, status: ArrangementStatus) => void;
}) {
  const { t } = usePreferences();
  const relatedSourceCount = getArrangementRelatedSources(arrangement).length;
  const timeKind = getArrangementTimeKind(arrangement);
  const [pendingAction, setPendingAction] =
    React.useState<ArrangementPendingAction | null>(null);

  const confirmAction = () => {
    if (!pendingAction) return;

    const action = pendingAction;
    setPendingAction(null);
    if (action.type === "delete") {
      onDelete(arrangement);
      return;
    }

    onMove(arrangement, action.status);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-overlay-light"
        onClick={onClose}
        aria-label={t("arrangements.closeDetail")}
      />
      <section className="relative max-h-[88%] overflow-y-auto rounded-t-[28px] bg-[linear-gradient(180deg,#f7f6f2_0%,#f6f6f6_100%)] px-4 pb-5 pt-4 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <ArrangementDetailHero
              arrangement={arrangement}
              locale={locale}
              relatedSourceCount={relatedSourceCount}
            />
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[rgba(43,43,43,0.06)] bg-[rgba(255,255,255,0.76)] text-text-muted transition active:scale-[0.96]"
            onClick={onClose}
            aria-label={t("arrangements.closeDetail")}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <ArrangementActionList arrangement={arrangement} locale={locale} />
          <ArrangementDetailRow
            icon={<ClockIcon className="h-4 w-4" />}
            label={t("arrangements.field.timeKind")}
            value={t(`arrangements.timeKind.${timeKind}`)}
            tone="time"
          />
          {timeKind === "range" ? (
            <>
              <ArrangementDetailRow
                icon={<ClockIcon className="h-4 w-4" />}
                label={t("arrangements.field.startTime")}
                value={arrangement.timeText || t("arrangements.emptyField")}
                tone="time"
              />
              <ArrangementDetailRow
                icon={<ClockIcon className="h-4 w-4" />}
                label={t("arrangements.field.endTime")}
                value={arrangement.endTimeText || t("arrangements.emptyField")}
                tone="time"
              />
            </>
          ) : (
            <ArrangementDetailRow
              icon={<ClockIcon className="h-4 w-4" />}
              label={
                timeKind === "reminder"
                  ? t("arrangements.field.reminderTime")
                  : t("arrangements.field.deadlineTime")
              }
              value={
                timeKind === "reminder"
                  ? arrangement.reminderText || arrangement.timeText || t("arrangements.emptyField")
                  : arrangement.timeText || t("arrangements.emptyField")
              }
              tone="time"
            />
          )}
          <ArrangementReminderRows arrangement={arrangement} locale={locale} />
          <ArrangementDetailRow
            icon={<UserIcon className="h-4 w-4" />}
            label={t("arrangements.field.person")}
            value={arrangement.personText || t("arrangements.emptyField")}
            tone="person"
          />
          <ArrangementDetailRow
            icon={<PinIcon className="h-4 w-4" />}
            label={t("arrangements.field.place")}
            value={arrangement.placeText || t("arrangements.emptyField")}
          />
          <ArrangementDetailRow
            icon={<NoteIcon className="h-4 w-4" />}
            label={t("arrangements.field.note")}
            value={arrangement.note || t("arrangements.emptyField")}
          />
          <ArrangementAiMetadataRows arrangement={arrangement} />
          <ArrangementDetailRow
            icon={<CalendarIcon className="h-4 w-4" />}
            label={t("arrangements.createdAt")}
            value={formatTimestamp(arrangement.createdAt, locale)}
          />
        </div>

        <ArrangementDetailActions
          arrangement={arrangement}
          onDeleteRequest={() => setPendingAction({ type: "delete" })}
          onStatusRequest={(status) => setPendingAction({ type: "status", status })}
        />
      </section>

      {pendingAction && (
        <ArrangementConfirmDialog
          pendingAction={pendingAction}
          onCancel={() => setPendingAction(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}
