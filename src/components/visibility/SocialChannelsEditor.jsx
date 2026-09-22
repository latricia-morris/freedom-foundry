import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Admin-side editor for a report's social channels: add missing channels,
 * confirm profile links, and record follower counts so the reach chart
 * reflects reality. Saves the full channel list back to the report.
 */
export default function SocialChannelsEditor({ open, channels, saving, onClose, onSave }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open) {
      setRows(
        (channels || []).map((c) => ({
          platform: c.platform || '',
          handle: c.handle || '',
          url: c.url || '',
          followers: c.followers || '',
          notes: c.notes || '',
        })),
      );
    }
  }, [open, channels]);

  const update = (i, field, value) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  const addRow = () => setRows((r) => [...r, { platform: '', handle: '', url: '', followers: '', notes: '' }]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const save = () =>
    onSave(
      rows
        .map((row) => ({
          platform: row.platform.trim(),
          handle: row.handle.trim(),
          url: row.url.trim(),
          followers: row.followers.trim(),
          notes: row.notes,
        }))
        .filter((row) => row.platform),
    );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit social channels</DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-xs text-muted-foreground">
          Add missing channels, confirm each profile link, and record follower counts so the reach chart stays accurate.
        </p>
        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.6fr_0.8fr_auto] sm:items-center">
              <input
                className="admin-input col-span-2 sm:col-span-1"
                placeholder="Platform (e.g. TikTok)"
                value={row.platform}
                onChange={(e) => update(i, 'platform', e.target.value)}
              />
              <input
                className="admin-input"
                placeholder="@handle"
                value={row.handle}
                onChange={(e) => update(i, 'handle', e.target.value)}
              />
              <input
                className="admin-input col-span-2 sm:col-span-1"
                placeholder="Profile URL"
                value={row.url}
                onChange={(e) => update(i, 'url', e.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Followers (e.g. 2.7K)"
                value={row.followers}
                onChange={(e) => update(i, 'followers', e.target.value)}
              />
              <button
                type="button"
                aria-label="Remove channel"
                onClick={() => removeRow(i)}
                className="col-span-2 flex h-8 w-8 items-center justify-center justify-self-end rounded-sm border border-border/70 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive sm:col-span-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No channels yet. Add the first one below.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={addRow} disabled={saving}>
            <Plus className="mr-1.5 h-4 w-4" /> Add channel
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button className="btn-forge border-0" size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save channels'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}