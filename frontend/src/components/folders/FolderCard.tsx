"use client";

import React, { useState } from "react";
import { Folder, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { FolderItem } from "../../types";

interface FolderCardProps {
  folder: FolderItem;
  onOpen: (folderId: string) => void;
  onRename: (folder: FolderItem) => void;
  onDelete: (folder: FolderItem) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpen,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onDoubleClick={() => onOpen(folder.id)}
      className="relative group p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all shadow-sm hover:shadow-md cursor-pointer select-none"
    >
      <div className="flex items-start justify-between">
        <div
          onClick={() => onOpen(folder.id)}
          className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform"
        >
          <Folder className="w-5 h-5 fill-blue-500/20" />
        </div>

        {/* Dropdown Menu Trigger */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-7 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onRename(folder);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(folder);
                  }}
                  className="w-full px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div onClick={() => onOpen(folder.id)} className="mt-3">
        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
          {folder.name}
        </h4>
        <span className="text-[11px] text-slate-500 mt-0.5 block">
          {folder.itemCount !== undefined
            ? `${folder.itemCount} ${folder.itemCount === 1 ? "item" : "items"}`
            : "Folder"}
        </span>
      </div>
    </div>
  );
};
