import {
  createRelatedSource,
  dedupeRelatedSources,
  getArrangementRelatedSources,
} from "@/data/arrangementSources";
import { mergePersonText } from "@/data/arrangementFieldMerge";
import { mergeTitleText } from "@/data/arrangementTitleMerge";
import { getSharedDistinctiveTermScore } from "@/data/arrangementMergeKeywords";
import type {
  ArrangementCreationMetadata,
  ArrangementDraft,
  ArrangementItem,
} from "@/data/arrangements";

type ArrangementRelatedSource = NonNullable<ArrangementItem["relatedSources"]>[number];

export function findMergeTargetForDraft(
  draft: ArrangementDraft,
  metadata: ArrangementCreationMetadata | undefined,
  arrangements: ArrangementItem[]
) {
  const sourceRecordUid = metadata?.sourceRecordUid?.trim();
  if (sourceRecordUid) {
    const existingSourceArrangement = arrangements.find((item) =>
      hasSourceRecordUid(item, sourceRecordUid)
    );
    if (existingSourceArrangement) return existingSourceArrangement;
  }

  return findBestMergeTarget(draft, metadata, arrangements);
}

export function mergeArrangement(
  target: ArrangementItem,
  draft: ArrangementDraft,
  metadata: ArrangementCreationMetadata | undefined,
  normalizeArrangementContent: (item: ArrangementItem) => ArrangementItem
) {
  const timestamp = Date.now();
  const newSource = metadata
    ? createRelatedSource(metadata, timestamp)
    : createManualDraftSource(draft, timestamp);
  const existingSources = getArrangementRelatedSources(target);
  const relatedSources = dedupeRelatedSources([
    ...(existingSources.length
      ? existingSources
      : [createOriginalArrangementSource(target)]),
    ...(newSource ? [newSource] : []),
  ]);

  return normalizeArrangementContent({
    ...target,
    title: mergeTitleText(target.title, draft.title),
    timeKind: mergeTimeKind(target, draft),
    timeText: target.timeText || draft.timeText.trim(),
    endTimeText: target.endTimeText || draft.endTimeText?.trim() || "",
    reminderText: target.reminderText || draft.reminderText?.trim() || "",
    reminderLead: mergeReminderChoice(target.reminderLead, draft.reminderLead),
    reminderRepeat: mergeReminderChoice(target.reminderRepeat, draft.reminderRepeat),
    personText: mergePersonText(target.personText, draft.personText),
    placeText: target.placeText || draft.placeText.trim(),
    note: mergeNotes(target.note, draft.note),
    sourceText: relatedSources[0]?.sourceText ?? target.sourceText,
    sourceType: relatedSources[0]?.sourceType ?? target.sourceType,
    sourceLabel: relatedSources[0]?.sourceLabel ?? target.sourceLabel,
    sourceRecordUid: relatedSources[0]?.sourceRecordUid ?? target.sourceRecordUid,
    sourceSentAt: relatedSources[0]?.sourceSentAt ?? target.sourceSentAt,
    recognitionReason:
      relatedSources.at(-1)?.recognitionReason ?? target.recognitionReason,
    recognitionConfidence:
      relatedSources.at(-1)?.recognitionConfidence ?? target.recognitionConfidence,
    relatedSources,
    updatedAt: timestamp,
  });
}

function createOriginalArrangementSource(arrangement: ArrangementItem): ArrangementRelatedSource {
  const sourceText = [arrangement.title, arrangement.note]
    .filter((value) => value.trim())
    .join("\n");

  return {
    id: `arrangement:${arrangement.id}`,
    sourceText,
    sourceType: arrangement.createdBy === "ai" ? arrangement.sourceType : undefined,
    sourceLabel: arrangement.sourceLabel || "原安排",
    sourceRecordUid: arrangement.sourceRecordUid,
    sourceSentAt: arrangement.sourceSentAt ?? arrangement.createdAt,
    recognitionReason: arrangement.recognitionReason || "已有安排",
    recognitionConfidence: arrangement.recognitionConfidence,
    addedAt: arrangement.createdAt,
  };
}

