import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memoryEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const query = db
    .select()
    .from(memoryEntries)
    .where(
      projectId
        ? and(eq(memoryEntries.userId, session.user.id), eq(memoryEntries.projectId, projectId))
        : eq(memoryEntries.userId, session.user.id)
    );

  const entries = await query;
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, type, content, metadata } = await req.json();

  if (!projectId || !type || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(memoryEntries).values({
    id,
    projectId,
    userId: session.user.id,
    type,
    content,
    metadata: metadata ?? null,
  });

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("id");

  if (!entryId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await db
    .delete(memoryEntries)
    .where(
      and(eq(memoryEntries.id, entryId), eq(memoryEntries.userId, session.user.id))
    );

  return NextResponse.json({ success: true });
}
