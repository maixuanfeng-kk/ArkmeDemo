import { demoSenderIdentityId } from "@/data/testConversations";
import type { RecordItem } from "@/types/record";

export function canRecognizeRecordAsArrangement(record: RecordItem) {
  const source = record.sourceConversation;
  if (!source) return false;
  if (source.type === "self") return true;

  return (
    source.type === "test" &&
    Boolean(source.identityId) &&
    source.identityId !== demoSenderIdentityId
  );
}

export function isGroupArrangementSource(record: RecordItem) {
  const source = record.sourceConversation;
  return (
    source?.type === "test" &&
    Boolean(source.conversationId) &&
    !source.conversationId?.startsWith("private:")
  );
}

export function getArrangementSourceLabel(record: RecordItem, fallback: string) {
  const source = record.sourceConversation;
  if (!source) return fallback;
  if (isGroupArrangementSource(record) && source.participantLabel) {
    return `${source.label} · ${source.participantLabel}`;
  }
  return source.label || fallback;
}
