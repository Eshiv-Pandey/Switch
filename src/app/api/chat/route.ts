import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, conversations, aiAccounts, memoryEntries, projects } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { callProvider, extractFacts, type ProviderID } from "@/lib/ai/providers";
import { DEFAULT_OPENROUTER_MODEL, OPENROUTER_FREE_MODELS } from "@/lib/ai/openrouter-models";
import { generateId } from "@/lib/utils";
import { after, NextRequest } from "next/server";

export const runtime = "nodejs";

type ResponseMode = "normal" | "one_liner" | "one_para" | "one_word";

const RESPONSE_MODE_PROMPTS: Record<ResponseMode, string> = {
  normal: "",
  one_liner: "Answer in exactly one concise line unless the user explicitly asks for a longer format.",
  one_para: "Answer in one compact paragraph unless the user explicitly asks for a longer format.",
  one_word: "Answer with exactly one word whenever possible.",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    conversationId,
    content,
    accountId,
    modelId,
    responseMode = "normal",
  }: {
    conversationId: string;
    content: string;
    accountId: string;
    modelId?: string;
    responseMode?: ResponseMode;
  } = body;

  if (!conversationId || !content || !accountId) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Get the AI account
  const [account] = await db
    .select()
    .from(aiAccounts)
    .where(eq(aiAccounts.id, accountId))
    .limit(1);

  if (!account || account.userId !== session.user.id) {
    return new Response("Account not found", { status: 404 });
  }

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, session.user.id)))
    .limit(1);

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const canUseRequestedModel =
    account.provider === "openrouter" &&
    modelId &&
    (OPENROUTER_FREE_MODELS.some((model) => model.id === modelId) || modelId === account.modelId);

  const effectiveModelId =
    canUseRequestedModel
      ? modelId
      : account.modelId ?? (account.provider === "openrouter" ? DEFAULT_OPENROUTER_MODEL : undefined);

  // Save user message
  const userMessageId = generateId();
  await db.insert(messages).values({
    id: userMessageId,
    conversationId,
    role: "user",
    content,
    modelProvider: account.provider,
    accountId,
    metadata: effectiveModelId ? { modelId: effectiveModelId, responseMode } : { responseMode },
  });

  // Load conversation history (last 30 messages)
  const recentHistory = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(30);

  const history = [...recentHistory].reverse();

  const projectMemory = await db
    .select()
    .from(memoryEntries)
    .where(
      and(
        eq(memoryEntries.projectId, conversation.projectId),
        eq(memoryEntries.userId, session.user.id)
      )
    )
    .orderBy(desc(memoryEntries.createdAt))
    .limit(12);

  const chatMessages = history.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  const systemMessages = [];
  if (projectMemory.length > 0) {
    systemMessages.push({
      role: "system" as const,
      content: `Project memory:\n${projectMemory
        .map((entry) => `- ${entry.content}`)
        .join("\n")}`,
    });
  }
  const responseInstruction = RESPONSE_MODE_PROMPTS[responseMode] ?? "";
  if (responseInstruction) {
    systemMessages.push({ role: "system" as const, content: responseInstruction });
  }

  // Call the AI provider
  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await callProvider(
      account.provider as ProviderID,
      [...systemMessages, ...chatMessages],
      account.apiKey,
      effectiveModelId
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI provider error";
    console.error(`Provider ${account.provider} error:`, err);
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Buffer the full response to save to DB after streaming
  const assistantMessageId = generateId();
  let fullResponse = "";

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      fullResponse += text;
      controller.enqueue(chunk);
    },
    async flush() {
      // Save assistant message after stream completes
      await db.insert(messages).values({
        id: assistantMessageId,
        conversationId,
        role: "assistant",
        content: fullResponse,
        modelProvider: account.provider,
        accountId,
        metadata: effectiveModelId ? { modelId: effectiveModelId, responseMode } : { responseMode },
      });

      // Auto-update conversation title if it's the first exchange
      if (history.length <= 1) {
        const title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
        await db
          .update(conversations)
          .set({ title })
          .where(eq(conversations.id, conversationId));
      }

      await db
        .update(projects)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(projects.id, conversation.projectId));

      after(async () => {
        const facts = await extractFacts(
          account.provider as ProviderID,
          content,
          fullResponse,
          account.apiKey,
          effectiveModelId
        );

        if (facts.length === 0) return;

        const existing = await db
          .select({ content: memoryEntries.content })
          .from(memoryEntries)
          .where(
            and(
              eq(memoryEntries.projectId, conversation.projectId),
              eq(memoryEntries.userId, session.user.id)
            )
          )
          .limit(200);

        const existingContent = new Set(existing.map((entry) => entry.content.toLowerCase()));
        const newFacts = facts.filter((fact) => !existingContent.has(fact.toLowerCase()));

        if (newFacts.length === 0) return;

        await db.insert(memoryEntries).values(
          newFacts.map((fact) => ({
            id: generateId(),
            projectId: conversation.projectId,
            userId: session.user.id,
            type: "summary" as const,
            content: fact,
            sourceMessageId: assistantMessageId,
            metadata: { conversationId, modelId: effectiveModelId ?? null },
          }))
        );
      });
    },
  });

  return new Response(stream.pipeThrough(transformStream), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Message-Id": assistantMessageId,
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
