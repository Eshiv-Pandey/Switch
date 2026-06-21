import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  projects,
  conversations,
  messages,
  memoryEntries,
  uploadedFiles,
  aiAccounts,
} from "@/lib/db/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { generateId } from "@/lib/utils";
import { ChatInterface } from "@/components/app/ChatInterface";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  // Verify project belongs to user
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!project) notFound();

  // Get or create a conversation for this project
  let [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.projectId, projectId),
        eq(conversations.userId, userId)
      )
    )
    .orderBy(asc(conversations.createdAt))
    .limit(1);

  if (!conversation) {
    const newConvoId = generateId();
    await db.insert(conversations).values({
      id: newConvoId,
      projectId,
      userId,
      title: "New Conversation",
    });
    const [created] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, newConvoId))
      .limit(1);
    conversation = created;
  }

  // Load messages
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(asc(messages.createdAt))
    .limit(100);

  // Load user accounts
  const accounts = await db
    .select()
    .from(aiAccounts)
    .where(and(eq(aiAccounts.userId, userId), eq(aiAccounts.isActive, true)));

  // Load memory & file counts
  const [memCount] = await db
    .select({ count: count() })
    .from(memoryEntries)
    .where(
      and(
        eq(memoryEntries.projectId, projectId),
        eq(memoryEntries.userId, userId)
      )
    );

  const [fileCount] = await db
    .select({ count: count() })
    .from(uploadedFiles)
    .where(
      and(
        eq(uploadedFiles.projectId, projectId),
        eq(uploadedFiles.userId, userId)
      )
    );

  return (
    <ChatInterface
      conversationId={conversation.id}
      projectName={`${project.emoji} ${project.name}`}
      initialMessages={msgs.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        modelProvider: m.modelProvider ?? undefined,
        accountLabel: accounts.find((a) => a.id === m.accountId)?.accountLabel,
        createdAt: m.createdAt,
      }))}
      accounts={accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        accountLabel: a.accountLabel,
        modelId: a.modelId,
      }))}
      activeAccountId={conversation.activeAccountId ?? accounts[0]?.id}
      memoryCount={memCount?.count ?? 0}
      fileCount={fileCount?.count ?? 0}
    />
  );
}
