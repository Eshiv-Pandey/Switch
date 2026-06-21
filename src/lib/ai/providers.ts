/**
 * Unified AI Provider Gateway
 *
 * Supports Claude, ChatGPT, Gemini, DeepSeek.
 */

import { DEFAULT_OPENROUTER_MODEL } from "@/lib/ai/openrouter-models";

export type ProviderID = "claude" | "chatgpt" | "gemini" | "deepseek" | "openrouter";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ProviderConfig {
  provider: ProviderID;
  apiKey: string;
  model?: string;
}

// ─── Default Models ────────────────────────────────────────────────────────────
const DEFAULT_MODELS: Record<ProviderID, string> = {
  claude: "claude-3-5-sonnet-20241022",
  chatgpt: "gpt-4o",
  gemini: "gemini-1.5-flash-latest",
  deepseek: "deepseek-chat",
  openrouter: DEFAULT_OPENROUTER_MODEL,
};

// ─── Claude (Anthropic) ────────────────────────────────────────────────────────
async function callClaude(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const body = {
    model: config.model ?? DEFAULT_MODELS.claude,
    max_tokens: 4096,
    system: systemMessages.map((m) => m.content).join("\n\n") || undefined,
    messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  return streamClaudeSSE(response.body!);
}

function streamClaudeSSE(
  body: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.delta?.text ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
      }
    },
  });
}

// ─── ChatGPT (OpenAI) ──────────────────────────────────────────────────────────
async function callChatGPT(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const body = {
    model: config.model ?? DEFAULT_MODELS.chatgpt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  return streamOpenAISSE(response.body!);
}

function streamOpenAISSE(
  body: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
      }
    },
  });
}

// ─── Gemini (Google) ───────────────────────────────────────────────────────────
async function callGemini(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const model = config.model ?? DEFAULT_MODELS.gemini;
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:streamGenerateContent?key=${config.apiKey}`;

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const body: Record<string, unknown> = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  return streamGeminiJSON(response.body!);
}

function streamGeminiJSON(
  body: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Gemini returns a JSON array stream
        const textMatches = buffer.matchAll(/"text":\s*"((?:[^"\\]|\\.)*)"/g);
        for (const match of textMatches) {
          const text = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          if (text) controller.enqueue(encoder.encode(text));
        }
        buffer = "";
      }
    },
  });
}

// ─── DeepSeek ─────────────────────────────────────────────────────────────────
async function callDeepSeek(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const body = {
    model: config.model ?? DEFAULT_MODELS.deepseek,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  };

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${err}`);
  }

  return streamOpenAISSE(response.body!); // DeepSeek uses OpenAI-compatible format
}

// ─── OpenRouter ───────────────────────────────────────────────────────────────
async function callOpenRouter(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const body = {
    model: config.model ?? DEFAULT_MODELS.openrouter,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
      "X-Title": "Switch AI", // Required by OpenRouter
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${err}`);
  }

  return streamOpenAISSE(response.body!); // OpenRouter uses OpenAI format
}

// ─── Unified Gateway ──────────────────────────────────────────────────────────
export async function callProvider(
  provider: ProviderID,
  messages: ChatMessage[],
  apiKey: string,
  model?: string | null
): Promise<ReadableStream<Uint8Array>> {
  if (!apiKey) {
    throw new Error(`No API key configured for ${provider}. Please add one in Settings → AI Accounts.`);
  }

  const config: ProviderConfig = { provider, apiKey, model: model ?? undefined };

  switch (provider) {
    case "claude":
      return await callClaude(messages, config);
    case "chatgpt":
      return await callChatGPT(messages, config);
    case "gemini":
      return await callGemini(messages, config);
    case "deepseek":
      return await callDeepSeek(messages, config);
    case "openrouter":
      return await callOpenRouter(messages, config);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
