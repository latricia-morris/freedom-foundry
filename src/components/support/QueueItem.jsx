import React, { useState } from 'react';
import { Bug, Lightbulb, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';

const TYPE_META = {
  bug_report: { label: 'Bug Report', icon: Bug, badge: 'border-primary/25 bg-primary/10 text-primary' },
  feature_request: { label: 'Feature Request', icon: Lightbulb, badge: 'border-brass/40 bg-brass/10 text-brass' },
};

const STATUS_OPTIONS = [
  ['open', 'Open'],
  ['reviewing', 'Reviewing'],
  ['resolved', 'Resolved'],
  ['wont_fix', "Won't Fix"],
];

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function QueueItem({ report, reporter, onStatusChange, onDelete }) {
  const [viewShot, setViewShot] = useState(null);
  const meta = TYPE_META[report.type] || TYPE_META.bug_report;
  const TypeIcon = meta.icon;
  const shots = Array.isArray(report.screenshot_urls) ? report.screenshot_urls.filter(Boolean) : [];
  const reporterName = [reporter?.first_name, reporter?.last_name].filter(Boolean).join(' ');

  return (
    <article className="dashboard-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${meta.badge}`}>
            <TypeIcon className="w-3 h-3" /> {meta.label}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{formatDate(report.created_date)}</span>
        </div>
        <select
          value={report.status || 'open'}
          onChange={e => onStatusChange(report.id, e.target.value)}
          className="admin-input w-auto text-xs py-1.5"
          aria-label="Triage status"
        >
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-foreground whitespace-pre-wrap break-words mb-4">{report.description}</p>

      {shots.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {shots.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setViewShot(url)}
              className="w-20 h-14 rounded overflow-hidden border border-border hover:border-primary/50 transition-colors"
              aria-label={`View screenshot ${i + 1}`}
            >
              <Image src={url} alt={`Screenshot ${i + 1}`} fittingType="fill" className="w-full h-full" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <span className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            {reporterName || reporter?.email || 'Unknown member'}
          </span>
          {report.page_url && <span className="font-mono truncate">{report.page_url}</span>}
        </div>
        <button
          type="button"
          onClick={() => onDelete(report.id)}
          className="flex items-center gap-1.5 uppercase tracking-wider hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <Dialog open={!!viewShot} onOpenChange={open => { if (!open) setViewShot(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attached screenshot</DialogTitle>
          </DialogHeader>
          {viewShot && (
            <Image src={viewShot} alt="Attached screenshot" fittingType="fit" className="w-full rounded" />
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}