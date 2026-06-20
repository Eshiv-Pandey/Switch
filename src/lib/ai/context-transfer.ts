import { type Message } from "@/lib/db/schema";

export interface ContextPackage {
  projectName: string;
  projectDescription?: string;
  currentTask: string;
  recentSummary: string;
  keyDecisions: string[];
  goals: string[];
  todos: string[];
  relevantFiles: Array<{ name: string; excerpt: string }>;
  generatedAt: string;
}

/**
 * Build a context package from recent messages and memory entries.
 * This is injected as a system prompt when switching AI models.
 */
export function buildContextPackage(params: {
  projectName: string;
  projectDescription?: string;
  recentMessages: Message[];
  memories: Array<{ type: string; content: string }>;
  files: Array<{ fileName: string; extractedText?: string | null }>;
}): ContextPackage {
  const { projectName, projectDescription, recentMessages, memories, files } =
    params;

  // Summarise the last 10 messages for the "recent conversation" field
  const recentConversation = recentMessages
    .slice(-10)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const decisions = memories
    .filter((m) => m.type === "decision")
    .map((m) => m.content);

  const goals = memories
    .filter((m) => m.type === "goal")
    .map((m) => m.content);

  const todos = memories
    .filter((m) => m.type === "todo")
    .map((m) => m.content);

  const summaries = memories
    .filter((m) => m.type === "summary")
    .map((m) => m.content)
    .join(" ");

  const relevantFiles = files.slice(0, 5).map((f) => ({
    name: f.fileName,
    excerpt: f.extractedText
      ? f.extractedText.slice(0, 300) + (f.extractedText.length > 300 ? "..." : "")
      : "(binary file)",
  }));

  return {
    projectName,
    projectDescription,
    currentTask: recentMessages.length > 0
      ? `Continuing from a previous session. Last topic: ${recentMessages[recentMessages.length - 1]?.content?.slice(0, 120) ?? "unknown"}`
      : "Starting a new session.",
    recentSummary: summaries || recentConversation.slice(0, 800),
    keyDecisions: decisions,
    goals,
    todos,
    relevantFiles,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Convert a context package into an injected system prompt string.
 */
export function contextPackageToSystemPrompt(ctx: ContextPackage): string {
  const lines: string[] = [
    `# Context Transfer — Switch AI`,
    ``,
    `You are picking up a conversation that was previously handled by a different AI model.`,
    `The user has NOT lost any context — you have everything you need below.`,
    ``,
    `## Project`,
    `**Name**: ${ctx.projectName}`,
  ];

  if (ctx.projectDescription) {
    lines.push(`**Description**: ${ctx.projectDescription}`);
  }

  lines.push(``, `## Current Task`, ctx.currentTask);

  if (ctx.recentSummary) {
    lines.push(``, `## Conversation Summary`, ctx.recentSummary);
  }

  if (ctx.keyDecisions.length > 0) {
    lines.push(``, `## Key Decisions Made`);
    ctx.keyDecisions.forEach((d) => lines.push(`- ${d}`));
  }

  if (ctx.goals.length > 0) {
    lines.push(``, `## Goals`);
    ctx.goals.forEach((g) => lines.push(`- ${g}`));
  }

  if (ctx.todos.length > 0) {
    lines.push(``, `## Outstanding TODOs`);
    ctx.todos.forEach((t) => lines.push(`- ${t}`));
  }

  if (ctx.relevantFiles.length > 0) {
    lines.push(``, `## Uploaded Files`);
    ctx.relevantFiles.forEach((f) => {
      lines.push(`### ${f.name}`, f.excerpt, ``);
    });
  }

  lines.push(
    ``,
    `---`,
    `Continue the conversation naturally. Do not mention that you are a different AI model unless asked.`,
    `Act as one continuous, intelligent assistant that has been with the user all along.`
  );

  return lines.join("\n");
}
