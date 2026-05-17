import React from "react";
import ArrangementAiSheet from "@/components/arrangements/ArrangementAiSheet";
import ArrangementCalendarView from "@/components/arrangements/ArrangementCalendarView";
import ArrangementCard from "@/components/arrangements/ArrangementCard";
import ArrangementConfirmDialog from "@/components/arrangements/ArrangementConfirmDialog";
import ArrangementCreateSheet from "@/components/arrangements/ArrangementCreateSheet";
import ArrangementDetailSheet from "@/components/arrangements/ArrangementDetailSheet";
import ArrangementEmptyState from "@/components/arrangements/ArrangementEmptyState";
import ArrangementHeader from "@/components/arrangements/ArrangementHeader";
import ArrangementReminderPanel from "@/components/arrangements/ArrangementReminderPanel";
import ArrangementViewSwitch from "@/components/arrangements/ArrangementViewSwitch";
import { formatTodayLabel, getCurrentDate, getMonthDate } from "@/components/arrangements/arrangementDateLabel";
import { emptyArrangementForm } from "@/components/arrangements/arrangementFormDefaults";
import { getActionableReminderInfos } from "@/components/arrangements/arrangementReminder";
import { formatDateKey } from "@/components/arrangements/arrangementTime";
import { useArrangementReminderActions } from "@/components/arrangements/useArrangementReminderActions";
import type {
  ArrangementAiMetadata,
  ArrangementFilter,
  ArrangementFormState,
  ArrangementViewMode,
} from "@/components/arrangements/types";
import {
  consumeArrangementOpenTargetId,
  getInitialArrangements,
  persistArrangements,
  upsertArrangementFromDraft,
  type ArrangementItem,
  type ArrangementStatus,
} from "@/data/arrangements";
import { usePreferences } from "@/settings/preferences";

