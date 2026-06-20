"use client";

import { useState, useRef } from "react";
import { FileUp, File, Trash2, Loader2, ImageIcon, Code, FileText } from "lucide-react";
import { formatFileSize, formatRelativeTime } from "@/lib/utils";

interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number | null;
  extractedText: string | null;
  createdAt: string;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-pink-400" />;
  if (type.includes("pdf") || type.includes("text")) return <FileText className="w-4 h-4 text-blue-400" />;
  if (type.includes("javascript") || type.includes("typescript") || type.includes("python"))
    return <Code className="w-4 h-4 text-emerald-400" />;
  return <File className="w-4 h-4 text-zinc-400" />;
}

export default function FilesPage() {
  const [files] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("/api/files", { method: "POST", body: formData });
      // Refresh list
    } catch {}
    finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileUp className="w-6 h-6 text-pink-400" />
              Files
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Upload files to make them part of your workspace memory.
            </p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.txt,.md,.py,.js,.ts,.tsx,.jsx,.json,.csv"
              onChange={handleUpload}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-brand-600/20"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
              Upload File
            </label>
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="mb-6 glass rounded-2xl p-8 border-2 border-dashed border-white/10 text-center hover:border-brand-500/30 transition-all cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <FileUp className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">
            Drop files here or <span className="text-brand-400">click to browse</span>
          </p>
          <p className="text-xs text-zinc-700 mt-1">
            Supports: PDF, TXT, MD, Python, JS/TS, JSON, CSV
          </p>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-600">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="glass rounded-xl px-4 py-3.5 flex items-center gap-3 group hover:border-white/8 transition-all"
              >
                <FileIcon type={file.fileType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.fileName}</p>
                  <p className="text-xs text-zinc-600">
                    {file.fileSize ? formatFileSize(file.fileSize) : ""} ·{" "}
                    {formatRelativeTime(file.createdAt)}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setDeleting(file.id);
                    try { await fetch(`/api/files?id=${file.id}`, { method: "DELETE" }); } catch {}
                    finally { setDeleting(null); }
                  }}
                  disabled={deleting === file.id}
                  className="opacity-0 group-hover:opacity-100 transition-all text-zinc-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"
                >
                  {deleting === file.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
