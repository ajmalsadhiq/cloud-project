"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  ExternalLink,
  HardDrive,
  Calendar,
  FileCode,
  Tag,
  User as UserIcon,
  Loader2,
  FileText,
} from "lucide-react";
import apiClient from "../../lib/api";
import { formatBytes, formatDate } from "../../lib/utils";
import { ApiResponse, FileItem } from "../../types";

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  userName = "Owner",
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (file && isOpen) {
      const fetchDownloadUrl = async () => {
        try {
          setLoadingUrl(true);
          const res = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(
            `/files/${file.id}/download`
          );
          if (res.data?.success && res.data.data) {
            setDownloadUrl(res.data.data.downloadUrl);
          }
        } catch (err) {
          console.error("Failed to fetch presigned URL", err);
        } finally {
          setLoadingUrl(false);
        }
      };

      fetchDownloadUrl();
    } else {
      setDownloadUrl(null);
    }
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf" || file.name.endsWith(".pdf");
  const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.originalName || file.name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] uppercase font-bold">
              {ext}
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-md">
              {file.originalName || file.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loadingUrl || !downloadUrl}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loadingUrl ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left preview, Right file details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Preview Panel */}
          <div className="flex-1 bg-slate-950/60 p-6 flex items-center justify-center overflow-auto min-h-[300px]">
            {loadingUrl ? (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Generating secure presigned signature...</span>
              </div>
            ) : isImage && downloadUrl ? (
              <img
                src={downloadUrl}
                alt={file.name}
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-lg"
              />
            ) : isPdf && downloadUrl ? (
              <iframe
                src={downloadUrl}
                title={file.name}
                className="w-full h-[60vh] rounded-xl border border-slate-800"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">Preview not available</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Direct in-browser preview is supported for Images &amp; PDFs. Use Download to view this file locally.
                  </p>
                </div>
                {downloadUrl && (
                  <button
                    onClick={handleDownload}
                    className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {formatBytes(file.size)}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Metadata Inspector Drawer */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 p-6 space-y-4 overflow-y-auto bg-slate-900/60">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              File Information
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <FileCode className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500 block text-[10px]">Filename</span>
                  <span className="text-slate-200 font-medium truncate block">
                    {file.originalName || file.name}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Tag className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">File Extension / MIME</span>
                  <span className="text-slate-200 font-mono text-[11px] block">
                    {ext} &bull; {file.mimeType}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <HardDrive className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">File Size</span>
                  <span className="text-slate-200 font-mono block">
                    {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Upload Date</span>
                  <span className="text-slate-200 block">{formatDate(file.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <UserIcon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Owner</span>
                  <span className="text-slate-200 block">{userName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px]">AWS S3 Storage Key</span>
                <span className="text-slate-400 font-mono text-[10px] break-all block mt-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {file.s3Key}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
