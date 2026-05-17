import type {
  ArrangementCreationMetadata,
  ArrangementDraft,
  ArrangementReminderLead,
  ArrangementReminderRepeat,
  ArrangementStatus,
  ArrangementTimeKind,
} from "@/data/arrangements";

export type ArrangementFilter = ArrangementStatus;

export type ArrangementPendingAction =
  | { type: "status"; status: ArrangementStatus }
  | { type: "delete" };

export type ArrangementFormState = ArrangementDraft;
export type ArrangementViewMode = "list" | "calendar";
export type { ArrangementReminderLead, ArrangementReminderRepeat, ArrangementTimeKind };

export type ArrangementAiMetadata = ArrangementCreationMetadata;

export type ArrangementInfoTone = "default" | "time" | "person";
