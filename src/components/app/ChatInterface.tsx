"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Repeat2,
  Brain,
  X,
  ChevronDown,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getOpenRouterModelLabel } from "@/lib/ai/openrouter-models";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  modelProvider?: string;
  accountLabel?: string;
  createdAt: string;
}

interface Account {
  id: string;
  provider: string;
  accountLabel: string;
  modelId?: string | null;
}

interface ChatInterfaceProps {
  conversationId: string;
  projectName: string;
  initialMessages?: Message[];
  accounts?: Account[];
  activeAccountId?: string;
  memoryCount?: number;
  fileCount?: number;
}

const PROVIDER_META: Record<string, { name: string; color: string; icon: string }> = {
  claude:   { name: "Claude",   color: "#D97706", icon: "🟠" },
  chatgpt:  { name: "ChatGPT",  color: "#10B981", icon: "🟢" },
  gemini:   { name: "Gemini",   color: "#6366F1", icon: "🔵" },
  deepseek: { name: "DeepSeek", color: "#EC4899", icon: "🩷" },
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
PROVIDER_META.openrouter = { name: "OpenRouter", color: "#14b8a6", icon: "OR" };

function getAccountDisplayName(account?: Account) {
  if (!account) return "";
  if (account.provider === "openrouter") {
    return `${account.accountLabel} - ${getOpenRouterModelLabel(account.modelId)}`;
  }
  return account.accountLabel;
}

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const meta = msg.modelProvider ? PROVIDER_META[msg.modelProvider] : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 group", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      {!isUser && meta && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-1"
          style={{ background: meta.color + "20" }}
        >
          {meta.icon}
        </div>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[75%]", isUser && "items-end")}>
        {/* Provider label */}
        {!isUser && meta && (
          <p className="text-xs text-zinc-600 pl-1" style={{ color: meta.color + "aa" }}>
            {meta.name} · {msg.accountLabel}
          </p>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed relative",
            isUser ? "message-user text-white" : "message-assistant text-zinc-200"
          )}
        >
          {/* Markdown rendering */}
          <div className="prose-dark break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>

          {/* Copy button */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center transition-all text-zinc-400 hover:text-white"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-700 px-1">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator({ provider }: { provider?: string }) {
  const meta = provider ? PROVIDER_META[provider] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3"
    >
      {meta && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
          style={{ background: meta.color + "20" }}
        >
          {meta.icon}
        </div>
      )}
      <div className="message-assistant px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </motion.div>
  );
}

