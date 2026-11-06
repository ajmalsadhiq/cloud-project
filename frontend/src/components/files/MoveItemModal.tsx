"use client";

import React, { useState } from "react";
import { FolderInput, X, Folder, Home, Loader2 } from "lucide-react";
import { FileItem, FolderItem } from "../../types";

interface MoveItemModalProps {
  file: FileItem | null;
  folders: FolderItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileId: string, targetFolderId: string | null) => Promise<void>;
}

export const MoveItemModal: React.FC<MoveItemModalProps> = ({
  file,
  folders,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit(file.id, selectedFolderId);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to move file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderInput className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Move File</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Select the destination directory for <span className="text-white font-semibold">{file.originalName || file.name}</span>.
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {/* Root Option */}
            <div
              onClick={() => setSelectedFolderId(null)}
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                selectedFolderId === null
                  ? "bg-blue-600/15 border-blue-500 text-blue-400"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-semibold">Root Directory</span>
            </div>

            {/* Folder List */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedFolderId === folder.id
                    ? "bg-blue-600/15 border-blue-500 text-blue-400"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="text-xs font-medium truncate">{folder.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Moving...</span>
                </>
              ) : (
                <span>Confirm Move</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
