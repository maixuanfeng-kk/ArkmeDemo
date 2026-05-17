import {
  findMergeTargetForDraft as findMergeTargetFromList,
  mergeArrangement,
} from "@/data/arrangementMerge";
import {
  collectPersonTextFromSources,
  mergePersonText,
} from "@/data/arrangementFieldMerge";
import {
  resolveArrangementTitle,
} from "@/data/arrangementTitleMerge";
import {
  createRelatedSource,
  getArrangementRelatedSources,
  normalizeRelatedSources,
} from "@/data/arrangementSources";

export type ArrangementStatus = "active" | "later" | "completed";
export type ArrangementSourceType = "manual_text" | "self" | "test";
export type ArrangementTimeKind = "due" | "range" | "reminder";
export type ArrangementReminderLead = "none" | "10m" | "30m" | "1h" | "1d";
export type ArrangementReminderRepeat = "none" | "daily" | "weekly";
export type ArrangementReminderState = "idle" | "snoozed" | "handled";

export type ArrangementDraft = {
  title: string;
  timeKind?: ArrangementTimeKind;
  timeText: string;
  endTimeText?: string;
  reminderText?: string;
  reminderLead?: ArrangementReminderLead;
  reminderRepeat?: ArrangementReminderRepeat;
  personText: string;
  placeText: string;
  note: string;
};

export type ArrangementCreationMetadata = {
  sourceText: string;
  recognitionReason: string;
  recognitionConfidence: number;
  sourceType?: ArrangementSourceType;
  sourceLabel?: string;
  sourceRecordUid?: string;
  sourceSentAt?: number;
  mergeTargetId?: string;
  mergeTargetTitle?: string;
};

export type ArrangementRelatedSource = {
  id: string;
  sourceText: string;
  sourceType?: ArrangementSourceType;
  sourceLabel?: string;
  sourceRecordUid?: string;
  sourceSentAt?: number;
  recognitionReason?: string;
  recognitionConfidence?: number;
  addedAt: number;
};

export type ArrangementItem = ArrangementDraft & {
  id: string;
  status: ArrangementStatus;
  createdBy?: "manual" | "ai";
  sourceText?: string;
  sourceType?: ArrangementSourceType;
  sourceLabel?: string;
  sourceRecordUid?: string;
  sourceSentAt?: number;
  recognitionReason?: string;
  recognitionConfidence?: number;
  relatedSources?: ArrangementRelatedSource[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  laterAt?: number;
  reminderState?: ArrangementReminderState;
  reminderSnoozedUntil?: number;
  reminderLastHandledAt?: number;
};

export { getArrangementRelatedSources };

const arrangementsStorageKey = "arkme-demo.arrangements";
const arrangementOpenTargetStorageKey = "arkme-demo.arrangements.openTargetId";
const seedCreatedAt = new Date("2026-05-16T08:30:00+08:00").getTime();

const seedArrangements: ArrangementItem[] = [
  {
    id: "demo-arrangement-1",
    title: "明天下午三点去医院复查",
    timeKind: "range",
    timeText: "明天下午 3:00",
    endTimeText: "明天下午 4:00",
    reminderText: "明天下午 2:30",
    personText: "我",
    placeText: "市中心医院",
    note: "带上上次的检查报告。",
    status: "active",
    createdAt: seedCreatedAt,
    updatedAt: seedCreatedAt,
  },
  {
    id: "demo-arrangement-2",
    title: "给妈妈买药",
    timeKind: "due",
    timeText: "周五",
    reminderText: "周五上午",
    personText: "妈妈",
    placeText: "附近药店",
    note: "",
    status: "active",
    createdAt: seedCreatedAt + 1000 * 60,
    updatedAt: seedCreatedAt + 1000 * 60,
  },
  {
    id: "demo-arrangement-3",
    title: "整理项目提交清单",
    timeKind: "reminder",
    timeText: "这周末",
    reminderText: "周六上午",
    personText: "",
    placeText: "",
    note: "先确认 README、验证命令和提交链接。",
    status: "later",
    createdAt: seedCreatedAt + 1000 * 60 * 2,
    updatedAt: seedCreatedAt + 1000 * 60 * 2,
    laterAt: seedCreatedAt + 1000 * 60 * 2,
  },
];

function isArrangementStatus(value: unknown): value is ArrangementStatus {
  return value === "active" || value === "later" || value === "completed";
}

function isArrangementSourceType(value: unknown): value is ArrangementSourceType {
  return value === "manual_text" || value === "self" || value === "test";
}

function isArrangementTimeKind(value: unknown): value is ArrangementTimeKind {
  return value === "due" || value === "range" || value === "reminder";
}

function isArrangementReminderLead(value: unknown): value is ArrangementReminderLead {
  return value === "none" || value === "10m" || value === "30m" || value === "1h" || value === "1d";
}

function isArrangementReminderRepeat(value: unknown): value is ArrangementReminderRepeat {
  return value === "none" || value === "daily" || value === "weekly";
}

function isArrangementReminderState(value: unknown): value is ArrangementReminderState {
  return value === "idle" || value === "snoozed" || value === "handled";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeOptionalTimestamp(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeOptionalConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value));
}

