"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Repeat2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  LogOut,
  Brain,
  Zap,
} from "lucide-react";

interface SidebarUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

interface AiAccountItem {
  id: string;
  provider: string;
  accountLabel: string;
  isActive: boolean;
}

interface ProjectItem {
  id: string;
  name: string;
  emoji: string;
  color?: string | null;
}

interface AppSidebarProps {
  user: SidebarUser;
  accounts?: AiAccountItem[];
  projects?: ProjectItem[];
  activeAccountId?: string;
  onAccountSelect?: (accountId: string) => void;
}

const PROVIDER_META = {
  claude:     { name: "Claude",     color: "#d97706" },
  chatgpt:    { name: "ChatGPT",    color: "#10b981" },
  gemini:     { name: "Gemini",     color: "#c8f400" },
  deepseek:   { name: "DeepSeek",   color: "#ff3cac" },
  openrouter: { name: "OpenRouter", color: "#14b8a6" },
} as const;

type ProviderKey = keyof typeof PROVIDER_META;

export function AppSidebar({
  user,
  accounts = [],
  projects = [],
  activeAccountId,
  onAccountSelect,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set(["gemini", "claude", "chatgpt"])
  );
  const [selectedAccount, setSelectedAccount] = useState(
    activeAccountId ?? accounts[0]?.id ?? ""
  );
  const [collapsed, setCollapsed] = useState(false);

  // Group accounts by provider
  const byProvider = accounts.reduce(
    (acc, acct) => {
      if (!acc[acct.provider]) acc[acct.provider] = [];
      acc[acct.provider].push(acct);
      return acc;
    },
    {} as Record<string, AiAccountItem[]>
  );

  const toggleProvider = (provider: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) next.delete(provider);
      else next.add(provider);
      return next;
    });
  };

  const handleSelectAccount = (id: string) => {
    setSelectedAccount(id);
    onAccountSelect?.(id);
  };

  const activeAccount = accounts.find((a) => a.id === selectedAccount) ?? accounts[0];
  const activeMeta = activeAccount
    ? PROVIDER_META[activeAccount.provider as ProviderKey]
    : null;

  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? 56 : 240,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#0d0d0d",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    transition: "width 0.25s ease",
    overflow: "hidden",
  };

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 10,
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    color: active ? "#fafafa" : "#71717a",
    background: active ? "rgba(200,244,0,0.08)" : "transparent",
    border: active ? "1px solid rgba(200,244,0,0.15)" : "1px solid transparent",
    textDecoration: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
  });

  return (
    <aside style={sidebarStyle}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: "14px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#c8f400", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Repeat2 style={{ width: 14, height: 14, color: "#080808" }} />
            </div>
            <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", letterSpacing: "-0.01em" }}>Switch</span>
          </Link>
        )}
        {collapsed && (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#c8f400", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Repeat2 style={{ width: 14, height: 14, color: "#080808" }} />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ color: "#52525b", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex" }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{ margin: "8px auto 0", color: "#52525b", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
        >
          <ChevronDown style={{ width: 14, height: 14, transform: "rotate(-90deg)" }} />
        </button>
      )}

      {!collapsed && (
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: "auto", padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Active model badge */}
          {activeMeta && activeAccount && (
            <div
              style={{
                marginBottom: 8,
                padding: "8px 10px",
                borderRadius: 12,
                border: `1px solid ${activeMeta.color}33`,
                background: `${activeMeta.color}10`,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: activeMeta.color, flexShrink: 0 }} className="animate-pulse" />
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: activeMeta.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activeMeta.name} · {activeAccount.accountLabel}
                </p>
                <p style={{ fontSize: "0.65rem", color: "#52525b" }}>Active model</p>
              </div>
            </div>
          )}

          {/* Nav */}
          <Link href="/dashboard" style={navItemStyle(pathname === "/dashboard")}>
            <LayoutDashboard style={{ width: 15, height: 15, flexShrink: 0 }} />
            Dashboard
          </Link>
          <Link href="/memory" style={navItemStyle(pathname.startsWith("/memory"))}>
            <Brain style={{ width: 15, height: 15, flexShrink: 0 }} />
            Memory
          </Link>

          {/* Divider */}
          <div style={{ margin: "10px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }} />

          {/* Projects */}
          <p style={{ fontSize: "0.65rem", color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 4, marginBottom: 4 }}>
            Projects
          </p>

          {projects.length === 0 ? (
            <div style={{ padding: "12px 10px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.08)", textAlign: "center" }}>
              <p style={{ fontSize: "0.72rem", color: "#52525b" }}>No projects yet</p>
            </div>
          ) : (
            projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/chat/${proj.id}`}
                style={{
                  ...navItemStyle(pathname === `/chat/${proj.id}`),
                  gap: 7,
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>{proj.emoji}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj.name}</span>
              </Link>
            ))
          )}

          <Link
            href="/projects"
            style={{ ...navItemStyle(false), color: "#52525b", fontSize: "0.75rem" }}
          >
            <Plus style={{ width: 13, height: 13, flexShrink: 0 }} />
            New Project
          </Link>

          {/* Divider */}
          <div style={{ margin: "10px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }} />

          {/* AI Models */}
          <p style={{ fontSize: "0.65rem", color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 4, marginBottom: 4 }}>
            AI Models
          </p>

          {accounts.length === 0 ? (
            <div style={{ padding: "12px 10px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.08)", textAlign: "center" }}>
              <p style={{ fontSize: "0.72rem", color: "#52525b" }}>No AI accounts</p>
              <Link href="/settings" style={{ fontSize: "0.72rem", color: "#c8f400", display: "block", marginTop: 4 }}>Add one →</Link>
            </div>
          ) : (
            Object.entries(byProvider).map(([provider, accts]) => {
              const meta = PROVIDER_META[provider as ProviderKey];
              if (!meta) return null;
              const isExpanded = expandedProviders.has(provider);

              return (
                <div key={provider}>
                  <button
                    onClick={() => toggleProvider(provider)}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 8, width: "100%", background: "none", border: "none", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: "left", fontSize: "0.78rem", fontWeight: 600, color: meta.color }}>{meta.name}</span>
                    <span style={{ fontSize: "0.7rem", color: "#52525b" }}>{accts.length}</span>
                    <ChevronDown style={{ width: 12, height: 12, color: "#52525b", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: "hidden" }}
                      >
                        {accts.map((acct) => {
                          const isSelected = selectedAccount === acct.id;
                          return (
                            <button
                              key={acct.id}
                              onClick={() => handleSelectAccount(acct.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                padding: "5px 10px 5px 24px",
                                borderRadius: 7,
                                width: "100%",
                                background: isSelected ? "rgba(255,255,255,0.04)" : "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                color: isSelected ? "#fafafa" : "#71717a",
                                transition: "all 0.15s",
                              }}
                            >
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? meta.color : "#3f3f46", flexShrink: 0 }} />
                              <span style={{ flex: 1, textAlign: "left" }}>{acct.accountLabel}</span>
                              {isSelected && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80" }} className="animate-pulse" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}

          <Link
            href="/settings"
            style={{ ...navItemStyle(false), color: "#52525b", fontSize: "0.75rem", marginTop: 2 }}
          >
            <Plus style={{ width: 13, height: 13, flexShrink: 0 }} />
            Add Account
          </Link>
        </div>
      )}

      {/* ── User footer ────────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "10px 10px", flexShrink: 0 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 10, cursor: "default" }}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ""} style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#c8f400", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#080808", flexShrink: 0 }}>
                {(user.name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.75rem", color: "#d4d4d8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name ?? "User"}
              </p>
              <p style={{ fontSize: "0.65rem", color: "#52525b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: window.location.origin + "/" })}
              title="Sign out"
              style={{ color: "#52525b", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
            >
              <LogOut style={{ width: 13, height: 13 }} />
            </button>
          </div>

          <Link href="/settings" style={navItemStyle(pathname === "/settings")}>
            <Settings style={{ width: 13, height: 13, flexShrink: 0 }} />
            Settings
          </Link>
        </div>
      )}
    </aside>
  );
}
