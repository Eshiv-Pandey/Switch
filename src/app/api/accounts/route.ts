import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await db
    .select({
      id: aiAccounts.id,
      provider: aiAccounts.provider,
      accountLabel: aiAccounts.accountLabel,
      isActive: aiAccounts.isActive,
      createdAt: aiAccounts.createdAt,
      // Never return the actual API key
    })
    .from(aiAccounts)
    .where(eq(aiAccounts.userId, session.user.id));

  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { provider, accountLabel, apiKey } = body;

  if (!provider || !accountLabel || !apiKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validProviders = ["claude", "chatgpt", "gemini", "deepseek"];
  if (!validProviders.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(aiAccounts).values({
    id,
    userId: session.user.id,
    provider,
    accountLabel,
    apiKey,
    isActive: true,
  });

  return NextResponse.json({ id, message: "Account added successfully" });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("id");

  if (!accountId) return NextResponse.json({ error: "Missing account ID" }, { status: 400 });

  await db
    .delete(aiAccounts)
    .where(
      and(
        eq(aiAccounts.id, accountId),
        eq(aiAccounts.userId, session.user.id)
      )
    );

  return NextResponse.json({ success: true });
}
