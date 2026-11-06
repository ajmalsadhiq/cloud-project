"use client";

import React from "react";
import { HardDrive, AlertTriangle, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { formatBytes } from "../../lib/utils";

interface StorageOverviewCardProps {
  storageConsumed: number;
  storageQuota: number;
  availableQuota: number;
  storageUsagePercent: number;
}

export const StorageOverviewCard: React.FC<StorageOverviewCardProps> = ({
  storageConsumed,
  storageQuota,
  availableQuota,
  storageUsagePercent,
}) => {
  const isNearLimit = storageUsagePercent >= 80;
  const isFull = storageUsagePercent >= 95;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/20 border border-slate-800/80 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Cloud Storage Engine</h3>
            {isNearLimit && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                <AlertTriangle className="w-3 h-3" />
                <span>Near Quota</span>
              </span>
            )}
            {!isNearLimit && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Healthy</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard tier with private AWS S3 object bucket allocation.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatBytes(storageConsumed)}{" "}
            <span className="text-sm font-normal text-slate-400">/ {formatBytes(storageQuota)}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {formatBytes(availableQuota)} remaining
          </div>
        </div>
      </div>

      {/* Usage Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Storage Utilization</span>
          <span className="font-mono text-white">{storageUsagePercent}%</span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full p-0.5 border border-slate-800/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isFull
                ? "bg-red-500"
                : isNearLimit
                ? "bg-amber-500"
                : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            }`}
            style={{ width: `${Math.max(2, Math.min(100, storageUsagePercent))}%` }}
          />
        </div>
      </div>

      {/* Footnote & Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Direct Presigned S3 Streaming</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Public Bucket Exposure</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          <span>Configurable Quota Limits</span>
        </div>
      </div>
    </div>
  );
};
