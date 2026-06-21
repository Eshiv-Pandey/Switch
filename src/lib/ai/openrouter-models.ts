export const OPENROUTER_FREE_MODELS = [
  {
    id: "cohere/north-mini-code:free",
    name: "Cohere North Mini Code",
    note: "Preferred for coding and agentic software tasks.",
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "NVIDIA Nemotron 3 Ultra",
    note: "Strong for long-context reasoning and planning.",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "NVIDIA Nemotron 3 Nano",
    note: "Fast general chat with a large context window.",
  },
  {
    id: "nvidia/nemotron-3.5-content-safety:free",
    name: "NVIDIA Nemotron Content Safety",
    note: "Best for moderation and safety checks.",
  },
] as const;

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_FREE_MODELS[0].id;

export function getOpenRouterModelLabel(modelId?: string | null) {
  return OPENROUTER_FREE_MODELS.find((model) => model.id === modelId)?.name ?? modelId ?? "OpenRouter model";
}
