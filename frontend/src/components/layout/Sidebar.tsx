"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  LayoutDashboard,
  Files,
  FolderTree,
  HardDrive,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatBytes } from "../../lib/utils";

interface SidebarProps {
  storageUsagePercent?: number;
  storageConsumed?: number;
  storageQuota?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  storageUsagePercent = 0,
  storageConsumed = 0,
  storageQuota = 1073741824,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "All Files",
      href: "/files",
      icon: Files,
    },
    {
      name: "Folders",
      href: "/folders",
      icon: FolderTree,
    },
    {
      name: "Storage & Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out select-none z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none">
                Cloud<span className="text-blue-500">Vault</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
                Enterprise Cloud
              </span>
            </div>
          )}
        </Link>

        {/* Toggle Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                }`}
              />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Storage Quota Gauge Widget (Bottom) */}
      {!collapsed ? (
        <div className="p-4 mx-3 mb-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>Storage Used</span>
            </div>
            <span className="text-[11px] font-mono text-blue-400">{storageUsagePercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storageUsagePercent > 90
                  ? "bg-red-500"
                  : storageUsagePercent > 70
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              }`}
              style={{ width: `${Math.min(100, storageUsagePercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>{formatBytes(storageConsumed)}</span>
            <span>{formatBytes(storageQuota)}</span>
          </div>
        </div>
      ) : (
        <div className="p-3 mx-2 mb-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center">
          <HardDrive className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-[10px] font-mono text-slate-400">{storageUsagePercent}%</span>
        </div>
      )}

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.name || "User"}</div>
                <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
