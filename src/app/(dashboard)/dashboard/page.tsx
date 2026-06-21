import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, conversations, memoryEntries, uploadedFiles, aiAccounts } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { MessageSquare, Brain, FileUp, Repeat2, Zap, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const PROVIDER_COLORS: Record<string, string> = {
  claude: "#d97706",
  chatgpt: "#10b981",
  gemini: "#c8f400",
  deepseek: "#ff3cac",
  openrouter: "#14b8a6",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [
    projectCount,
    convoCount,
    memoryCount,
    fileCount,
    accountCount,
    recentProjects,
    userAccounts,
  ] = await Promise.all([
    db.select({ count: count() }).from(projects).where(eq(projects.userId, userId)),
    db.select({ count: count() }).from(conversations).where(eq(conversations.userId, userId)),
    db.select({ count: count() }).from(memoryEntries).where(eq(memoryEntries.userId, userId)),
    db.select({ count: count() }).from(uploadedFiles).where(eq(uploadedFiles.userId, userId)),
    db.select({ count: count() }).from(aiAccounts).where(eq(aiAccounts.userId, userId)),
    db.select().from(projects).where(eq(projects.userId, userId)).limit(6),
    db.select().from(aiAccounts).where(eq(aiAccounts.userId, userId)).limit(10),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const pCount = projectCount[0]?.count ?? 0;
  const aCount = accountCount[0]?.count ?? 0;

  const cardBase: React.CSSProperties = { borderRadius: 18, padding: "20px 22px", position: "relative", overflow: "hidden" };

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{ background: "#080808" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h1
            className="font-bold text-white"
            style={{ fontSize: "1.6rem", fontFamily: "var(--font-space, var(--font-inter))", letterSpacing: "-0.02em" }}
          >
            Good {getGreeting()}, {firstName} 👋
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.875rem", marginTop: 4 }}>
            Your AI workspace is ready. Switch models anytime.
          </p>
        </div>

        {/* ── Setup banner (if no accounts) ─────────────────────── */}
        {aCount === 0 && (
          <Link
            href="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              ...cardBase,
              background: "rgba(200,244,0,0.06)",
              border: "1px solid rgba(200,244,0,0.2)",
              marginBottom: 20,
              textDecoration: "none",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#c8f400", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap style={{ width: 18, height: 18, color: "#080808" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "#c8f400", fontSize: "0.875rem" }}>Add your first AI account to start chatting</p>
              <p style={{ color: "#71717a", fontSize: "0.8rem", marginTop: 2 }}>Go to Settings → Add Account. Supports Claude, ChatGPT, Gemini, DeepSeek.</p>
            </div>
            <ArrowRight style={{ width: 16, height: 16, color: "#c8f400", flexShrink: 0 }} />
          </Link>
        )}

        {/* ── Stat bento row ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {/* Projects — lime */}
          <div style={{ ...cardBase, background: "#c8f400", color: "#080808" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6 }}>Projects</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-space, var(--font-inter))", lineHeight: 1.1, marginTop: 6 }}>{pCount}</p>
          </div>

          {/* Conversations — dark */}
          <div style={{ ...cardBase, background: "#111", border: "1px solid rgba(255,255,255,0.07)", color: "#fafafa" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#52525b" }}>Chats</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-space, var(--font-inter))", lineHeight: 1.1, marginTop: 6 }}>{convoCount[0]?.count ?? 0}</p>
          </div>

          {/* Memory — violet */}
          <div style={{ ...cardBase, background: "#7b2fbe", color: "#fff" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>Memories</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-space, var(--font-inter))", lineHeight: 1.1, marginTop: 6 }}>{memoryCount[0]?.count ?? 0}</p>
          </div>

          {/* AI accounts — pink */}
          <div style={{ ...cardBase, background: "#ff3cac", color: "#fff" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>AI Accounts</p>
            <p style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "var(--font-space, var(--font-inter))", lineHeight: 1.1, marginTop: 6 }}>{aCount}</p>
          </div>
        </div>

        {/* ── Bottom two-column layout ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Projects grid */}
          <div style={{ ...cardBase, background: "#111", border: "1px solid rgba(255,255,255,0.07)", padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>Projects</h2>
              <Link href="/projects" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#c8f400", textDecoration: "none", fontWeight: 600 }}>
                <Plus style={{ width: 12, height: 12 }} />
                New
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: "0.8rem", color: "#52525b", marginBottom: 8 }}>No projects yet.</p>
                <Link href="/projects" style={{ fontSize: "0.78rem", color: "#c8f400", textDecoration: "none" }}>
                  Create your first →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recentProjects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/chat/${proj.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{proj.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fafafa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{proj.name}</p>
                      {proj.description && (
                        <p style={{ fontSize: "0.7rem", color: "#52525b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{proj.description}</p>
                      )}
                    </div>
                    <MessageSquare style={{ width: 12, height: 12, color: "#3f3f46", flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column: AI accounts + quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* AI Accounts */}
            <div style={{ ...cardBase, background: "#111", border: "1px solid rgba(255,255,255,0.07)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem" }}>AI Accounts</h2>
                <Link href="/settings" style={{ fontSize: "0.75rem", color: "#c8f400", textDecoration: "none", fontWeight: 600 }}>
                  Manage
                </Link>
              </div>

              {userAccounts.length === 0 ? (
                <Link
                  href="/settings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px dashed rgba(200,244,0,0.25)",
                    background: "rgba(200,244,0,0.04)",
                    textDecoration: "none",
                  }}
                >
                  <Plus style={{ width: 14, height: 14, color: "#c8f400" }} />
                  <span style={{ fontSize: "0.8rem", color: "#c8f400", fontWeight: 600 }}>Connect an AI account</span>
                </Link>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {userAccounts.map((acct) => {
                    const color = PROVIDER_COLORS[acct.provider] ?? "#6366f1";
                    return (
                      <div
                        key={acct.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: `${color}0d`,
                          border: `1px solid ${color}22`,
                        }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fafafa" }}>{acct.accountLabel}</p>
                          <p style={{ fontSize: "0.68rem", color: "#52525b", textTransform: "capitalize" }}>{acct.provider}</p>
                        </div>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ ...cardBase, background: "#111", border: "1px solid rgba(255,255,255,0.07)", padding: 22 }}>
              <h2 style={{ fontWeight: 700, color: "#fff", fontSize: "0.875rem", marginBottom: 12 }}>Quick Start</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/projects", icon: Plus, label: "New Project",   sub: "Create a workspace",      color: "#c8f400" },
                  { href: "/settings",     icon: Repeat2, label: "Add AI Account", sub: "Claude, GPT, Gemini…", color: "#ff3cac" },
                  { href: "/memory",       icon: Brain, label: "View Memory",   sub: "Decisions & goals",      color: "#7b2fbe" },
                ].map(({ href, icon: Icon, label, sub, color }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 13, height: 13, color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fafafa" }}>{label}</p>
                      <p style={{ fontSize: "0.68rem", color: "#52525b" }}>{sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
