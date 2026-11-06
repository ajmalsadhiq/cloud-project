"use client";

import React from "react";
import {
  HardDrive,
  ShieldCheck,
  User as UserIcon,
  Mail,
  KeyRound,
  Server,
  Cloud,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { formatBytes, formatDate } from "../../../lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();

  const quota = user?.storageQuota || 1073741824;
  const used = user?.storageUsed || 0;
  const percent = Math.min(100, Math.round((used / quota) * 100 * 10) / 10);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Storage &amp; Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your cloud storage quota, encryption credentials, and account details.
        </p>
      </div>

      {/* Storage Quota Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Storage Quota Allocation</h3>
              <p className="text-xs text-slate-400">AWS S3 Dedicated Bucket Partition</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            Standard Plan
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>{formatBytes(used)} utilized</span>
            <span>{formatBytes(quota)} allocated ({percent}%)</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, percent)}%` }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Uploads prevented once 100% quota is reached</span>
          </div>
          <span className="font-mono text-slate-500">{formatBytes(Math.max(0, quota - used))} available</span>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Account Information</h3>
            <p className="text-xs text-slate-400">Your CloudVault user credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">Full Name</span>
            <span className="text-white font-semibold">{user?.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">Email Address</span>
            <span className="text-white font-semibold">{user?.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">Account ID</span>
            <span className="text-slate-300 font-mono text-[11px]">{user?.id}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-500 block text-[11px] mb-1">Member Since</span>
            <span className="text-slate-300">
              {user?.createdAt ? formatDate(user.createdAt) : "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Security & Infrastructure Readiness */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Security &amp; Cloud Infrastructure</h3>
            <p className="text-xs text-slate-400">AWS S3, IAM, and Token Architecture</p>
          </div>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-slate-200 font-semibold block">Password Protection</span>
              <span className="text-slate-500 text-[11px]">Hashed with bcrypt (10 rounds of salt)</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">Enforced</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-slate-200 font-semibold block">S3 Bucket Access</span>
              <span className="text-slate-500 text-[11px]">Private objects signed with temporary presigned URLs</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">Strictly Private</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="text-slate-200 font-semibold block">Session Tokens</span>
              <span className="text-slate-500 text-[11px]">Signed with 256-bit secret key, 7-day expiration</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px]">JWT Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
