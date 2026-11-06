"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FolderPlus,
  RefreshCw,
  HardDrive,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../lib/api";
import { DashboardStats, ApiResponse } from "../../../types";
import { StatsCards } from "../../../components/dashboard/StatsCards";
import { StorageOverviewCard } from "../../../components/dashboard/StorageOverviewCard";
import { FileTypeDistribution } from "../../../components/dashboard/FileTypeDistribution";
import { RecentUploadsTable } from "../../../components/dashboard/RecentUploadsTable";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      const res = await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
      if (res.data?.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const defaultStats: DashboardStats = {
    totalFiles: 0,
    totalFolders: 0,
    storageConsumed: user?.storageUsed || 0,
    storageQuota: user?.storageQuota || 1073741824,
    availableQuota: Math.max(0, (user?.storageQuota || 1073741824) - (user?.storageUsed || 0)),
    storageUsagePercent: 0,
    categories: {
      images: { count: 0, totalSize: 0 },
      documents: { count: 0, totalSize: 0 },
      media: { count: 0, totalSize: 0 },
      archives: { count: 0, totalSize: 0 },
      others: { count: 0, totalSize: 0 },
    },
    recentUploads: [],
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {user?.name || "Member"}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium">
              SaaS Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and file storage insights across your AWS S3 bucket.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardStats}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-400" : ""}`} />
          </button>

          <Link
            href="/dashboard/files"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Manage Files</span>
          </Link>
        </div>
      </div>

      {/* 4 Quick Stat Metric Cards */}
      <StatsCards
        totalFiles={currentStats.totalFiles}
        totalFolders={currentStats.totalFolders}
        storageConsumed={currentStats.storageConsumed}
        storageQuota={currentStats.storageQuota}
        availableQuota={currentStats.availableQuota}
        storageUsagePercent={currentStats.storageUsagePercent}
      />

      {/* Storage Meter Visualizer */}
      <StorageOverviewCard
        storageConsumed={currentStats.storageConsumed}
        storageQuota={currentStats.storageQuota}
        availableQuota={currentStats.availableQuota}
        storageUsagePercent={currentStats.storageUsagePercent}
      />

      {/* 2-Column Grid: Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileTypeDistribution
          categories={currentStats.categories}
          storageConsumed={currentStats.storageConsumed}
        />

        <RecentUploadsTable
          files={currentStats.recentUploads}
        />
      </div>
    </div>
  );
}
