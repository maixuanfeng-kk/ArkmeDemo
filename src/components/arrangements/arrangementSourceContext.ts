import { demoSenderIdentityId } from "@/data/testConversations";
import type { RecordItem } from "@/types/record";

const maxContextRecords = 8;
const maxGapMs = 2 * 60 * 60 * 1000;

export type ArrangementSourceContext = {
  input: string;
  previewText: string;
  sourceText: string;
  contextCount: number;
  hasContext: boolean;
};

export function buildArrangementSourceContext({
  record,
  records,
  sourceLabel,
}: {
  record: RecordItem;
  records: RecordItem[];
  sourceLabel: string;
}): ArrangementSourceContext {
  const contextRecords = getRecentConversationRecords(record, records);
  const sourceText = formatContextRecords(contextRecords, record.uid, sourceLabel);
  const hasContext = contextRecords.length > 1;

  if (!hasContext) {
    return {
      input: getSingleRecordInput(record, sourceLabel),
      previewText: record.text_content,
      sourceText: record.text_content,
      contextCount: 1,
      hasContext: false,
    };
  }

  return {
    input: `${getContextHeader(record, sourceLabel)}
连续对话上下文（按时间从早到晚；带“当前选择”的一行是用户点击识别的消息）：
${sourceText}`,
    previewText: sourceText,
    sourceText,
    contextCount: contextRecords.length,
    hasContext: true,
  };
}

function getRecentConversationRecords(record: RecordItem, records: RecordItem[]) {
  const candidates = ensureRecordIncluded(record, records)
    .filter((item) => isSameConversation(record, item) && item.send_at <= record.send_at)
    .sort(compareRecords);
  const selectedIndex = candidates.findIndex((item) => item.uid === record.uid);
  if (selectedIndex < 0) return [record];

  const selectedSegment = candidates.slice(0, selectedIndex + 1);
  return takeContinuousTail(selectedSegment);
}

function ensureRecordIncluded(record: RecordItem, records: RecordItem[]) {
  return records.some((item) => item.uid === record.uid) ? records : [...records, record];
}

function takeContinuousTail(records: RecordItem[]) {
  const tail: RecordItem[] = [];
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const candidate = records[index];
    const newer = tail[0];
    if (newer && newer.send_at - candidate.send_at > maxGapMs) break;

    tail.unshift(candidate);
    if (tail.length >= maxContextRecords) break;
  }
  return tail;
}

function isSameConversation(a: RecordItem, b: RecordItem) {
  const sourceA = a.sourceConversation;
  const sourceB = b.sourceConversation;
  if (sourceA?.type === "self" && sourceB?.type === "self") return true;
  if (sourceA?.type !== "test" || sourceB?.type !== "test") return a.uid === b.uid;

  return Boolean(sourceA.conversationId) && sourceA.conversationId === sourceB.conversationId;
}

function compareRecords(a: RecordItem, b: RecordItem) {
  if (a.send_at !== b.send_at) return a.send_at - b.send_at;
  return a.uid.localeCompare(b.uid);
}

function formatContextRecords(
  records: RecordItem[],
  selectedUid: string,
  sourceLabel: string
) {
  return records
    .map((record) => {
      const selectedMark = record.uid === selectedUid ? "（当前选择）" : "";
      return `${getSpeakerLabel(record, sourceLabel)}${selectedMark}：${record.text_content}`;
    })
    .join("\n");
}

function getSpeakerLabel(record: RecordItem, fallback: string) {
  const source = record.sourceConversation;
  if (source?.type === "self") return "我";
  if (source?.type !== "test") return source?.label || fallback;
  if (source.identityId === demoSenderIdentityId) return "我";

  return source.participantLabel || source.label || fallback;
}

function getContextHeader(record: RecordItem, sourceLabel: string) {
  const source = record.sourceConversation;
  if (source?.type !== "test") return "来源：发给自己";

  if (source.conversationId && !source.conversationId.startsWith("private:")) {
    return `来源：群聊 ${source.label}\n当前消息发送人：${
      source.participantLabel || sourceLabel
    }`;
  }

  return `来源：私聊 ${sourceLabel}`;
}

function getSingleRecordInput(record: RecordItem, sourceLabel: string) {
  const source = record.sourceConversation;
  if (source?.type !== "test") return record.text_content;

  if (source.conversationId && !source.conversationId.startsWith("private:")) {
    const sender = source.participantLabel || sourceLabel;
    return `群聊：${source.label}\n发送人：${sender}\n群消息：${record.text_content}`;
  }

  return `私聊对象：${sourceLabel}\n对方消息：${record.text_content}`;
}
