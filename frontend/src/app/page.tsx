"use client";

import React, { useEffect, useState } from "react";
import {
  Cloud,
  HardDrive,
  ShieldCheck,
  Server,
  Layers,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  FolderTree,
  FileText,
  Lock,
} from "lucide-react";
import apiClient from "../lib/api";

interface HealthData {
  status: string;
  service: string;
  version: string;
  uptime: number;
  database: string;
  s3Configured: boolean;
}

export default function Home() {
  const [apiHealth, setApiHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await apiClient.get("/health");
        if (res.data?.success) {
          setApiHealth(res.data.data);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Backend currently offline or unreachable");
      } finally {
        setLoading(false);
      }
    };

    checkApi();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Cloud<span className="text-blue-500">Vault</span>
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Phase 1 Scaffold
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ajmalsadhiq/cloud-project"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  apiHealth ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-xs text-slate-400">
                {loading
                  ? "Checking API..."
                  : apiHealth
                  ? "Backend Active"
                  : "API Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium mb-6">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Full-Stack AWS Cloud Storage Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Next-Generation <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Cloud Storage & File Engine
            </span>
          </h1>

          <p className="mt-5 text-slate-400 text-lg leading-relaxed">
            Enterprise cloud architecture powered by AWS S3 direct-to-bucket
            presigned uploads, MongoDB metadata hierarchy, JWT authorization, and
            a polished Linear &amp; Google Drive inspired workspace.
          </p>
        </div>

        {/* System Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AWS S3 Direct Streaming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Files stream straight from the browser to Amazon S3 via temporary presigned PUT URLs, eliminating backend bottlenecks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Virtual Folder Tree</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              MongoDB-indexed folder models allow infinite nesting, moving, breadcrumb routing, and lightning-fast search without S3 key restructuring.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Private &amp; Quota-Controlled</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No public bucket access. Granular owner checks, strict quotas per account, and time-expiring download &amp; preview signatures.
            </p>
          </div>
        </div>

        {/* Phase 1 Status Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-white">Phase 1: Project Initialization Complete</h4>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Next.js App Router (Frontend) &amp; Express TypeScript (Backend) are scaffolded and ready for Phase 2 (Authentication &amp; Models).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs text-slate-400 text-right">
              <div>API: <span className="text-slate-200 font-mono">http://localhost:5000</span></div>
              <div>Client: <span className="text-slate-200 font-mono">http://localhost:3000</span></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        CloudVault Platform &copy; 2026 &bull; Built with Next.js, Express, TypeScript &amp; AWS S3
      </footer>
    </div>
  );
}
