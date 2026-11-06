"use client";

import React from "react";
import { ChevronRight, Home, Folder } from "lucide-react";

export interface Breadcrumb {
  id: string | null;
  name: string;
}

interface FolderBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  onNavigate: (folderId: string | null) => void;
}

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({
  breadcrumbs,
  onNavigate,
}) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto py-1">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        title="Root Directory"
      >
        <Home className="w-3.5 h-3.5 text-blue-400" />
        <span className="font-semibold text-slate-200">Root</span>
      </button>

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.id || idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => onNavigate(crumb.id)}
              disabled={isLast}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors truncate max-w-[160px] ${
                isLast
                  ? "text-blue-400 font-semibold cursor-default"
                  : "hover:bg-slate-800 hover:text-white cursor-pointer"
              }`}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{crumb.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
