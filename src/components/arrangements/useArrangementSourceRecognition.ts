import React from "react";
import {
  formatRecognitionError,
  toArrangementForm,
  toArrangementMetadata,
  withMergePreview,
} from "@/components/arrangements/arrangementAiSheetUtils";
import { buildArrangementSourceContext } from "@/components/arrangements/arrangementSourceContext";
import type { ArrangementAiMetadata, ArrangementFormState } from "@/components/arrangements/types";
import {
  createAndPersistArrangement,
  type ArrangementItem,
} from "@/data/arrangements";
import {
  getInitialArrangementAiSettings,
  hasCompleteArrangementAiSettings,
} from "@/data/aiSettings";
import { fetchArrangementModelOptions } from "@/services/arrangementModels";
import { recognizeArrangementText } from "@/services/arrangementRecognition";
import { usePreferences } from "@/settings/preferences";
import type { RecordItem } from "@/types/record";

export function useArrangementSourceRecognition({
  record,
  contextRecords = [],
  locale,
  sourceLabel,
  onCreated,
}: {
  record: RecordItem | null;
  contextRecords?: RecordItem[];
  locale: string;
  sourceLabel: string;
  onCreated: (arrangement: ArrangementItem) => void;
}) {
  const { t } = usePreferences();
  const [form, setForm] = React.useState<ArrangementFormState | null>(null);
  const [metadata, setMetadata] = React.useState<ArrangementAiMetadata | null>(null);
  const [error, setError] = React.useState("");
  const [needsSettings, setNeedsSettings] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const sourceContext = React.useMemo(
    () =>
      record
        ? buildArrangementSourceContext({
            record,
            records: contextRecords,
            sourceLabel,
          })
        : null,
    [contextRecords, record, sourceLabel]
  );

  const recognizeRecord = React.useCallback(async () => {
    if (!record || !sourceContext) return;

    const settings = getInitialArrangementAiSettings();
    setForm(null);
    setMetadata(null);
    setError("");
    setNeedsSettings(false);

    if (!hasCompleteArrangementAiSettings(settings)) {
      setNeedsSettings(true);
      setError(t("arrangements.ai.sourceSettingsRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const models = await fetchArrangementModelOptions(settings);
      const selectedModel = settings.model.trim();
      if (!models.some((model) => model.id === selectedModel)) {
        setNeedsSettings(true);
        setError(t("arrangements.ai.sourceModelUnavailable"));
        return;
      }

      const result = await recognizeArrangementText({
        input: sourceContext.input,
        settings,
        locale,
      });
      if (!result.hasArrangement || !result.title) {
        setError(result.reason || t("arrangements.ai.noResult"));
        return;
      }

      const nextForm = toArrangementForm(result);
      const nextMetadata: ArrangementAiMetadata = {
        ...toArrangementMetadata(result),
        sourceText: sourceContext.sourceText,
        sourceType: record.sourceConversation?.type === "test" ? "test" : "self",
        sourceLabel,
        sourceRecordUid: record.uid,
        sourceSentAt: record.send_at,
      };

      setForm(nextForm);
      setMetadata(withMergePreview(nextForm, nextMetadata));
    } catch (recognitionError) {
      setError(
        formatRecognitionError(
          recognitionError,
          t("arrangements.ai.apiError"),
          t("arrangements.ai.networkError")
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [locale, record, sourceContext, sourceLabel, t]);

  React.useEffect(() => {
    void recognizeRecord();
  }, [recognizeRecord]);

  const updateForm = (key: keyof ArrangementFormState, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    if (error) setError("");
  };

  const confirmCreate = () => {
    if (!form || !metadata) return;

    const arrangement = createAndPersistArrangement(form, metadata);
    if (!arrangement) {
      setError(t("arrangements.titleRequired"));
      return;
    }
    onCreated(arrangement);
  };

  return {
    error,
    form,
    isLoading,
    metadata,
    needsSettings,
    sourceContext,
    confirmCreate,
    recognizeRecord,
    updateForm,
  };
}
