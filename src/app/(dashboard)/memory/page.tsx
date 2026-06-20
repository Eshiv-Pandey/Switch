"use client";

import { useState, useEffect } from "react";
import { Brain, Trash2, Loader2, Filter } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface MemoryEntry {
  id: string;
  projectId: string;
  type: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  summary:    { label: "Summary",    color: "text-blue-400",   bg: "bg-blue-500/10" },
  decision:   { label: "Decision",   color: "text-amber-400",  bg: "bg-amber-500/10" },
  todo:       { label: "To-do",      color: "text-emerald-400", bg: "bg-emerald-500/10" },
  goal:       { label: "Goal",       color: "text-violet-400", bg: "bg-violet-500/10" },
  preference: { label: "Preference", color: "text-pink-400",   bg: "bg-pink-500/10" },
  file:       { label: "File",       color: "text-sky-400",    bg: "bg-sky-500/10" },
};

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMemory = async () => {
    try {
      const res = await fetch("/api/memory");
      const data = await res.json();
      setEntries(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMemory(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/memory?id=${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  const filtered = filter ? entries.filter((e) => e.type === filter) : entries;
  const types = [...new Set(entries.map((e) => e.type))];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-violet-400" />
              Memory
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {entries.length} entries stored across all projects.
            </p>
          </div>
        </div>

        {/* Filter pills */}
        {types.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter(null)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                !filter
                  ? "bg-white/8 border-white/15 text-white"
                  : "border-white/5 text-zinc-600 hover:text-zinc-400"
              )}
            >
              <Filter className="w-3 h-3" />
              All ({entries.length})
            </button>
            {types.map((type) => {
              const meta = TYPE_META[type];
              const count = entries.filter((e) => e.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type === filter ? null : type)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    filter === type
                      ? `${meta?.bg} border-transparent ${meta?.color}`
                      : "border-white/5 text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {meta?.label ?? type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border border-dashed border-white/10">
            <Brain className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">No memory entries yet</h3>
            <p className="text-sm text-zinc-600">
              Memory is built automatically as you use Switch. Start a conversation to build your memory.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const meta = TYPE_META[entry.type] ?? { label: entry.type, color: "text-zinc-400", bg: "bg-zinc-500/10" };
              return (
                <div
                  key={entry.id}
                  className="glass rounded-xl px-4 py-3.5 flex items-start gap-3 group hover:border-white/8 transition-all"
                >
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-xs font-medium shrink-0 mt-0.5",
                      meta.bg,
                      meta.color
                    )}
                  >
                    {meta.label}
                  </span>
                  <p className="flex-1 text-sm text-zinc-300 leading-relaxed">{entry.content}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-700 hidden group-hover:block">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleting === entry.id}
                      className="opacity-0 group-hover:opacity-100 transition-all text-zinc-700 hover:text-red-400 p-1 rounded"
                    >
                      {deleting === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
