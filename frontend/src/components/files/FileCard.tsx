"use client";

import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  File,
  MoreVertical,
  Eye,
  Download,
  FolderInput,
  Trash2,
} from "lucide-react";
import { formatBytes, formatDate } from "../../lib/utils";
import { FileItem } from "../../types";

interface FileCardProps {
  file: FileItem;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onDownload,
  onMove,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getFileIcon = (mimeType: string, filename: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-blue-400" />;
    }
    if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
      return <Film className="w-5 h-5 text-purple-400" />;
    }
    if (
      mimeType.includes("zip") ||
      mimeType.includes("tar") ||
      filename.endsWith(".zip") ||
      filename.endsWith(".gz")
    ) {
      return <Archive className="w-5 h-5 text-amber-400" />;
    }
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("sheet") ||
      mimeType.includes("text") ||
      filename.endsWith(".pdf") ||
      filename.endsWith(".docx")
    ) {
      return <FileText className="w-5 h-5 text-indigo-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div
      onDoubleClick={() => onPreview(file)}
      className="group relative p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between select-none"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          onClick={() => onPreview(file)}
          className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform"
        >
          {getFileIcon(file.mimeType, file.name)}
        </div>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onPreview(file);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDownload(file);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onMove(file);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(file);
                  }}
                  className="w-full px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div onClick={() => onPreview(file)} className="cursor-pointer">
        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
          {file.originalName || file.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>{formatBytes(file.size)}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {ext}
          </span>
        </div>
      </div>
    </div>
  );
};