function normalizeArrangement(value: unknown): ArrangementItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<ArrangementItem>;
  if (typeof item.id !== "string" || typeof item.title !== "string") return null;
  if (!item.id.trim() || !item.title.trim()) return null;

  const now = Date.now();
  const status = isArrangementStatus(item.status) ? item.status : "active";

  return normalizeArrangementContent({
    id: item.id,
    title: item.title,
    timeKind: isArrangementTimeKind(item.timeKind) ? item.timeKind : "due",
    timeText: normalizeString(item.timeText),
    endTimeText: normalizeString(item.endTimeText),
    reminderText: normalizeString(item.reminderText),
    reminderLead: isArrangementReminderLead(item.reminderLead)
      ? item.reminderLead
      : "none",
    reminderRepeat: isArrangementReminderRepeat(item.reminderRepeat)
      ? item.reminderRepeat
      : "none",
    personText: normalizeString(item.personText),
    placeText: normalizeString(item.placeText),
    note: normalizeString(item.note),
    status,
    createdBy: item.createdBy === "ai" ? "ai" : "manual",
    sourceText: normalizeString(item.sourceText),
    sourceType: isArrangementSourceType(item.sourceType)
      ? item.sourceType
      : undefined,
    sourceLabel: normalizeString(item.sourceLabel),
    sourceRecordUid: normalizeString(item.sourceRecordUid),
    sourceSentAt: normalizeOptionalTimestamp(item.sourceSentAt),
    recognitionReason: normalizeString(item.recognitionReason),
    recognitionConfidence: normalizeOptionalConfidence(item.recognitionConfidence),
    relatedSources: normalizeRelatedSources(item),
    createdAt: normalizeTimestamp(item.createdAt, now),
    updatedAt: normalizeTimestamp(item.updatedAt, now),
    completedAt: normalizeOptionalTimestamp(item.completedAt),
    laterAt: normalizeOptionalTimestamp(item.laterAt),
    reminderState: isArrangementReminderState(item.reminderState)
      ? item.reminderState
      : "idle",
    reminderSnoozedUntil: normalizeOptionalTimestamp(item.reminderSnoozedUntil),
    reminderLastHandledAt: normalizeOptionalTimestamp(item.reminderLastHandledAt),
  });
}

function normalizeArrangementContent(item: ArrangementItem): ArrangementItem {
  const arrangement = normalizeDemoArrangement(item);
  const sources = [
    {
      sourceText: arrangement.sourceText,
      sourceLabel: arrangement.sourceLabel,
      recognitionReason: arrangement.recognitionReason,
    },
    ...(arrangement.relatedSources ?? []),
  ];
  const sourcePersonText = collectPersonTextFromSources(sources);
  const title = resolveArrangementTitle({
    currentTitle: arrangement.title,
    noteText: arrangement.note,
    sources,
  });
  const personText = mergePersonText(arrangement.personText, sourcePersonText);

  if (title === arrangement.title && personText === arrangement.personText) {
    return arrangement;
  }

  return {
    ...arrangement,
    title,
    personText,
  };
}

