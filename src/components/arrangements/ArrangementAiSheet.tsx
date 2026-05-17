import React from "react";
import ArrangementApiSettingsForm from "@/components/arrangements/ArrangementApiSettingsForm";
import ArrangementAiSheetHeader from "@/components/arrangements/ArrangementAiSheetHeader";
import ArrangementPendingRecognition from "@/components/arrangements/ArrangementPendingRecognition";
import ArrangementRecognitionForm from "@/components/arrangements/ArrangementRecognitionForm";
import {
  formatRecognitionError,
  toArrangementForm,
  toArrangementMetadata,
  withMergePreview,
} from "@/components/arrangements/arrangementAiSheetUtils";
import { useArrangementModelOptions } from "@/components/arrangements/useArrangementModelOptions";
import type {
  ArrangementAiMetadata,
  ArrangementFormState,
} from "@/components/arrangements/types";
import {
  getInitialArrangementAiSettings,
  hasCompleteArrangementAiSettings,
  persistArrangementAiSettings,
} from "@/data/aiSettings";
import { recognizeArrangementText } from "@/services/arrangementRecognition";
import { usePreferences } from "@/settings/preferences";

export default function ArrangementAiSheet({
  locale,
  onClose,
  onCreate,
}: {
  locale: string;
  onClose: () => void;
  onCreate: (form: ArrangementFormState, metadata: ArrangementAiMetadata) => void;
}) {
  const { t } = usePreferences();
  const [settings, setSettings] = React.useState(getInitialArrangementAiSettings);
  const [savedMessage, setSavedMessage] = React.useState("");
  const [recognitionText, setRecognitionText] = React.useState("");
  const [recognitionError, setRecognitionError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [pendingForm, setPendingForm] = React.useState<ArrangementFormState | null>(null);
  const [pendingMetadata, setPendingMetadata] =
    React.useState<ArrangementAiMetadata | null>(null);
  const modelOptions = useArrangementModelOptions(t);

  const updateSettings = (key: keyof typeof settings, value: string) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
      model:
        key === "baseUrl" || key === "apiKey"
          ? ""
          : key === "model"
            ? value
            : current.model,
    }));
    setSavedMessage("");
    if (key === "baseUrl" || key === "apiKey") modelOptions.resetOptions();
    else if (key !== "model") modelOptions.clearMessage();
  };

  const loadModels = () => {
    void modelOptions.loadOptions(settings, (model) => updateSettings("model", model));
  };

  const saveSettings = () => {
    if (
      !hasCompleteArrangementAiSettings(settings) ||
      !modelOptions.hasSelectedModel(settings.model)
    ) {
      setSavedMessage(t("arrangements.ai.modelSelectionRequired"));
      return;
    }
    persistArrangementAiSettings(settings);
    setSavedMessage(t("arrangements.ai.apiSaved"));
  };

  const updatePendingForm = (key: keyof ArrangementFormState, value: string) => {
    setPendingForm((current) => (current ? { ...current, [key]: value } : current));
    if (recognitionError) setRecognitionError("");
  };

  const recognizeText = async () => {
    const input = recognitionText.trim();
    if (!input) {
      setRecognitionError(t("arrangements.ai.textRequired"));
      return;
    }
    if (!hasCompleteArrangementAiSettings(settings)) {
      setRecognitionError(t("arrangements.ai.settingsRequired"));
      return;
    }
    if (!modelOptions.hasSelectedModel(settings.model)) {
      setRecognitionError(t("arrangements.ai.modelSelectionRequired"));
      return;
    }

    setIsLoading(true);
    setRecognitionError("");
    try {
      const result = await recognizeArrangementText({ input, settings, locale });
      if (!result.hasArrangement || !result.title) {
        setPendingForm(null);
        setPendingMetadata(null);
        setRecognitionError(result.reason || t("arrangements.ai.noResult"));
        return;
      }
      const nextForm = toArrangementForm(result);
      const nextMetadata = toArrangementMetadata(result);
      setPendingForm(nextForm);
      setPendingMetadata(withMergePreview(nextForm, nextMetadata));
    } catch (error) {
      setRecognitionError(
        formatRecognitionError(
          error,
          t("arrangements.ai.apiError"),
          t("arrangements.ai.networkError")
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCreate = () => {
    if (!pendingForm || !pendingMetadata) return;
    if (!pendingForm.title.trim()) {
      setRecognitionError(t("arrangements.titleRequired"));
      return;
    }
    onCreate(pendingForm, pendingMetadata);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-overlay-light"
        onClick={onClose}
        aria-label={t("arrangements.closeAi")}
      />
      <section className="relative max-h-[92%] overflow-y-auto rounded-t-[20px] bg-bg px-4 pb-5 pt-4 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <ArrangementAiSheetHeader onClose={onClose} />

        <div className="mt-4 space-y-3">
          <ArrangementApiSettingsForm
            settings={settings}
            modelOptions={modelOptions.options}
            modelMessage={modelOptions.message}
            isLoadingModels={modelOptions.isLoading}
            savedMessage={savedMessage}
            onChange={updateSettings}
            onLoadModels={loadModels}
            onSave={saveSettings}
          />
          <ArrangementRecognitionForm
            text={recognitionText}
            error={recognitionError}
            isLoading={isLoading}
            onTextChange={setRecognitionText}
            onRecognize={recognizeText}
          />
          {pendingForm && pendingMetadata && (
            <ArrangementPendingRecognition
              form={pendingForm}
              metadata={pendingMetadata}
              onChange={updatePendingForm}
              onConfirm={confirmCreate}
              onIgnore={() => {
                setPendingForm(null);
                setPendingMetadata(null);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
