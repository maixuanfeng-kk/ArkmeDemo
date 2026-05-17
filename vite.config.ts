import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));
const arrangementAiProxyPath = "/api/arrangement-ai/chat-completions";
const arrangementAiModelsProxyPath = "/api/arrangement-ai/models";

export default defineConfig({
  plugins: [react(), arrangementAiProxyPlugin()],
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
});

function arrangementAiProxyPlugin(): Plugin {
  return {
    name: "arrangement-ai-proxy",
    configureServer(server) {
      server.middlewares.use(arrangementAiProxyPath, async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: { message: "Method not allowed" } });
          return;
        }

        try {
          const payload = normalizeProxyPayload(await readJsonBody(req));
          const upstream = await fetch(buildChatCompletionEndpoint(payload.baseUrl), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${payload.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload.requestBody),
          });
          res.statusCode = upstream.status;
          res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
          res.end(await upstream.text());
        } catch (error) {
          sendJson(res, 502, { error: { message: getProxyErrorMessage(error) } });
        }
      });
      server.middlewares.use(arrangementAiModelsProxyPath, async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: { message: "Method not allowed" } });
          return;
        }

        try {
          const payload = normalizeSettingsPayload(await readJsonBody(req));
          const upstream = await fetch(buildModelsEndpoint(payload.baseUrl), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${payload.apiKey}`,
              "Content-Type": "application/json",
            },
          });
          res.statusCode = upstream.status;
          res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
          res.end(await upstream.text());
        } catch (error) {
          sendJson(res, 502, { error: { message: getProxyErrorMessage(error) } });
        }
      });
    },
  };
}

function buildChatCompletionEndpoint(baseUrl: string) {
  const trimmedUrl = baseUrl.trim().replace(/\/+$/, "");
  return trimmedUrl.endsWith("/chat/completions")
    ? trimmedUrl
    : `${trimmedUrl}/chat/completions`;
}

function buildModelsEndpoint(baseUrl: string) {
  const trimmedUrl = baseUrl.trim().replace(/\/+$/, "");
  return trimmedUrl.endsWith("/models") ? trimmedUrl : `${trimmedUrl}/models`;
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function normalizeProxyPayload(value: unknown) {
  const payload = normalizeSettingsPayload(value) as {
    baseUrl: string;
    apiKey: string;
    requestBody?: unknown;
  };
  if (!payload.requestBody || typeof payload.requestBody !== "object") {
    throw new Error("代理请求缺少模型请求体。");
  }
  return {
    baseUrl: payload.baseUrl,
    apiKey: payload.apiKey,
    requestBody: payload.requestBody,
  };
}

function normalizeSettingsPayload(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("代理请求缺少参数。");
  const payload = value as { baseUrl?: unknown; apiKey?: unknown; requestBody?: unknown };
  if (typeof payload.baseUrl !== "string" || !payload.baseUrl.trim()) {
    throw new Error("代理请求缺少 Base URL。");
  }
  if (typeof payload.apiKey !== "string" || !payload.apiKey.trim()) {
    throw new Error("代理请求缺少 API Key。");
  }
  return {
    baseUrl: payload.baseUrl.trim(),
    apiKey: payload.apiKey.trim(),
    requestBody: payload.requestBody,
  };
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function getProxyErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "本地代理无法连接 API。";
}
