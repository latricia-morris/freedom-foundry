import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Inbox, Send } from 'lucide-react';
import apiClient from '@/api/client';
import { useToast } from '@/components/ui/use-toast';

const CATEGORY_LABELS = {
  general: 'General question',
  brand_consulting: 'Brand consulting',
  design: 'Design services',
  speaking_media: 'Speaking & media',
  support: 'Support',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'responded', label: 'Responded' },
];

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminContactInbox() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    apiClient.entities.ContactSubmission.list('-created_date', 200)
      .then((rows) => {
        setSubmissions(rows || []);
        const next = {};
        (rows || []).forEach((row) => { next[row.id] = row.admin_response || ''; });
        setDrafts(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = filter === 'all'
    ? submissions
    : submissions.filter((s) => (s.status || 'new') === filter);
  const newCount = submissions.filter((s) => (s.status || 'new') === 'new').length;

  const saveResponse = async (sub) => {
    const text = (drafts[sub.id] || '').trim();
    if (!text) return;
    setSavingId(sub.id);
    try {
      await apiClient.entities.ContactSubmission.update(sub.id, {
        status: 'responded',
        admin_response: text,
        responded_at: new Date().toISOString(),
      });
      let emailed = true;
      try {
        await apiClient.integrations.Core.SendEmail({
          to: sub.email,
          subject: 'A reply from The Brand Revivalist®',
          text: `Hi ${sub.first_name},\n\n${text}\n\n— The Brand Revivalist®`,
        });
      } catch { emailed = false; }
      toast({
        title: emailed ? 'Response sent' : 'Response saved',
        description: emailed
          ? `Your reply was emailed to ${sub.email}.`
          : 'Saved to the inbox, but the email could not be delivered right now.',
      });
      load();
    } catch {
      toast({ title: 'Could not save the response. Please try again.' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <Link to="/admin" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest link-warm mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Command
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Inbox className="w-6 h-6 text-primary" strokeWidth={1.5} />
          <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground">Contact Inbox</h1>
        </div>
        <p className="text-base text-muted-foreground">
          Messages from the Get in Touch page — read, reply, and keep every conversation in one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f.key === 'all'
            ? submissions.length
            : f.key === 'new' ? newCount : submissions.length - newCount;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={active ? 'btn-forge px-4 py-2 rounded-lg text-xs uppercase tracking-widest' : 'px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-border bg-card text-muted-foreground hover:text-foreground transition-colors'}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="dashboard-card p-12 text-center">
          <p className="text-muted-foreground">No submissions in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((sub) => (
            <div key={sub.id} className="bg-card border border-border rounded-lg p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {sub.first_name} {sub.last_name || ''}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground uppercase tracking-wider">
                    {CATEGORY_LABELS[sub.category] || sub.category}
                  </span>
                  {(sub.status || 'new') === 'responded' && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary uppercase tracking-wider">
                      Responded
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(sub.created_date)}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{sub.email}</p>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mb-4">{sub.message}</p>

              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-foreground mb-2">Your response</label>
                <textarea
                  rows={3}
                  className="admin-input resize-y"
                  value={drafts[sub.id] || ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [sub.id]: e.target.value }))}
                  placeholder="Write your reply — it will be emailed to the sender."
                />
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <button
                    onClick={() => saveResponse(sub)}
                    disabled={!(drafts[sub.id] || '').trim() || savingId === sub.id}
                    className="btn-forge inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {savingId === sub.id ? 'Sending…' : 'Send Response'}
                  </button>
                  {sub.responded_at && (
                    <span className="text-xs text-muted-foreground">Last replied {formatDate(sub.responded_at)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}