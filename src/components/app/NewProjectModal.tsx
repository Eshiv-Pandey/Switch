"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJIS = ["📁", "🎯", "🔢", "💡", "📄", "🚀", "🔬", "🎓", "💼", "🏗️", "🌱", "⚡"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6", "#06b6d4", "#f97316"];

interface NewProjectModalProps {
  userId: string;
  label?: string;
  asCard?: boolean;
}

export function NewProjectModal({ userId, label = "New Project", asCard }: NewProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState("#6366f1");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description, emoji, color }),
        });
        if (!res.ok) throw new Error("Failed to create project");
        const { id } = await res.json();
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/chat/${id}`);
        router.refresh();
      } catch {
        setError("Failed to create project. Please try again.");
      }
    });
  };

  const trigger = asCard ? (
    <button
      onClick={() => setOpen(true)}
      className="glass rounded-xl p-5 border-dashed border border-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 min-h-[140px]"
    >
      <Plus className="w-6 h-6" />
      <span className="text-sm">New Project</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all shadow-lg shadow-brand-600/20"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <>
      {trigger}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white">Create Project</h2>
                <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Emoji & Name row */}
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-600">Icon</label>
                    <div className="relative group">
                      <button
                        type="button"
                        className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center text-2xl hover:border-white/20 transition-all"
                      >
                        {emoji}
                      </button>
                      {/* Emoji picker dropdown */}
                      <div className="absolute left-0 top-full mt-1 z-10 glass-strong rounded-xl p-2 border border-white/10 grid grid-cols-6 gap-1 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all shadow-xl">
                        {EMOJIS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => setEmoji(e)}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-all",
                              emoji === e && "bg-white/10"
                            )}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs text-zinc-600">Project name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Placement Prep"
                      className="h-12 bg-white/4 rounded-xl px-4 text-sm text-white placeholder-zinc-600 border border-white/8 focus:border-brand-500/40 focus:bg-white/6 outline-none transition-all"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-600">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    rows={2}
                    className="bg-white/4 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 border border-white/8 focus:border-brand-500/40 focus:bg-white/6 outline-none transition-all resize-none"
                  />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-600">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          color === c && "ring-2 ring-white/50 scale-110"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-zinc-400 text-sm hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || isPending}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
