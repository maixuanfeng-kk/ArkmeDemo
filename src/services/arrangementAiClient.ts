export const chatCompletionProxyEndpoint = "/api/arrangement-ai/chat-completions";
export const modelsProxyEndpoint = "/api/arrangement-ai/models";

export function shouldUseLocalArrangementAiProxy(baseUrl: string) {
  if (typeof window === "undefined") return false;
  if (!["127.0.0.1", "localhost"].includes(window.location.hostname)) return false;

  try {
    return new URL(baseUrl).origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function buildArrangementAiEndpoint(baseUrl: string, suffix: string) {
  const trimmedUrl = baseUrl.trim().replace(/\/+$/, "");
  if (trimmedUrl.endsWith(suffix)) return trimmedUrl;
  return `${trimmedUrl}${suffix}`;
}

export async function getArrangementApiErrorMessage(
  response: Response,
  fallback: string
) {
  try {
    const data = (await response.json()) as {
      error?: string | { message?: string };
      message?: string;
    };
    const message =
      typeof data.error === "string" ? data.error : data.error?.message ?? data.message;
    return message ? `${fallback}\n${message}` : fallback;
  } catch {
    return fallback;
  }
}
