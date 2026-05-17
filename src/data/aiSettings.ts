export type ArrangementAiSettings = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

const aiSettingsStorageKey = "arkme-demo.arrangementAiSettings";

export const defaultArrangementAiSettings: ArrangementAiSettings = {
  baseUrl: "https://api.openai.com/v1",
  model: "",
  apiKey: "",
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAiSettings(value: unknown): ArrangementAiSettings {
  if (!value || typeof value !== "object") return defaultArrangementAiSettings;

  const settings = value as Partial<ArrangementAiSettings>;
  return {
    baseUrl: normalizeText(settings.baseUrl) || defaultArrangementAiSettings.baseUrl,
    model: normalizeText(settings.model) || defaultArrangementAiSettings.model,
    apiKey: normalizeText(settings.apiKey),
  };
}

export function getInitialArrangementAiSettings(): ArrangementAiSettings {
  if (typeof window === "undefined") return defaultArrangementAiSettings;

  try {
    const storedValue = window.localStorage.getItem(aiSettingsStorageKey);
    return storedValue
      ? normalizeAiSettings(JSON.parse(storedValue))
      : defaultArrangementAiSettings;
  } catch {
    return defaultArrangementAiSettings;
  }
}

export function persistArrangementAiSettings(settings: ArrangementAiSettings) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      aiSettingsStorageKey,
      JSON.stringify(normalizeAiSettings(settings))
    );
  } catch {
    // Keep the visible settings in memory when storage is unavailable.
  }
}

export function hasCompleteArrangementAiSettings(settings: ArrangementAiSettings) {
  return Boolean(
    settings.apiKey.trim() &&
      settings.baseUrl.trim() &&
      settings.model.trim()
  );
}