function normalizeDemoArrangement(item: ArrangementItem): ArrangementItem {
  if (item.id !== "demo-arrangement-2") return item;

  if (item.title === "给妈妈买药" && item.timeText === "周五下班后") {
    return { ...item, timeText: "周五" };
  }
  if (item.title !== "周五给妈妈买药") return item;

  return {
    ...item,
    title: "给妈妈买药",
    timeKind: item.timeKind ?? "due",
    timeText: item.timeText || "周五",
    personText: item.personText || "妈妈",
  };
}
export function createArrangementId() {
  return `arrangement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createArrangementFromDraft(
  draft: ArrangementDraft,
  metadata?: ArrangementCreationMetadata
): ArrangementItem | null {
  const title = resolveArrangementTitle({
    currentTitle: draft.title.trim(),
    noteText: draft.note,
    sources: metadata
      ? [
          {
            sourceText: metadata.sourceText,
            sourceLabel: metadata.sourceLabel,
          },
        ]
      : [],
  });
  if (!title) return null;

  const timestamp = Date.now();
  const relatedSource = metadata
    ? createRelatedSource(metadata, timestamp)
    : undefined;

  return {
    id: createArrangementId(),
    title,
    timeKind: isArrangementTimeKind(draft.timeKind) ? draft.timeKind : "due",
    timeText: draft.timeText.trim(),
    endTimeText: draft.endTimeText?.trim() ?? "",
    reminderText: draft.reminderText?.trim() ?? "",
    reminderLead: isArrangementReminderLead(draft.reminderLead)
      ? draft.reminderLead
      : "none",
    reminderRepeat: isArrangementReminderRepeat(draft.reminderRepeat)
      ? draft.reminderRepeat
      : "none",
    personText: draft.personText.trim(),
    placeText: draft.placeText.trim(),
    note: draft.note.trim(),
    status: "active",
    createdBy: metadata ? "ai" : "manual",
    sourceText: metadata?.sourceText.trim(),
    sourceType: metadata?.sourceType,
    sourceLabel: metadata?.sourceLabel?.trim(),
    sourceRecordUid: metadata?.sourceRecordUid?.trim(),
    sourceSentAt: metadata?.sourceSentAt,
    recognitionReason: metadata?.recognitionReason.trim(),
    recognitionConfidence: metadata?.recognitionConfidence,
    relatedSources: relatedSource ? [relatedSource] : undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    reminderState: "idle",
  };
}

export function getInitialArrangements(): ArrangementItem[] {
  if (typeof window === "undefined") return seedArrangements;

  try {
    const storedValue = window.localStorage.getItem(arrangementsStorageKey);
    if (!storedValue) return seedArrangements;

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return seedArrangements;

    const arrangements = parsedValue
      .map(normalizeArrangement)
      .filter((item): item is ArrangementItem => Boolean(item));

    return arrangements.length > 0 ? arrangements : seedArrangements;
  } catch {
    return seedArrangements;
  }
}

export function getArrangementById(id: string) {
  const targetId = id.trim();
  if (!targetId) return null;
  return getInitialArrangements().find((item) => item.id === targetId) ?? null;
}

export function findArrangementBySourceRecordUid(recordUid: string) {
  const sourceRecordUid = recordUid.trim();
  if (!sourceRecordUid) return null;

  return (
    getInitialArrangements().find((item) =>
      hasSourceRecordUid(item, sourceRecordUid)
    ) ?? null
  );
}

export function findMergeTargetForDraft(
  draft: ArrangementDraft,
  metadata?: ArrangementCreationMetadata,
  arrangements: ArrangementItem[] = getInitialArrangements()
) {
  return findMergeTargetFromList(draft, metadata, arrangements);
}

export function setArrangementOpenTargetId(id: string) {
  const targetId = id.trim();
  if (!targetId || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(arrangementOpenTargetStorageKey, targetId);
  } catch {
    // Navigation still works; only the detail auto-open is skipped.
  }
}

export function consumeArrangementOpenTargetId() {
  if (typeof window === "undefined") return null;

  try {
    const targetId = window.localStorage
      .getItem(arrangementOpenTargetStorageKey)
      ?.trim();
    window.localStorage.removeItem(arrangementOpenTargetStorageKey);
    return targetId || null;
  } catch {
    return null;
  }
}

export function persistArrangements(arrangements: ArrangementItem[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(arrangementsStorageKey, JSON.stringify(arrangements));
  } catch {
    // Keep the in-memory state when storage is unavailable.
  }
}

export function upsertArrangementFromDraft(
  arrangements: ArrangementItem[],
  draft: ArrangementDraft,
  metadata?: ArrangementCreationMetadata
) {
  const arrangement = createArrangementFromDraft(draft, metadata);
  if (!arrangement) return { arrangement: null, arrangements };

  const mergeTarget = findMergeTargetFromList(draft, metadata, arrangements);
  if (!mergeTarget) {
    return { arrangement, arrangements: [arrangement, ...arrangements] };
  }

  const mergedArrangement = mergeArrangement(
    mergeTarget,
    draft,
    metadata,
    normalizeArrangementContent
  );
  return {
    arrangement: mergedArrangement,
    arrangements: [
      mergedArrangement,
      ...arrangements.filter((item) => item.id !== mergeTarget.id),
    ],
  };
}

export function createAndPersistArrangement(
  draft: ArrangementDraft,
  metadata?: ArrangementCreationMetadata
) {
  const result = upsertArrangementFromDraft(
    getInitialArrangements(),
    draft,
    metadata
  );
  if (!result.arrangement) return null;

  persistArrangements(result.arrangements);
  return result.arrangement;
}

function hasSourceRecordUid(item: ArrangementItem, sourceRecordUid: string) {
  return (
    item.sourceRecordUid === sourceRecordUid ||
    item.relatedSources?.some(
      (source) => source.sourceRecordUid === sourceRecordUid
    )
  );
}
