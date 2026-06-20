import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, conversations, aiAccounts } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { callProvider, type ProviderID } from "@/lib/ai/providers";
import { generateId } from "@/lib/utils";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

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
  }: { conversationId: string; content: string; accountId: string } = body;

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

  // Save user message
  const userMessageId = generateId();
  await db.insert(messages).values({
    id: userMessageId,
    conversationId,
    role: "user",
    content,
    modelProvider: account.provider,
    accountId,
  });

  // Load conversation history (last 30 messages)
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(30);

  const chatMessages = history.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  // Call the AI provider
  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await callProvider(
      account.provider as ProviderID,
      chatMessages,
      account.apiKey
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
      });

      // Auto-update conversation title if it's the first exchange
      if (history.length <= 1) {
        const title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
        await db
          .update(conversations)
          .set({ title })
          .where(eq(conversations.id, conversationId));
      }
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
