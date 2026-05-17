import type { ArrangementAiSettings } from "@/data/aiSettings";
import {
  buildArrangementAiEndpoint,
  getArrangementApiErrorMessage,
  modelsProxyEndpoint,
  shouldUseLocalArrangementAiProxy,
} from "@/services/arrangementAiClient";

export type ArrangementModelOption = {
  id: string;
};

type ModelsResponse = {
  data?: Array<{ id?: unknown }>;
};

export async function fetchArrangementModelOptions(settings: ArrangementAiSettings) {
  const endpoint = getModelsEndpoint(settings.baseUrl);
  const response = await fetch(endpoint, {
    method: shouldUseLocalArrangementAiProxy(settings.baseUrl) ? "POST" : "GET",
    headers: getRequestHeaders(settings),
    body: getRequestBody(settings),
  });

  if (!response.ok) {
    throw new Error(
      await getArrangementApiErrorMessage(
        response,
        `模型列表返回 ${response.status}，请检查 Base URL 或 API Key。`
      )
    );
  }

  return normalizeModelOptions((await response.json()) as ModelsResponse);
}

function getModelsEndpoint(baseUrl: string) {
  return shouldUseLocalArrangementAiProxy(baseUrl)
    ? modelsProxyEndpoint
    : buildArrangementAiEndpoint(baseUrl, "/models");
}

function getRequestHeaders(settings: ArrangementAiSettings): Record<string, string> {
  if (shouldUseLocalArrangementAiProxy(settings.baseUrl)) {
    return { "Content-Type": "application/json" };
  }

  return {
    Authorization: `Bearer ${settings.apiKey.trim()}`,
    "Content-Type": "application/json",
  };
}

function getRequestBody(settings: ArrangementAiSettings) {
  if (!shouldUseLocalArrangementAiProxy(settings.baseUrl)) return undefined;

  return JSON.stringify({
    baseUrl: settings.baseUrl.trim(),
    apiKey: settings.apiKey.trim(),
  });
}

function normalizeModelOptions(data: ModelsResponse): ArrangementModelOption[] {
  const seen = new Set<string>();
  return (data.data ?? []).flatMap((model) => {
    const id = typeof model.id === "string" ? model.id.trim() : "";
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ id }];
  });
}
