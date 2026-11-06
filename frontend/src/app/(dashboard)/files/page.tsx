"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FolderPlus,
  UploadCloud,
  Search,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  FolderTree,
  FileText,
  RefreshCw,
  Trash2,
  Download,
  Eye,
  FolderInput,
} from "lucide-react";
import apiClient from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { ApiResponse, FileItem, FolderItem } from "../../../types";
import { FolderBreadcrumbs, Breadcrumb } from "../../../components/folders/FolderBreadcrumbs";
import { FolderCard } from "../../../components/folders/FolderCard";
import { CreateFolderModal } from "../../../components/folders/CreateFolderModal";
import { RenameFolderModal } from "../../../components/folders/RenameFolderModal";
import { DragDropZone } from "../../../components/files/DragDropZone";
import { FileCard } from "../../../components/files/FileCard";
import { FilePreviewModal } from "../../../components/files/FilePreviewModal";
import { MoveItemModal } from "../../../components/files/MoveItemModal";
import { formatBytes, formatDate } from "../../../lib/utils";

export default function FilesPage() {
  const { user, refreshUser } = useAuth();

  // Navigation & State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "images" | "documents" | "media" | "archives">("all");
  const [sortBy, setSortBy] = useState<"name" | "size" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState<FolderItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [moveFileTarget, setMoveFileTarget] = useState<FileItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load folders
      const folderParams = new URLSearchParams();
      if (currentFolderId) {
        folderParams.append("parentFolderId", currentFolderId);
      }
      if (searchTerm) {
        folderParams.append("search", searchTerm);
      }

      const foldersRes = await apiClient.get<ApiResponse<FolderItem[]>>(
        `/folders?${folderParams.toString()}`
      );
      if (foldersRes.data?.success && foldersRes.data.data) {
        setFolders(foldersRes.data.data);
      }

      // Load files
      const fileParams = new URLSearchParams();
      if (currentFolderId) {
        fileParams.append("folderId", currentFolderId);
      }
      if (searchTerm) {
        fileParams.append("search", searchTerm);
      }
      if (selectedType !== "all") {
        fileParams.append("type", selectedType);
      }
      fileParams.append("sortBy", sortBy);
      fileParams.append("sortOrder", sortOrder);

      const filesRes = await apiClient.get<ApiResponse<FileItem[]>>(
        `/files?${fileParams.toString()}`
      );
      if (filesRes.data?.success && filesRes.data.data) {
        setFiles(filesRes.data.data);
      }

      // If inside a folder, load breadcrumb path
      if (currentFolderId) {
        const hierRes = await apiClient.get<
          ApiResponse<{ folder: FolderItem; breadcrumbs: Breadcrumb[] }>
        >(`/folders/${currentFolderId}`);
        if (hierRes.data?.success && hierRes.data.data) {
          setBreadcrumbs(hierRes.data.data.breadcrumbs);
        }
      } else {
        setBreadcrumbs([]);
      }
    } catch (err) {
      console.error("Failed to load files and folders", err);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, searchTerm, selectedType, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Folder Actions
  const handleCreateFolder = async (name: string) => {
    await apiClient.post("/folders", {
      name,
      parentFolderId: currentFolderId,
    });
    await loadData();
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    await apiClient.patch(`/folders/${folderId}`, { name: newName });
    await loadData();
  };

  const handleDeleteFolder = async (folder: FolderItem) => {
    if (confirm(`Are you sure you want to delete folder "${folder.name}" and all its contents?`)) {
      await apiClient.delete(`/folders/${folder.id}`);
      await refreshUser();
      await loadData();
    }
  };

  // File Actions
  const handleDownloadFile = async (file: FileItem) => {
    try {
      const res = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(
        `/files/${file.id}/download`
      );
      if (res.data?.success && res.data.data) {
        const a = document.createElement("a");
        a.href = res.data.data.downloadUrl;
        a.download = file.originalName || file.name;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (confirm(`Are you sure you want to delete "${file.originalName || file.name}"?`)) {
      await apiClient.delete(`/files/${file.id}`);
      await refreshUser();
      await loadData();
    }
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string | null) => {
    await apiClient.patch(`/files/${fileId}/move`, { targetFolderId });
    await loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cloud Explorer</h1>
          <div className="mt-1">
            <FolderBreadcrumbs
              breadcrumbs={breadcrumbs}
              onNavigate={(id) => setCurrentFolderId(id)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
              showUploadZone
                ? "bg-slate-800 text-white border border-slate-700"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{showUploadZone ? "Hide Upload" : "Upload Files"}</span>
          </button>

          <button
            onClick={() => setCreateFolderOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Drag-and-Drop Upload Section */}
      {showUploadZone && (
        <div className="animate-in fade-in duration-200">
          <DragDropZone
            currentFolderId={currentFolderId}
            onUploadSuccess={async () => {
              await refreshUser();
              await loadData();
            }}
          />
        </div>
      )}

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(["all", "images", "documents", "media", "archives"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors cursor-pointer ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in folder..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="createdAt" className="bg-slate-900">Date</option>
              <option value="name" className="bg-slate-900">Name</option>
              <option value="size" className="bg-slate-900">Size</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-slate-800 text-blue-400" : "text-slate-500 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Folders ({folders.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={(id) => setCurrentFolderId(id)}
                onRename={(f) => setRenameFolderTarget(f)}
                onDelete={handleDeleteFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Files ({files.length})
        </h3>

        {files.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/20">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No files in this folder</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              Upload files or drag them directly into the zone above.
            </p>
            <button
              onClick={() => setShowUploadZone(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload to this folder</span>
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onPreview={(f) => setPreviewFile(f)}
                onDownload={handleDownloadFile}
                onMove={(f) => setMoveFileTarget(f)}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div
                        onClick={() => setPreviewFile(file)}
                        className="cursor-pointer hover:text-blue-400 truncate max-w-xs"
                      >
                        {file.originalName || file.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{formatBytes(file.size)}</td>
                    <td className="py-3 px-4 text-slate-400 capitalize">{file.mimeType.split("/")[1] || "file"}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(file.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMoveFileTarget(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Move"
                        >
                          <FolderInput className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onSubmit={handleCreateFolder}
      />

      <RenameFolderModal
        folder={renameFolderTarget}
        isOpen={!!renameFolderTarget}
        onClose={() => setRenameFolderTarget(null)}
        onSubmit={handleRenameFolder}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        userName={user?.name}
      />

      <MoveItemModal
        file={moveFileTarget}
        folders={folders}
        isOpen={!!moveFileTarget}
        onClose={() => setMoveFileTarget(null)}
        onSubmit={handleMoveFile}
      />
    </div>
  );
}