export default function Arrangements() {
  const { resolvedLocale, t } = usePreferences();
  const [arrangements, setArrangements] = React.useState(getInitialArrangements);
  const [today, setToday] = React.useState(getCurrentDate);
  const [activeFilter, setActiveFilter] =
    React.useState<ArrangementFilter>("active");
  const [viewMode, setViewMode] = React.useState<ArrangementViewMode>("list");
  const [calendarMonth, setCalendarMonth] = React.useState(() => getMonthDate(new Date()));
  const [selectedDateKey, setSelectedDateKey] = React.useState(() => formatDateKey(new Date()));
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = React.useState(false);
  const [showAiSheet, setShowAiSheet] = React.useState(false);
  const [form, setForm] = React.useState<ArrangementFormState>(emptyArrangementForm);
  const [formError, setFormError] = React.useState("");
  const [pendingReminderStatus, setPendingReminderStatus] =
    React.useState<{ arrangement: ArrangementItem; status: ArrangementStatus } | null>(null);

  React.useEffect(() => {
    persistArrangements(arrangements);
  }, [arrangements]);

  React.useEffect(() => {
    const refreshToday = () => setToday(getCurrentDate());
    const intervalId = window.setInterval(refreshToday, 1000);

    window.addEventListener("focus", refreshToday);
    document.addEventListener("visibilitychange", refreshToday);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshToday);
      document.removeEventListener("visibilitychange", refreshToday);
    };
  }, []);

  const selectedArrangement =
    arrangements.find((item) => item.id === selectedId) ?? null;

  React.useEffect(() => {
    const targetId = consumeArrangementOpenTargetId();
    if (!targetId) return;

    const targetArrangement = arrangements.find((item) => item.id === targetId);
    if (!targetArrangement) return;

    setActiveFilter(targetArrangement.status);
    setSelectedId(targetArrangement.id);
  }, [arrangements]);

  React.useEffect(() => {
    if (selectedId && !selectedArrangement) {
      setSelectedId(null);
    }
  }, [selectedArrangement, selectedId]);

  const counts = React.useMemo(
    () => ({
      active: arrangements.filter((item) => item.status === "active").length,
      later: arrangements.filter((item) => item.status === "later").length,
      completed: arrangements.filter((item) => item.status === "completed").length,
    }),
    [arrangements]
  );

  const visibleArrangements = React.useMemo(
    () =>
      arrangements
        .filter((item) => item.status === activeFilter)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [activeFilter, arrangements]
  );

  const todayLabel = formatTodayLabel(today, resolvedLocale);
  const readyReminderInfos = React.useMemo(
    () => getActionableReminderInfos(arrangements, today),
    [arrangements, today]
  );
  const reminderActions = useArrangementReminderActions({
    setActiveFilter,
    setArrangements,
    setSelectedId,
  });

  const resetForm = () => {
    setForm(emptyArrangementForm);
    setFormError("");
  };

  const closeCreateSheet = () => {
    setShowCreateSheet(false);
    resetForm();
  };

  const updateForm = (key: keyof ArrangementFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (formError) setFormError("");
  };

  const createArrangementFromForm = (
    sourceForm: ArrangementFormState,
    metadata?: ArrangementAiMetadata
  ) => {
    const title = sourceForm.title.trim();
    if (!title) {
      setFormError(t("arrangements.titleRequired"));
      return null;
    }

    const result = upsertArrangementFromDraft(arrangements, sourceForm, metadata);
    if (!result.arrangement) return null;

    setArrangements(result.arrangements);
    setActiveFilter(result.arrangement.status);
    setSelectedId(result.arrangement.id);
    return result.arrangement;
  };

  const createArrangement = () => {
    if (createArrangementFromForm(form)) {
      closeCreateSheet();
    }
  };

  const createAiArrangement = (
    aiForm: ArrangementFormState,
    metadata: ArrangementAiMetadata
  ) => {
    createArrangementFromForm(aiForm, metadata);
  };

  const moveArrangementToStatus = (
    arrangement: ArrangementItem,
    status: ArrangementStatus
  ) => {
    const timestamp = Date.now();
    setArrangements((current) =>
      current.map((item) =>
        item.id === arrangement.id
          ? {
              ...item,
              status,
              updatedAt: timestamp,
              completedAt: status === "completed" ? timestamp : undefined,
              laterAt: status === "later" ? timestamp : undefined,
              reminderState: status === "completed" ? "handled" : "idle",
              reminderLastHandledAt:
                status === "completed" ? timestamp : item.reminderLastHandledAt,
              reminderSnoozedUntil: undefined,
            }
          : item
      )
    );
    setActiveFilter(status);
  };

  const deleteArrangement = (arrangement: ArrangementItem) => {
    setArrangements((current) =>
      current.filter((item) => item.id !== arrangement.id)
    );
    setSelectedId(null);
  };

  const changeCalendarMonth = (nextMonth: Date) => {
    setCalendarMonth(nextMonth);
    setSelectedDateKey(formatDateKey(nextMonth));
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[linear-gradient(180deg,#f4f3ef_0%,#f7f6f2_32%,#f6f6f6_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(9,184,62,0.08),transparent_66%)]" />
      <ArrangementHeader
        activeFilter={activeFilter}
        counts={counts}
        todayLabel={todayLabel}
        onAiOpen={() => setShowAiSheet(true)}
        onCreate={() => setShowCreateSheet(true)}
        onFilterChange={setActiveFilter}
      />

      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5">
        <ArrangementReminderPanel
          infos={readyReminderInfos}
          locale={resolvedLocale}
          onComplete={(arrangement) =>
            setPendingReminderStatus({ arrangement, status: "completed" })
          }
          onHandled={reminderActions.handleArrangementReminder}
          onLater={(arrangement) =>
            setPendingReminderStatus({ arrangement, status: "later" })
          }
          onOpen={reminderActions.openReminderArrangement}
          onSnooze={reminderActions.snoozeArrangementReminder}
        />

        <div className="mt-4">
          <ArrangementViewSwitch viewMode={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "calendar" ? (
          <ArrangementCalendarView
            arrangements={visibleArrangements}
            locale={resolvedLocale}
            month={calendarMonth}
            selectedDateKey={selectedDateKey}
            today={today}
            onMonthChange={changeCalendarMonth}
            onOpen={(arrangement) => setSelectedId(arrangement.id)}
            onSelectDate={setSelectedDateKey}
          />
        ) : visibleArrangements.length > 0 ? (
          <div className="mt-3 space-y-2">
            {visibleArrangements.map((arrangement) => (
              <ArrangementCard
                key={arrangement.id}
                arrangement={arrangement}
                locale={resolvedLocale}
                onOpen={() => setSelectedId(arrangement.id)}
              />
            ))}
          </div>
        ) : (
          <ArrangementEmptyState
            filter={activeFilter}
            onCreate={() => setShowCreateSheet(true)}
          />
        )}
      </div>

      {showCreateSheet && (
        <ArrangementCreateSheet
          form={form}
          error={formError}
          onChange={updateForm}
          onClose={closeCreateSheet}
          onSubmit={createArrangement}
        />
      )}

      {showAiSheet && (
        <ArrangementAiSheet
          locale={resolvedLocale}
          onClose={() => setShowAiSheet(false)}
          onCreate={createAiArrangement}
        />
      )}

      {selectedArrangement && (
        <ArrangementDetailSheet
          arrangement={selectedArrangement}
          locale={resolvedLocale}
          onClose={() => setSelectedId(null)}
          onDelete={deleteArrangement}
          onMove={moveArrangementToStatus}
        />
      )}

      {pendingReminderStatus && (
        <ArrangementConfirmDialog
          pendingAction={{ type: "status", status: pendingReminderStatus.status }}
          onCancel={() => setPendingReminderStatus(null)}
          onConfirm={() => {
            moveArrangementToStatus(
              pendingReminderStatus.arrangement,
              pendingReminderStatus.status
            );
            setPendingReminderStatus(null);
          }}
        />
      )}
    </div>
  );
}
