import React, { useState } from 'react';
import { FolderPlus, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/** Link a Google Drive folder (URL or ID) directly to the client record. */
export default function LinkDriveFolderCard({ clientId, linkedFolder, onLinked, onUnlinked }) {
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const parseFolderId = (input) => {
    const raw = (input || '').trim();
    if (!raw) return '';
    const match = raw.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    if (/^[a-zA-Z0-9_-]{15,}$/.test(raw)) return raw;
    return '';
  };

  const link = async () => {
    const folderId = parseFolderId(value);
    if (!folderId) {
      toast({ title: 'Paste a Google Drive folder link or folder ID', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const folderName = name.trim() || 'Client folder';
      await base44.entities.AgencyClient.update(clientId, {
        drive_folder_id: folderId,
        drive_folder_name: folderName,
      });
      setValue('');
      setName('');
      toast({ title: 'Drive folder linked', description: folderName });
      if (onLinked) onLinked({ id: folderId, name: folderName });
    } catch (e) {
      toast({ title: 'Could not link the folder', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    try {
      await base44.entities.AgencyClient.update(clientId, { drive_folder_id: '', drive_folder_name: '' });
      toast({ title: 'Drive folder unlinked' });
      if (onUnlinked) onUnlinked();
    } catch (e) {
      toast({ title: 'Could not unlink the folder', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard-card mb-6 p-5">
      <div className="mb-3 flex items-center gap-2">
        <FolderPlus className="h-4 w-4 icon-warm" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Client Google Drive folder</span>
      </div>
      {linkedFolder ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground">
            {linkedFolder.name}
            <span className="ml-2 text-xs text-muted-foreground/60">{linkedFolder.id}</span>
          </p>
          <button
            type="button"
            onClick={unlink}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Unlink
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="admin-input py-2 text-sm"
            placeholder="Paste a Google Drive folder link…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <input
            className="admin-input py-2 text-sm sm:w-48"
            placeholder="Folder label (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            onClick={link}
            disabled={busy}
            className="btn-forge inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
          >
            <Link2 className="h-4 w-4" /> Link folder
          </button>
        </div>
      )}
    </div>
  );
}