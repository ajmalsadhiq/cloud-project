"use client";

import React from "react";
import {
  Image as ImageIcon,
  FileText,
  Film,
  Archive,
  Layers,
} from "lucide-react";
import { formatBytes } from "../../lib/utils";
import { CategoryStat } from "../../types";

interface FileTypeDistributionProps {
  categories: {
    images: CategoryStat;
    documents: CategoryStat;
    media: CategoryStat;
    archives: CategoryStat;
    others: CategoryStat;
  };
  storageConsumed: number;
}

export const FileTypeDistribution: React.FC<FileTypeDistributionProps> = ({
  categories,
  storageConsumed,
}) => {
  const getPercentage = (size: number) => {
    if (storageConsumed === 0 || size === 0) return 0;
    return Math.round((size / storageConsumed) * 100);
  };

  const types = [
    {
      label: "Images & Graphics",
      count: categories.images.count,
      size: categories.images.totalSize,
      icon: ImageIcon,
      color: "text-blue-400",
      barColor: "bg-blue-500",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Documents & Sheets",
      count: categories.documents.count,
      size: categories.documents.totalSize,
      icon: FileText,
      color: "text-indigo-400",
      barColor: "bg-indigo-500",
      bgColor: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Media & Audio",
      count: categories.media.count,
      size: categories.media.totalSize,
      icon: Film,
      color: "text-purple-400",
      barColor: "bg-purple-500",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Archives & Compressed",
      count: categories.archives.count,
      size: categories.archives.totalSize,
      icon: Archive,
      color: "text-amber-400",
      barColor: "bg-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Other Formats",
      count: categories.others.count,
      size: categories.others.totalSize,
      icon: Layers,
      color: "text-slate-400",
      barColor: "bg-slate-500",
      bgColor: "bg-slate-500/10 border-slate-500/20",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm flex flex-col justify-between">
      <div className="mb-5">
        <h3 className="text-base font-bold text-white tracking-tight">Storage Distribution</h3>
        <p className="text-xs text-slate-400 mt-1">
          Categorized breakdown by MIME type and extensions
        </p>
      </div>

      {/* Multi-segmented distribution visualizer */}
      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex mb-6 border border-slate-800/80">
        {types.map((t, idx) => {
          const pct = getPercentage(t.size);
          if (pct === 0) return null;
          return (
            <div
              key={idx}
              className={`h-full ${t.barColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${t.label}: ${pct}% (${formatBytes(t.size)})`}
            />
          );
        })}
        {storageConsumed === 0 && (
          <div className="h-full w-full bg-slate-800/60" title="Empty storage" />
        )}
      </div>

      {/* Categories Grid */}
      <div className="space-y-3">
        {types.map((type, idx) => {
          const Icon = type.icon;
          const pct = getPercentage(type.size);

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${type.bgColor} border flex items-center justify-center ${type.color} shrink-0`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    {type.label}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {type.count} {type.count === 1 ? "file" : "files"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-200">{formatBytes(type.size)}</div>
                <div className="text-[10px] font-mono text-slate-500">{pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
