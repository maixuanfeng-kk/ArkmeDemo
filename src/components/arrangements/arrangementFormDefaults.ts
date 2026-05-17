import type { ArrangementFormState } from "@/components/arrangements/types";

export const emptyArrangementForm: ArrangementFormState = {
  title: "",
  timeKind: "due",
  timeText: "",
  endTimeText: "",
  reminderText: "",
  reminderLead: "none",
  reminderRepeat: "none",
  personText: "",
  placeText: "",
  note: "",
};
