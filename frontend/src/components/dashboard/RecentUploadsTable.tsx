"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  File,
  ArrowRight,
  UploadCloud,
  Clock,
} from "lucide-react";
import { formatBytes, formatDate } from "../../lib/utils";

interface RecentUploadItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  folderId: string | null;
}

interface RecentUploadsTableProps {
  files: RecentUploadItem[];
  onUploadClick?: () => void;
}

export const RecentUploadsTable: React.FC<RecentUploadsTableProps> = ({
  files,
  onUploadClick,
}) => {
  const getFileIcon = (mimeType: string, filename: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4 text-blue-400" />;
    }
    if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
      return <Film className="w-4 h-4 text-purple-400" />;
    }
    if (
      mimeType.includes("zip") ||
      mimeType.includes("tar") ||
      filename.endsWith(".zip") ||
      filename.endsWith(".gz")
    ) {
      return <Archive className="w-4 h-4 text-amber-400" />;
    }
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("sheet") ||
      mimeType.includes("text") ||
      filename.endsWith(".pdf") ||
      filename.endsWith(".docx")
    ) {
      return <FileText className="w-4 h-4 text-indigo-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest files uploaded to your cloud storage
          </p>
        </div>

        <Link
          href="/dashboard/files"
          className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Files</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {files.length === 0 ? (
        <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No uploads recorded yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
            Upload files using drag-and-drop or the upload button to begin tracking your cloud storage.
          </p>
          <Link
            href="/dashboard/files"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Go to Files Manager</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 pr-2 text-right">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-default"
                >
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        {getFileIcon(file.mimeType, file.name)}
                      </div>
                      <span className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate max-w-[200px] sm:max-w-xs">
                        {file.originalName || file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">
                    {formatBytes(file.size)}
                  </td>
                  <td className="py-3 text-slate-400 capitalize text-[11px]">
                    {file.mimeType.split("/")[1] || "file"}
                  </td>
                  <td className="py-3 pr-2 text-right text-slate-500 text-[11px]">
                    <div className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
