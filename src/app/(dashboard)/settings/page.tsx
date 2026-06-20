"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  provider: string;
  accountLabel: string;
  isActive: boolean;
  createdAt: string;
}

const PROVIDERS = [
  { id: "claude",     name: "Claude",     color: "#D97706", icon: "🟠", keyHint: "sk-ant-..." },
  { id: "chatgpt",    name: "ChatGPT",    color: "#10B981", icon: "🟢", keyHint: "sk-..." },
  { id: "gemini",     name: "Gemini",     color: "#6366F1", icon: "🔵", keyHint: "AIza..." },
  { id: "deepseek",   name: "DeepSeek",   color: "#EC4899", icon: "🩷", keyHint: "sk-..." },
  { id: "openrouter", name: "OpenRouter", color: "#14b8a6", icon: "🌐", keyHint: "sk-or-v1-..." },
];

function AddAccountModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [accountLabel, setAccountLabel] = useState("Account 1");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, accountLabel, apiKey }),
      });
      if (!res.ok) throw new Error("Failed");
      onAdded();
      onClose();
    } catch {
      setError("Failed to add account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/12 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">Add AI Account</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500">AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all",
                    provider === p.id
                      ? "border-white/20 bg-white/6 text-white"
                      : "border-white/6 text-zinc-500 hover:border-white/12 hover:text-zinc-300"
                  )}
                >
                  <span>{p.icon}</span>
                  <span className="font-medium" style={{ color: provider === p.id ? p.color : undefined }}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500">Account Label</label>
            <input
              type="text"
              value={accountLabel}
              onChange={(e) => setAccountLabel(e.target.value)}
              placeholder="Account 1"
              className="h-11 bg-white/4 rounded-xl px-4 text-sm text-white placeholder-zinc-600 border border-white/8 focus:border-brand-500/40 outline-none transition-all"
              required
            />
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500">
              API Key{" "}
              <span className="text-zinc-700">({selectedProvider.keyHint})</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste your ${selectedProvider.name} API key`}
                className="w-full h-11 bg-white/4 rounded-xl pl-4 pr-11 text-sm text-white placeholder-zinc-600 border border-white/8 focus:border-brand-500/40 outline-none transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="px-3 py-2.5 rounded-xl bg-brand-500/8 border border-brand-500/15 text-xs text-zinc-500">
            🔒 Your API key is stored in your database and used only to make calls to {selectedProvider.name}. It is never shared or logged.
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-zinc-400 text-sm hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!apiKey.trim() || loading}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Account
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  const byProvider = accounts.reduce((acc, a) => {
    if (!acc[a.provider]) acc[a.provider] = [];
    acc[a.provider].push(a);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{ background: "#080808" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1
              className="font-bold text-white"
              style={{ fontSize: "1.6rem", fontFamily: "var(--font-space, var(--font-inter))", letterSpacing: "-0.02em" }}
            >
              Settings
            </h1>
            <p style={{ color: "#71717a", fontSize: "0.875rem", marginTop: 4 }}>Manage your AI accounts and preferences.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
            style={{
              padding: "9px 18px",
              borderRadius: 999,
              background: "#c8f400",
              color: "#080808",
              fontWeight: 700,
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-space, var(--font-inter))",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>

        {/* AI Accounts */}
        <section style={{ borderRadius: 20, padding: "24px", background: "#111", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 16 }}>
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            AI Accounts
            <span className="px-2 py-0.5 rounded-full bg-white/8 text-xs text-zinc-500">
              {accounts.length}
            </span>
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl shimmer" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-zinc-600 mb-3">No AI accounts added yet.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                + Add your first account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {PROVIDERS.map(({ id: provId, name, color, icon }) => {
                const accts = byProvider[provId];
                if (!accts?.length) return null;
                return (
                  <div key={provId}>
                    <p className="text-xs text-zinc-600 font-medium mb-2 flex items-center gap-1.5">
                      {icon} <span style={{ color }}>{name}</span>
                    </p>
                    <div className="space-y-2">
                      {accts.map((acct) => (
                        <div
                          key={acct.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/6 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <div>
                              <p className="text-sm text-white font-medium">{acct.accountLabel}</p>
                              <p className="text-xs text-zinc-600">API key configured · ••••••••</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(acct.id)}
                            disabled={deleting === acct.id}
                            className="opacity-0 group-hover:opacity-100 transition-all text-zinc-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"
                          >
                            {deleting === acct.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Info section */}
        <div style={{ padding: "14px 18px", borderRadius: 14, background: "#111", border: "1px solid rgba(255,255,255,0.07)", fontSize: "0.78rem", color: "#71717a", lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: "#a1a1aa", marginBottom: 4 }}>How Switch uses your API keys</p>
          <p>
            Your API keys are stored in your local database and used directly to make requests to each provider.
            Switch never proxies or logs your API calls. Keys are never shared with third parties.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddAccountModal
            onClose={() => setShowAddModal(false)}
            onAdded={fetchAccounts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