function createManualDraftSource(draft: ArrangementDraft, timestamp: number): ArrangementRelatedSource | undefined {
  const sourceText = [
    draft.title.trim(),
    draft.timeKind?.trim() ? `时间类型：${draft.timeKind.trim()}` : "",
    draft.timeText.trim() ? `时间：${draft.timeText.trim()}` : "",
    draft.endTimeText?.trim() ? `结束：${draft.endTimeText.trim()}` : "",
    draft.reminderText?.trim() ? `提醒：${draft.reminderText.trim()}` : "",
    draft.reminderLead && draft.reminderLead !== "none"
      ? `提前提醒：${draft.reminderLead}`
      : "",
    draft.reminderRepeat && draft.reminderRepeat !== "none"
      ? `循环提醒：${draft.reminderRepeat}`
      : "",
    draft.personText.trim() ? `相关人：${draft.personText.trim()}` : "",
    draft.placeText.trim() ? `地点：${draft.placeText.trim()}` : "",
    draft.note.trim() ? `补充：${draft.note.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (!sourceText) return undefined;

  return {
    id: `manual:${normalizeMergeText(sourceText).slice(0, 28)}:${timestamp}`,
    sourceText,
    sourceType: "manual_text",
    sourceLabel: "手动创建",
    sourceSentAt: timestamp,
    recognitionReason: "手动创建时与已有安排主题一致",
    addedAt: timestamp,
  };
}

function hasSourceRecordUid(item: ArrangementItem, sourceRecordUid: string) {
  return (
    item.sourceRecordUid === sourceRecordUid ||
    item.relatedSources?.some(
      (source) => source.sourceRecordUid === sourceRecordUid
    )
  );
}

function findBestMergeTarget(draft: ArrangementDraft, metadata: ArrangementCreationMetadata | undefined, arrangements: ArrangementItem[]) {
  const scoredItems = arrangements
    .map((item) => ({
      item,
      score: getMergeScore(item, draft, metadata),
    }))
    .filter(({ score }) => score >= 6)
    .sort((a, b) => b.score - a.score || b.item.updatedAt - a.item.updatedAt);

  return scoredItems[0]?.item ?? null;
}

function getMergeScore(
  item: ArrangementItem,
  draft: ArrangementDraft,
  metadata: ArrangementCreationMetadata | undefined
) {
  const existingText = buildMergeText(item);
  const existingKeywordText = buildKeywordText(item);
  const incomingText = buildMergeText({
    ...draft,
    sourceText: metadata?.sourceText ?? "",
  });
  const incomingKeywordText = buildKeywordText({
    ...draft,
    sourceText: metadata?.sourceText ?? "",
  });
  if (!existingText || !incomingText) return 0;
  if (existingText === incomingText) return 10;

  let score = 0;
  const sharedAnchors = getSharedAnchors(existingText, incomingText);
  const existingPerson = normalizeMergeText(item.personText);
  const incomingPerson = normalizeMergeText(draft.personText);
  const hasAction = hasSharedAction(existingText, incomingText);

  if (titlesAreSimilar(item.title, draft.title)) score += 7;
  if (sharedAnchors.length > 0) score += 6 + sharedAnchors.length;
  score += getSharedDistinctiveTermScore(
    existingKeywordText,
    incomingKeywordText,
    hasAction
  );
  if (
    existingPerson &&
    incomingPerson &&
    existingPerson === incomingPerson &&
    existingPerson !== "我"
  ) {
    score += hasAction ? 5 : 2;
  }
  if (item.placeText && draft.placeText && item.placeText === draft.placeText) {
    score += 3;
  }

  return score;
}

function buildMergeText(
  value: Pick<
    ArrangementDraft,
    "title" | "timeText" | "personText" | "placeText" | "note"
  > &
    Partial<Pick<ArrangementItem, "endTimeText" | "reminderText" | "sourceText">>
) {
  return normalizeMergeText(
    [
      value.title,
      value.timeText,
      value.endTimeText,
      value.reminderText,
      value.personText,
      value.placeText,
      value.note,
      value.sourceText,
    ].join(" ")
  );
}

function normalizeMergeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:\s"'`~～（）()[\]【】]/g, "")
    .replace(/(今天|明天|后天|上午|下午|晚上|中午|周一|周二|周三|周四|周五|周六|周日)/g, "");
}

function buildKeywordText(
  value: Pick<
    ArrangementDraft,
    "title" | "timeText" | "personText" | "placeText" | "note"
  > &
    Partial<Pick<ArrangementItem, "endTimeText" | "reminderText" | "sourceText">>
) {
  return [
    value.title,
    value.timeText,
    value.endTimeText,
    value.reminderText,
    value.personText,
    value.placeText,
    value.note,
    value.sourceText,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[，。！？、；：,.!?;:"'`~～（）()[\]【】]/g, " ")
    .replace(/(今天|明天|后天|上午|下午|晚上|中午|周一|周二|周三|周四|周五|周六|周日)/g, " ");
}

function titlesAreSimilar(left: string, right: string) {
  const leftText = normalizeMergeText(left);
  const rightText = normalizeMergeText(right);
  if (!leftText || !rightText) return false;
  return (
    leftText === rightText ||
    (leftText.length >= 4 && rightText.includes(leftText)) ||
    (rightText.length >= 4 && leftText.includes(rightText))
  );
}

function getSharedAnchors(left: string, right: string) {
  return strongMergeAnchors.filter(
    (anchor) => left.includes(anchor) && right.includes(anchor)
  );
}

function hasSharedAction(left: string, right: string) {
  return actionMergeAnchors.some(
    (anchor) => left.includes(anchor) && right.includes(anchor)
  );
}

const strongMergeAnchors = [
  "医院",
  "复查",
  "体检",
  "挂号",
  "牙科",
  "买药",
  "早餐",
  "github",
  "演示",
];

const actionMergeAnchors = ["带", "买", "整理", "提交", "复查", "去", "玩", "打"];

function mergeNotes(current: string, incoming: string) {
  const nextText = incoming.trim();
  if (!nextText) return current;
  if (!current.trim()) return nextText;
  if (normalizeMergeText(current).includes(normalizeMergeText(nextText))) {
    return current;
  }
  return `${current.trim()}\n${nextText}`;
}

function mergeTimeKind(target: ArrangementItem, draft: ArrangementDraft) {
  const incomingKind = draft.timeKind;
  if (target.timeKind && target.timeKind !== "due") return target.timeKind;
  return incomingKind ?? target.timeKind ?? "due";
}

function mergeReminderChoice<T extends string>(
  current: T | undefined,
  incoming: T | undefined
) {
  return current && current !== "none" ? current : incoming ?? current ?? "none";
}
