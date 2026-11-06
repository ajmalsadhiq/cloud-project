"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderTree, FolderPlus, ArrowRight, Folder } from "lucide-react";
import apiClient from "../../../lib/api";
import { ApiResponse, FolderItem } from "../../../types";
import { CreateFolderModal } from "../../../components/folders/CreateFolderModal";
import { formatDate } from "../../../lib/utils";

export default function FoldersPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<FolderItem[]>>("/folders");
      if (res.data?.success && res.data.data) {
        setFolders(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load folders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCreate = async (name: string) => {
    await apiClient.post("/folders", { name, parentFolderId: null });
    await loadFolders();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Virtual Folders</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize your cloud files into logical hierarchies with breadcrumb navigation.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Root Folder</span>
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <FolderTree className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No folders created</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create folders to categorize your images, documents, and project assets.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium inline-flex items-center gap-2 shadow-md"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create First Folder</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Link
              key={folder.id}
              href="/dashboard/files"
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Folder className="w-5 h-5 fill-blue-500/20" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {folder.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {folder.itemCount || 0} items &bull; Created {formatDate(folder.createdAt)}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}

      <CreateFolderModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
