import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bug, Check, Clipboard, Clock3, FileText, Shield } from 'lucide-react';
import apiClient from '@/api/client';

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminSupportReports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.admin.listSupportReports()
      .then(setReports)
      .catch((e) => setError(e.message || 'Unable to load support reports.'))
      .finally(() => setLoading(false));
  }, []);

  const openReport = async (report) => {
    setError('');
    setCopied(false);
    try {
      setSelected(await apiClient.admin.getSupportReport(report.id));
    } catch (e) {
      setError(e.message || 'Unable to open this support report.');
    }
  };

  const copyReport = async () => {
    if (!selected?.share_text || !navigator.clipboard) return;
    await navigator.clipboard.writeText(selected.share_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm link-warm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Command
      </Link>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Bug className="w-6 h-6 text-primary" strokeWidth={1.5} />
          <h1 className="font-heading text-4xl font-light text-foreground tracking-wide">
            Support <span className="molten-text italic font-medium">Reports</span>
          </h1>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Review member-submitted QuickBooks issues and copy a safe troubleshooting summary for authorized support channels.
        </p>
      </div>

      {error && <p role="alert" className="mb-6 text-sm text-red-200">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
          <section className="dashboard-card overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-heading text-xl text-foreground">Inbox</h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{reports.length} reports</span>
            </div>
            {reports.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No support reports yet.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {reports.map((report) => (
                  <button
                    type="button"
                    key={report.id}
                    onClick={() => openReport(report)}
                    className={`w-full text-left p-5 transition-colors hover:bg-accent/50 ${selected?.report?.id === report.id ? 'bg-accent' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Report #{report.id}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(report.occurred_at)}</p>
                      </div>
                      <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-wider text-primary">
                        {report.provider}
                      </span>
                    </div>
                    <p className="mt-3 truncate text-xs text-muted-foreground">{report.page_context || 'Page not provided'}</p>
                    {report.intuit_tid && <p className="mt-1 truncate font-mono text-[11px] text-primary/80">TID {report.intuit_tid}</p>}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-card min-h-[360px]">
            {!selected ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center p-8">
                <FileText className="w-10 h-10 text-primary/60 mb-4" strokeWidth={1.2} />
                <h2 className="font-heading text-2xl text-foreground mb-2">Select a report</h2>
                <p className="max-w-sm text-sm text-muted-foreground">The full description and related provider events appear here only when you choose a report.</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary">QuickBooks report #{selected.report.id}</p>
                    <h2 className="font-heading text-3xl text-foreground mt-1">Troubleshooting details</h2>
                  </div>
                  <button type="button" onClick={copyReport} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-wider text-foreground hover:bg-accent">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy safe summary'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="rounded-lg border border-border/50 bg-muted/60 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reported</p>
                    <p className="text-foreground">{formatDate(selected.report.occurred_at)}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/60 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Intuit TID</p>
                    <p className="font-mono text-foreground break-all">{selected.report.intuit_tid || 'Not available'}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/60 p-3 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Page context</p>
                    <p className="font-mono text-xs text-foreground break-all">{selected.report.page_context || 'Not provided'}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#f7f2ea] p-5 text-[#1a1420]">
                  <p className="text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2">Member description</p>
                  <p className="text-sm whitespace-pre-wrap break-words">{selected.report.description}</p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock3 className="w-4 h-4 text-primary" />
                    <h3 className="font-heading text-xl text-foreground">Provider events</h3>
                  </div>
                  {selected.events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No QuickBooks response event is attached yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {selected.events.map((event) => (
                        <div key={event.id} className="rounded-lg border border-border/50 p-4 text-xs">
                          <p className="text-foreground">{formatDate(event.created_at)} · HTTP {event.provider_status || 'unknown'} · TID {event.intuit_tid || 'not available'}</p>
                          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-muted-foreground">{JSON.stringify(event.safe_response_details || {}, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" /> Only administrators can access these details.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}