import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contextTransfers, messages, memoryEntries, uploadedFiles, conversations } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { buildContextPackage, contextPackageToSystemPrompt } from "@/lib/ai/context-transfer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, fromAccountId, toAccountId } = await req.json();

  if (!conversationId || !toAccountId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Load conversation context
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const projectId = conversation.projectId;

  // Load recent messages
  const recentMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(30);

  // Load memory entries for this project
  const memories = await db
    .select()
    .from(memoryEntries)
    .where(eq(memoryEntries.projectId, projectId))
    .limit(20);

  // Load uploaded files
  const files = await db
    .select()
    .from(uploadedFiles)
    .where(eq(uploadedFiles.projectId, projectId))
    .limit(10);

  // Build context package
  const ctxPackage = buildContextPackage({
    projectName: "Your Project",
    recentMessages,
    memories: memories.map((m) => ({ type: m.type, content: m.content })),
    files: files.map((f) => ({ fileName: f.fileName, extractedText: f.extractedText })),
  });

  // Save the system prompt as first message in conversation for context
  const systemPrompt = contextPackageToSystemPrompt(ctxPackage);
  const systemMsgId = generateId();
  await db.insert(messages).values({
    id: systemMsgId,
    conversationId,
    role: "system",
    content: systemPrompt,
    modelProvider: null,
    accountId: toAccountId,
  });

  // Record the transfer
  const transferId = generateId();
  await db.insert(contextTransfers).values({
    id: transferId,
    conversationId,
    fromAccountId: fromAccountId ?? null,
    toAccountId,
    contextPackage: ctxPackage,
  });

  // Update conversation's active account
  await db
    .update(conversations)
    .set({ activeAccountId: toAccountId })
    .where(eq(conversations.id, conversationId));

  return NextResponse.json({ success: true, transferId, contextPackage: ctxPackage });
}
