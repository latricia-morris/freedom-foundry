import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Inbox } from 'lucide-react';
import apiClient from '@/api/client';
import QueueItem from '@/components/support/QueueItem';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'bug_report', label: 'Bug Reports' },
  { key: 'feature_request', label: 'Feature Requests' },
  { key: 'open', label: 'Open' },
];

export default function AdminSupportReports() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      apiClient.entities.BugReport.list('-created_date', 200),
      apiClient.entities.User.list().catch(() => []),
    ])
      .then(([r, u]) => {
        setReports(r || []);
        setUsers(u || []);
      })
      .catch((e) => setError(e.message || 'Unable to load the support queue.'))
      .finally(() => setLoading(false));
  }, []);

  const userById = useMemo(() => {
    const map = new Map();
    (users || []).forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const visible = reports.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'open') return (r.status || 'open') === 'open';
    return (r.type || 'bug_report') === filter;
  });
  const openCount = reports.filter(r => (r.status || 'open') === 'open').length;

  const handleStatusChange = async (id, status) => {
    const previous = reports;
    setReports(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    try {
      await apiClient.entities.BugReport.update(id, { status });
    } catch (e) {
      setReports(previous);
      setError(e.message || 'Could not update the status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return;
    try {
      await apiClient.entities.BugReport.delete(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      setError(e.message || 'Could not delete this submission.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm link-warm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Command
      </Link>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Inbox className="w-6 h-6 text-primary" strokeWidth={1.5} />
          <h1 className="font-heading text-4xl font-light text-foreground tracking-wide">
            Support <span className="molten-text italic font-medium">Queue</span>
          </h1>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Member bug reports and feature requests — triage what needs fixing, hold what can wait, and remove the rest.
        </p>
      </div>

      {error && <p role="alert" className="mb-6 text-sm text-red-400">{error}</p>}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filter === key
                ? 'btn-forge'
                : 'text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {label}
            {key === 'open' && openCount > 0 ? ` (${openCount})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="dashboard-card p-12 text-center">
          <p className="text-muted-foreground">No submissions in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(report => (
            <QueueItem
              key={report.id}
              report={report}
              reporter={userById.get(report.created_by_id)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}