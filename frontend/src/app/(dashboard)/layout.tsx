"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components/layout/Sidebar";
import { Navbar } from "../../components/layout/Navbar";
import apiClient from "../../lib/api";
import { DashboardStats, ApiResponse } from "../../types";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchQuickStats = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
        if (res.data?.success && res.data.data) {
          setStats(res.data.data);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchQuickStats();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-medium">Securing CloudVault session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Collapsible Sidebar */}
      <Sidebar
        storageUsagePercent={stats?.storageUsagePercent || 0}
        storageConsumed={stats?.storageConsumed || user?.storageUsed || 0}
        storageQuota={stats?.storageQuota || user?.storageQuota || 1073741824}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
