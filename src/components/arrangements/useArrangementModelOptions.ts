import React from "react";
import type { ArrangementAiSettings } from "@/data/aiSettings";
import {
  fetchArrangementModelOptions,
  type ArrangementModelOption,
} from "@/services/arrangementModels";

type Translate = (key: string) => string;

export function useArrangementModelOptions(t: Translate) {
  const [options, setOptions] = React.useState<ArrangementModelOption[]>([]);
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const clearMessage = React.useCallback(() => setMessage(""), []);
  const resetOptions = React.useCallback(() => {
    setOptions([]);
    setMessage("");
  }, []);

  const loadOptions = React.useCallback(
    async (settings: ArrangementAiSettings, onFirstModel: (model: string) => void) => {
      if (!settings.baseUrl.trim() || !settings.apiKey.trim()) {
        setMessage(t("arrangements.ai.modelLoadRequired"));
        return;
      }

      setIsLoading(true);
      setMessage("");
      try {
        const models = await fetchArrangementModelOptions(settings);
        setOptions(models);
        if (!models.length) {
          onFirstModel("");
          setMessage(t("arrangements.ai.modelLoadEmpty"));
          return;
        }
        if (!models.some((model) => model.id === settings.model.trim())) {
          onFirstModel(models[0].id);
        }
        setMessage(t("arrangements.ai.modelLoadSuccess"));
      } catch (error) {
        setOptions([]);
        setMessage(formatModelLoadError(error, t("arrangements.ai.modelLoadError")));
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  const hasSelectedModel = React.useCallback(
    (model: string) => options.some((option) => option.id === model.trim()),
    [options]
  );

  return {
    clearMessage,
    hasSelectedModel,
    isLoading,
    loadOptions,
    message,
    options,
    resetOptions,
  };
}

function formatModelLoadError(error: unknown, fallback: string) {
  if (!(error instanceof Error) || !error.message) return fallback;
  return `${fallback}\n${error.message}`;
}
