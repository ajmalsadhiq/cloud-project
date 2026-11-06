"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  UploadCloud,
  FolderPlus,
  ShieldCheck,
  Check,
} from "lucide-react";

interface NavbarProps {
  onSearchChange?: (term: string) => void;
  onUploadClick?: () => void;
  onCreateFolderClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  onUploadClick,
  onCreateFolderClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDark, setIsDark] = useState(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark");
    }
  };

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search files, folders, or extensions..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700/60">
            ⌘K
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Upload Button */}
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Files</span>
          </button>
        )}

        {/* Create Folder Button */}
        {onCreateFolderClick && (
          <button
            onClick={onCreateFolderClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* AWS S3 Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>S3 Encrypted</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
