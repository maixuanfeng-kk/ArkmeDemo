import type {
  ArrangementAiMetadata,
  ArrangementFormState,
} from "@/components/arrangements/types";
import { findMergeTargetForDraft } from "@/data/arrangements";
import type { recognizeArrangementText } from "@/services/arrangementRecognition";

type RecognizedResult = Awaited<ReturnType<typeof recognizeArrangementText>>;

export function toArrangementForm(result: RecognizedResult): ArrangementFormState {
  return {
    title: result.title,
    timeKind: result.timeKind,
    timeText: result.timeText,
    endTimeText: result.endTimeText,
    reminderText: result.reminderText,
    reminderLead: result.reminderLead,
    reminderRepeat: result.reminderRepeat,
    personText: result.personText,
    placeText: result.placeText,
    note: result.note,
  };
}

export function toArrangementMetadata(result: RecognizedResult): ArrangementAiMetadata {
  return {
    sourceText: result.sourceText,
    recognitionReason: result.reason,
    recognitionConfidence: result.confidence,
    sourceType: "manual_text",
  };
}

export function withMergePreview(
  form: ArrangementFormState,
  metadata: ArrangementAiMetadata
): ArrangementAiMetadata {
  const mergeTarget = findMergeTargetForDraft(form, metadata);
  if (!mergeTarget) return metadata;

  return {
    ...metadata,
    mergeTargetId: mergeTarget.id,
    mergeTargetTitle: mergeTarget.title,
  };
}

export function formatRecognitionError(
  error: unknown,
  fallback: string,
  networkError: string
) {
  if (!(error instanceof Error) || !error.message) return fallback;
  if (error.message === "Failed to fetch") return networkError;
  if (error.message.includes("NetworkError")) return networkError;
  if (error.message.includes("CORS")) return networkError;
  return error.message;
}