// ─── Switch Modal ─────────────────────────────────────────────────────────────
function SwitchModal({
  accounts,
  currentAccountId,
  onSwitch,
  onClose,
}: {
  accounts: Account[];
  currentAccountId: string;
  onSwitch: (accountId: string) => void;
  onClose: () => void;
}) {
  const byProvider = accounts.reduce(
    (acc, a) => {
      if (!acc[a.provider]) acc[a.provider] = [];
      acc[a.provider].push(a);
      return acc;
    },
    {} as Record<string, Account[]>
  );

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
        className="glass-strong rounded-2xl p-6 w-full max-w-sm border border-white/12 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Switch Model</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Context will transfer automatically</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Context transfer badge */}
        <div className="mb-5 px-3 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-brand-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            <span className="text-brand-300 font-medium">Context package</span> will be generated and injected into the new model.
          </p>
        </div>

        {/* Provider list */}
        <div className="space-y-3">
          {Object.entries(byProvider).map(([provider, accts]) => {
            const meta = PROVIDER_META[provider];
            if (!meta) return null;
            return (
              <div key={provider}>
                <p className="text-xs text-zinc-600 font-medium mb-1.5 flex items-center gap-1.5">
                  <span>{meta.icon}</span>
                  <span style={{ color: meta.color }}>{meta.name}</span>
                </p>
                <div className="space-y-1">
                  {accts.map((acct) => (
                    <button
                      key={acct.id}
                      disabled={acct.id === currentAccountId}
                      onClick={() => { onSwitch(acct.id); onClose(); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                        acct.id === currentAccountId
                          ? "bg-white/4 text-zinc-500 cursor-default border border-white/5"
                          : "text-zinc-300 hover:bg-white/6 hover:text-white border border-transparent hover:border-white/8"
                      )}
                    >
                      <span>{getAccountDisplayName(acct)}</span>
                      {acct.id === currentAccountId ? (
                        <span className="text-xs text-zinc-600 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <Repeat2 className="w-3.5 h-3.5 text-zinc-700" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Chat Interface ──────────────────────────────────────────────────────
export function ChatInterface({
  conversationId,
  projectName,
  initialMessages = [],
  accounts = [],
  activeAccountId,
  memoryCount = 0,
  fileCount = 0,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(activeAccountId ?? accounts[0]?.id ?? "");
  const [showSwitch, setShowSwitch] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentAccount = accounts.find((a) => a.id === currentAccountId);
  const currentMeta = currentAccount ? PROVIDER_META[currentAccount.provider] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || !currentAccountId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    // Auto-resize textarea back to default
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: userMsg.content,
          accountId: currentAccountId,
        }),
      });

      if (!res.ok || !res.body) {
        // Try to extract an error message from the response body
        let errorMessage = "Something went wrong. Please check your API key in Settings → AI Accounts.";
        try {
          const errData = await res.json();
          if (errData?.error) errorMessage = errData.error;
        } catch {}
        throw new Error(errorMessage);
      }

      const assistantId = res.headers.get("X-Message-Id") ?? crypto.randomUUID();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        modelProvider: currentAccount?.provider,
        accountLabel: getAccountDisplayName(currentAccount),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorText = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ ${errorText}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, currentAccountId, conversationId, currentAccount]);

  const handleSwitch = async (newAccountId: string) => {
    setIsSwitching(true);

    // Add a system switch message
    const switchMsg: Message = {
      id: crypto.randomUUID(),
      role: "system",
      content: `Switched to ${getAccountDisplayName(accounts.find((a) => a.id === newAccountId))}. Context has been transferred.`,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, switchMsg]);
    setCurrentAccountId(newAccountId);

    // Notify API to record the transfer
    try {
      await fetch("/api/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          fromAccountId: currentAccountId,
          toAccountId: newAccountId,
        }),
      });
    } catch {}

    setIsSwitching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-bg-elevated/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{projectName}</p>
            {currentMeta && (
              <p className="text-xs flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: currentMeta.color }}
                />
                <span className="text-zinc-500" style={{ color: currentMeta.color + "aa" }}>
                  {currentMeta.name} - {getAccountDisplayName(currentAccount)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Memory badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15 text-xs text-violet-400">
            <Brain className="w-3 h-3" />
            {memoryCount} memories
          </div>

          {/* Switch button */}
          {accounts.length > 0 && (
            <button
              onClick={() => setShowSwitch(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/20 text-brand-300 text-xs font-medium transition-all"
            >
              <Repeat2 className="w-3.5 h-3.5" />
              Switch
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* No accounts configured */}
        {accounts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              No AI account connected
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mb-4">
              Add an API key for Claude, ChatGPT, Gemini, DeepSeek, or OpenRouter to start chatting.
            </p>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Go to Settings → AI Accounts
            </Link>
          </div>
        )}

        {/* Empty state when accounts exist but no messages */}
        {accounts.length > 0 && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
              <Repeat2 className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Start a conversation
            </h3>
            <p className="text-xs text-zinc-600 max-w-xs">
              Ask anything. Your context, files, and memory are ready. Switch models anytime — nothing is lost.
            </p>
            {currentMeta && (
              <div
                className="mt-4 px-3 py-2 rounded-xl text-xs border"
                style={{ borderColor: currentMeta.color + "30", background: currentMeta.color + "10", color: currentMeta.color + "cc" }}
              >
                {currentMeta.icon} {currentMeta.name} - {getAccountDisplayName(currentAccount)}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "system" ? (
            <div
              key={msg.id}
              className="flex items-center justify-center"
            >
              <div className="px-4 py-2 rounded-full bg-white/4 border border-white/8 text-xs text-zinc-500">
                {msg.content}
              </div>
            </div>
          ) : (
            <MessageBubble key={msg.id} msg={msg} />
          )
        )}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <AnimatePresence>
            <TypingIndicator provider={currentAccount?.provider} />
          </AnimatePresence>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4">
        <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder={accounts.length === 0 ? "Add an AI account in Settings to start chatting..." : `Message ${currentMeta?.name ?? "AI"}...`}
            disabled={accounts.length === 0}
            rows={1}
            className={cn(
              "w-full bg-transparent px-4 pt-4 pb-2 text-sm text-white placeholder-zinc-600 resize-none outline-none",
              accounts.length === 0 && "cursor-not-allowed opacity-50"
            )}
            style={{ maxHeight: 160 }}
          />

          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-2">
              <button className="text-zinc-600 hover:text-zinc-400 transition-colors" title="Attach file">
                <Paperclip className="w-4 h-4" />
              </button>
              {fileCount > 0 && (
                <span className="text-xs text-zinc-700">{fileCount} files</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-700">⏎ send · ⇧⏎ newline</p>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming || accounts.length === 0}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  input.trim() && !isStreaming && accounts.length > 0
                    ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30"
                    : "bg-white/5 text-zinc-700 cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Switch Modal */}
      <AnimatePresence>
        {showSwitch && (
          <SwitchModal
            accounts={accounts}
            currentAccountId={currentAccountId}
            onSwitch={handleSwitch}
            onClose={() => setShowSwitch(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
