"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import apiClient from "../../lib/api";
import { formatBytes } from "../../lib/utils";
import { ApiResponse, FileItem } from "../../types";

interface UploadingFile {
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "confirming" | "completed" | "error";
  errorMessage?: string;
}

interface DragDropZoneProps {
  currentFolderId: string | null;
  onUploadSuccess: () => void;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  currentFolderId,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const newItems: UploadingFile[] = files.map((f) => ({
      name: f.name,
      size: f.size,
      progress: 0,
      status: "pending",
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);

    // Process each file sequentially or in parallel
    for (const file of files) {
      await uploadSingleFile(file);
    }

    onUploadSuccess();
  };

  const uploadSingleFile = async (file: File) => {
    const updateStatus = (
      status: UploadingFile["status"],
      progress: number,
      errorMessage?: string
    ) => {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.name === file.name
            ? { ...item, status, progress, errorMessage }
            : item
        )
      );
    };

    try {
      updateStatus("uploading", 10);

      // Step 1: Request presigned S3 upload URL from CloudVault API
      const urlRes = await apiClient.post<
        ApiResponse<{
          uploadUrl: string;
          s3Key: string;
          folderId: string | null;
        }>
      >("/files/upload-url", {
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        folderId: currentFolderId,
      });

      if (!urlRes.data?.success || !urlRes.data.data) {
        throw new Error(urlRes.data?.error?.message || "Failed to initiate S3 upload");
      }

      const { uploadUrl, s3Key } = urlRes.data.data;
      updateStatus("uploading", 40);

      // Step 2: Upload file contents directly to S3 (or mock upload)
      if (!uploadUrl.includes("s3-upload-mock")) {
        // Direct PUT to Amazon S3
        await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });
      }

      updateStatus("confirming", 80);

      // Step 3: Register file metadata in MongoDB
      const confirmRes = await apiClient.post<ApiResponse<FileItem>>(
        "/files/confirm-upload",
        {
          name: file.name,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          s3Key,
          folderId: currentFolderId,
        }
      );

      if (!confirmRes.data?.success) {
        throw new Error(confirmRes.data?.error?.message || "Failed to confirm file upload");
      }

      updateStatus("completed", 100);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        "Upload failed. Check quota or network.";
      updateStatus("error", 0, msg);
    }
  };

  const removeQueueItem = (filename: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.name !== filename));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-white">
            <span>Drop files here or </span>
            <span className="text-blue-400 hover:underline">browse to upload</span>
          </div>
          <p className="text-xs text-slate-500">
            Supports PDF, PNG, JPG, DOCX, XLSX, TXT, ZIP up to 100 MB per file. Direct to AWS S3.
          </p>
        </div>
      </div>

      {/* Active Upload Queue Status */}
      {uploadQueue.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Upload Queue ({uploadQueue.length})</span>
            <button
              onClick={() => setUploadQueue([])}
              className="text-[11px] text-slate-500 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2">
            {uploadQueue.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-slate-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{formatBytes(item.size)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "uploading" && (
                    <div className="flex items-center gap-2 text-blue-400 text-[11px]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Streaming to S3...</span>
                    </div>
                  )}

                  {item.status === "confirming" && (
                    <div className="flex items-center gap-2 text-indigo-400 text-[11px]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Registering metadata...</span>
                    </div>
                  )}

                  {item.status === "completed" && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved</span>
                    </div>
                  )}

                  {item.status === "error" && (
                    <div className="flex items-center gap-1 text-red-400 text-[11px]" title={item.errorMessage}>
                      <AlertCircle className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{item.errorMessage}</span>
                    </div>
                  )}

                  <button
                    onClick={() => removeQueueItem(item.name)}
                    className="p-1 rounded-lg text-slate-600 hover:text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
