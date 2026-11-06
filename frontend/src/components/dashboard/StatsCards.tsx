"use client";

import React from "react";
import { HardDrive, Files, FolderTree, CloudRain, ShieldCheck, ArrowUpRight } from "lucide-react";
import { formatBytes } from "../../lib/utils";

interface StatsCardsProps {
  totalFiles: number;
  totalFolders: number;
  storageConsumed: number;
  storageQuota: number;
  availableQuota: number;
  storageUsagePercent: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalFiles,
  totalFolders,
  storageConsumed,
  storageQuota,
  availableQuota,
  storageUsagePercent,
}) => {
  const cards = [
    {
      title: "Storage Consumed",
      value: formatBytes(storageConsumed),
      subtext: `${storageUsagePercent}% of ${formatBytes(storageQuota)}`,
      icon: HardDrive,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Total Files Stored",
      value: totalFiles.toLocaleString(),
      subtext: "Encrypted in AWS S3",
      icon: Files,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Virtual Folders",
      value: totalFolders.toLocaleString(),
      subtext: "Indexed in MongoDB",
      icon: FolderTree,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Available Quota",
      value: formatBytes(availableQuota),
      subtext: "Free tier allowance",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${card.bgColor} border flex items-center justify-center ${card.color} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
