import type { ArrangementAiSettings } from "@/data/aiSettings";
import {
  buildArrangementAiEndpoint,
  chatCompletionProxyEndpoint,
  getArrangementApiErrorMessage,
  shouldUseLocalArrangementAiProxy,
} from "@/services/arrangementAiClient";

export type ArrangementRecognitionResult = {
  hasArrangement: boolean;
  title: string;
  timeKind: "due" | "range" | "reminder";
  timeText: string;
  endTimeText: string;
  reminderText: string;
  reminderLead: "none" | "10m" | "30m" | "1h" | "1d";
  reminderRepeat: "none" | "daily" | "weekly";
  personText: string;
  placeText: string;
  note: string;
  sourceText: string;
  confidence: number;
  reason: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const recognitionSchema =
  '{"hasArrangement":true,"title":"","timeKind":"due","timeText":"","endTimeText":"","reminderText":"","reminderLead":"none","reminderRepeat":"none","personText":"","placeText":"","note":"","sourceText":"","confidence":0.8,"reason":""}';

export async function recognizeArrangementText({
  input,
  settings,
  locale,
}: {
  input: string;
  settings: ArrangementAiSettings;
  locale: string;
}) {
  const requestBody = {
    model: settings.model.trim(),
    temperature: 0,
    max_tokens: 900,
    messages: buildRecognitionMessages(input.trim(), locale),
  };
  const endpoint = getRequestEndpoint(settings.baseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: getRequestHeaders(settings),
    body: JSON.stringify(getRequestBody(settings, requestBody)),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI 没有返回可解析内容，请重试。");

  return normalizeRecognitionResult(parseJsonObject(content), input);
}

function getRequestEndpoint(baseUrl: string) {
  return shouldUseLocalArrangementAiProxy(baseUrl)
    ? chatCompletionProxyEndpoint
    : buildArrangementAiEndpoint(baseUrl, "/chat/completions");
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

function getRequestBody(settings: ArrangementAiSettings, requestBody: object) {
  if (!shouldUseLocalArrangementAiProxy(settings.baseUrl)) return requestBody;

  return {
    baseUrl: settings.baseUrl.trim(),
    apiKey: settings.apiKey.trim(),
    requestBody,
  };
}

function buildRecognitionMessages(input: string, locale: string) {
  const today = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  return [
    {
      role: "system",
      content:
        "你是即我 App 的安排识别器。只识别明确、具体、可执行的未来安排；不处理隐喻、暗号或私人语义；不要编造时间、人物、地点。输入可能是单条消息，也可能是同一会话的连续上下文。遇到连续上下文时，要综合前后文总结最新可执行安排，尤其要把“再带 A”“还有 B/C/D”这类递进补充合进同一条安排，不要只看最后一句。标题只写动作，不要把时间、语气词或整句原话混进标题；例如“下周一下午三点来面试吧”的标题是“面试”，“明早给小李带早餐”的标题是“给小李带早餐”。如果同一安排包含多个明确动作，用“ / ”并列，不要遗漏。timeKind 只能是 due、range、reminder：截止时间用 due；有开始和结束的日程用 range，开始写 timeText，结束写 endTimeText；只需要提醒用户在某刻做某事用 reminder，提醒时间写 reminderText，没有明确结束时间不要乱填。personText 只填人名或人群，不填地点、店名或“在某地”这类介词短语；placeText 只填地点。sourceText 返回支撑安排的原文片段，可以包含多行上下文。只返回一个严格 JSON 对象，格式示例：" +
        "提醒字段只在原文明确时填写：reminderLead 只能是 none、10m、30m、1h、1d；reminderRepeat 只能是 none、daily、weekly。" +
        recognitionSchema,
    },
    {
      role: "user",
      content: `当前时间：${today}\n待识别文本：${input}`,
    },
  ];
}

async function getApiErrorMessage(response: Response) {
  const fallback = `API 返回 ${response.status}，请检查 Base URL、模型或 API Key。`;
  return getArrangementApiErrorMessage(response, fallback);
}

function parseJsonObject(content: string): unknown {
  const withoutFence = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const match = /\{[\s\S]*\}/.exec(withoutFence);
  if (!match) throw new Error("AI 返回的不是 JSON，请重试。");
  return JSON.parse(match[0]) as unknown;
}

function normalizeRecognitionResult(
  value: unknown,
  fallbackSource: string
): ArrangementRecognitionResult {
  if (!value || typeof value !== "object") {
    throw new Error("AI 返回字段不完整，请重试。");
  }

  const record = value as Partial<Record<keyof ArrangementRecognitionResult, unknown>>;
  const timeKind = normalizeTimeKind(record.timeKind);
  const timeText = normalizeText(record.timeText);
  const reminderText = normalizeText(record.reminderText);

  return {
    hasArrangement: record.hasArrangement === true,
    title: normalizeText(record.title),
    timeKind,
    timeText,
    endTimeText: normalizeText(record.endTimeText),
    reminderText: timeKind === "reminder" ? reminderText || timeText : reminderText,
    reminderLead: normalizeReminderLead(record.reminderLead),
    reminderRepeat: normalizeReminderRepeat(record.reminderRepeat),
    personText: normalizeText(record.personText),
    placeText: normalizeText(record.placeText),
    note: normalizeText(record.note),
    sourceText: normalizeText(record.sourceText) || fallbackSource.trim(),
    confidence: normalizeConfidence(record.confidence),
    reason: normalizeText(record.reason),
  };
}

function normalizeTimeKind(value: unknown): ArrangementRecognitionResult["timeKind"] {
  return value === "range" || value === "reminder" ? value : "due";
}

function normalizeReminderLead(value: unknown): ArrangementRecognitionResult["reminderLead"] {
  return value === "10m" || value === "30m" || value === "1h" || value === "1d"
    ? value
    : "none";
}

function normalizeReminderRepeat(value: unknown): ArrangementRecognitionResult["reminderRepeat"] {
  return value === "daily" || value === "weekly" ? value : "none";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
