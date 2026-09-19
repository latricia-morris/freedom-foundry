import React, { useState } from 'react';
import { FolderOpen, X } from 'lucide-react';
import DriveBrowser from '@/components/portal/DriveBrowser';

export default function DriveFolderPicker({ folderId, folderName, onChange }) {
  const [browsing, setBrowsing] = useState(false);

  return (
    <div>
      {folderId ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-foreground min-w-0">
            <FolderOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{folderName || 'Selected folder'}</span>
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setBrowsing(!browsing)}
              className="text-xs uppercase tracking-wider text-[#8a482d]"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange({ id: '', name: '' })}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setBrowsing(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors w-full"
        >
          <FolderOpen className="w-4 h-4" /> Browse your Google Drive to pick a folder
        </button>
      )}
      {browsing && (
        <div className="mt-3">
          <DriveBrowser
            rootFolderId="root"
            rootFolderName="My Drive"
            admin
            onSelectFolder={(folder) => {
              onChange(folder);
              setBrowsing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}