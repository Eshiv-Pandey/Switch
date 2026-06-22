export interface OpenRouterModel {
  id: string;
  name: string;
  note: string;
  tag: string;
  tagColor: string;
}

export const OPENROUTER_FREE_MODELS: OpenRouterModel[] = [
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    note: "Meta's flagship open model. Great all-rounder for chat and instruction following.",
    tag: "General",
    tagColor: "#6366f1",
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    note: "Chain-of-thought reasoning model. Excellent for complex multi-step problems.",
    tag: "Reasoning",
    tagColor: "#ec4899",
  },
  {
    id: "qwen/qwen3-235b-a22b:free",
    name: "Qwen3 235B",
    note: "Alibaba's large research model with strong analytical capabilities.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  {
    id: "cohere/north-mini-code:free",
    name: "Cohere North Mini Code",
    note: "Optimised for code generation and agentic software engineering tasks.",
    tag: "Coding",
    tagColor: "#10b981",
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra 550B",
    note: "NVIDIA's largest open model. Strong for long-context reasoning and planning.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    note: "Google's open instruction-tuned model. Balanced performance and speed.",
    tag: "General",
    tagColor: "#6366f1",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B Instruct",
    note: "Lightweight and blazing fast. Best for quick answers and simple tasks.",
    tag: "Fast",
    tagColor: "#14b8a6",
  },
  {
    id: "microsoft/phi-3-mini-128k-instruct:free",
    name: "Phi-3 Mini 128K",
    note: "Microsoft's compact model with a massive 128K context window.",
    tag: "Long Context",
    tagColor: "#8b5cf6",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 3 Nano 30B",
    note: "Fast general chat with a large context window from NVIDIA.",
    tag: "Fast",
    tagColor: "#14b8a6",
  },
  {
    id: "nvidia/nemotron-3.5-content-safety:free",
    name: "Nemotron Content Safety",
    note: "Specialised for content moderation and safety classification.",
    tag: "Safety",
    tagColor: "#ef4444",
  },
];

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_FREE_MODELS[0].id;

export function getOpenRouterModelLabel(modelId?: string | null) {
  return (
    OPENROUTER_FREE_MODELS.find((model) => model.id === modelId)?.name ??
    modelId ??
    "OpenRouter model"
  );
}

export function getOpenRouterModelTag(modelId?: string | null): { tag: string; tagColor: string } | null {
  const found = OPENROUTER_FREE_MODELS.find((m) => m.id === modelId);
  if (!found) return null;
  return { tag: found.tag, tagColor: found.tagColor };
}
