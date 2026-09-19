import React, { useEffect, useState } from 'react';
import { FileDown, Layers, StickyNote } from 'lucide-react';
import apiClient from '@/api/client';
import DriveBrowser from '@/components/portal/DriveBrowser';

export default function PortalContentSection({ pageKey }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    (async () => {
      try {
        const me = await apiClient.auth.me();
        const rows = await apiClient.entities.PortalContent.filter(
          { user_id: me.id, target_page: pageKey, visible: true },
          'order',
          100,
        );
        if (active) setItems(rows || []);
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => { active = false; };
  }, [pageKey]);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-10 space-y-6">
      {items.map((item) => {
        if (item.type === 'drive_link' && item.drive_folder_id) {
          return (
            <DriveBrowser
              key={item.id}
              title={item.title}
              rootFolderId={item.drive_folder_id}
              rootFolderName={item.drive_folder_name || item.title}
            />
          );
        }
        if (item.type === 'file' && item.file_url) {
          return (
            <div key={item.id} className="dashboard-card border border-border p-5 flex items-center gap-4">
              <span className="w-10 h-10 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <FileDown className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground truncate">{item.title}</span>
                {item.body && <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</span>}
              </span>
              <a
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                download
                className="btn-forge inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs uppercase tracking-wider shrink-0"
              >
                <FileDown className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          );
        }
        const isSection = item.type === 'custom_section';
        const Icon = isSection ? Layers : StickyNote;
        return (
          <div key={item.id} className="dash-editorial-block">
            <div className="flex items-start gap-3">
              {!isSection && (
                <span className="w-9 h-9 rounded-md bg-[#f0d9b5] border border-[#6e1f24]/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#6e1f24]" strokeWidth={1.5} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h3 className={isSection ? 'font-heading text-2xl' : 'font-heading text-xl'}>{item.title}</h3>
                {item.body && (
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}