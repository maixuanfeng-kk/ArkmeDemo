import React from "react";
import type { ArrangementFilter } from "@/components/arrangements/types";
import type { ArrangementItem } from "@/data/arrangements";

export function useArrangementReminderActions({
  setActiveFilter,
  setArrangements,
  setSelectedId,
}: {
  setActiveFilter: React.Dispatch<React.SetStateAction<ArrangementFilter>>;
  setArrangements: React.Dispatch<React.SetStateAction<ArrangementItem[]>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const openReminderArrangement = React.useCallback(
    (arrangement: ArrangementItem) => {
      setActiveFilter(arrangement.status);
      setSelectedId(arrangement.id);
    },
    [setActiveFilter, setSelectedId]
  );

  const snoozeArrangementReminder = React.useCallback(
    (arrangement: ArrangementItem) => {
      const timestamp = Date.now();
      setArrangements((current) =>
        current.map((item) =>
          item.id === arrangement.id
            ? {
                ...item,
                reminderState: "snoozed",
                reminderSnoozedUntil: timestamp + 30 * 60 * 1000,
                updatedAt: timestamp,
              }
            : item
        )
      );
    },
    [setArrangements]
  );

  const handleArrangementReminder = React.useCallback(
    (arrangement: ArrangementItem) => {
      const timestamp = Date.now();
      setArrangements((current) =>
        current.map((item) =>
          item.id === arrangement.id
            ? {
                ...item,
                reminderState: "handled",
                reminderLastHandledAt: timestamp,
                reminderSnoozedUntil: undefined,
                updatedAt: timestamp,
              }
            : item
        )
      );
    },
    [setArrangements]
  );

  return {
    handleArrangementReminder,
    openReminderArrangement,
    snoozeArrangementReminder,
  };
}
