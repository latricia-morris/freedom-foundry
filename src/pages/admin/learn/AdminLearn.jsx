import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, FileDown, GraduationCap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { priceLabel, STATUS_LABELS } from '@/lib/learn';

const STATUS_STYLE = {
  published: 'border-emerald-500/40 text-emerald-400',
  draft: 'border-border text-muted-foreground',
  archived: 'border-destructive/50 text-destructive',
};

/** Every course and book, with its status, price and how many members have it. */
export default function AdminLearn() {
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState(null);
  const [members, setMembers] = useState({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    base44.entities.LearnOffering.filter({}, 'sort_order', 200).then((rows) => setOfferings(rows || []));
    base44.entities.LearnEntitlement.aggregate({ query: { status: 'active' }, groupBy: 'offering_id' })
      .then((r) => setMembers(Object.fromEntries(r.rows.map((x) => [x.offering_id, x.count]))));
  }, []);

  const create = async (kind) => {
    setCreating(true);
    const o = await base44.entities.LearnOffering.create({
      kind, title: `Untitled ${kind}`, status: 'draft', is_free: true, sort_order: (offerings || []).length,
    });
    navigate(`/admin/learn/${o.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Platform</p>
          <h1 className="mt-1 font-heading text-4xl font-light text-foreground">Courses &amp; <span className="molten-text italic">Books</span></h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Build courses, publish books and add standalone resources for the Academy. Only published items show to members.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={creating} onClick={() => create('course')} className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
            <GraduationCap className="h-4 w-4" /> New course
          </button>
          <button type="button" disabled={creating} onClick={() => create('book')} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50">
            <BookOpen className="h-4 w-4" /> New book
          </button>
          <button type="button" disabled={creating} onClick={() => create('resource')} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50">
            <FileDown className="h-4 w-4" /> New resource
          </button>
        </div>
      </div>

      {!offerings ? (
        <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
      ) : !offerings.length ? (
        <div className="dashboard-card p-10 text-center"><p className="text-sm text-muted-foreground">Nothing here yet. Start with a new course or book.</p></div>
      ) : (
        <div className="dashboard-card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-left text-[10px] uppercase tracking-widest text-muted-foreground/70">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Members</th>
                <th className="px-5 py-3 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => (
                <tr key={o.id} className="border-t border-border/30">
                  <td className="px-5 py-3 text-sm text-foreground">{o.title}</td>
                  <td className="px-5 py-3 text-sm capitalize text-muted-foreground">{o.kind}</td>
                  <td className="px-5 py-3"><span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLE[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{priceLabel(o)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{members[o.id] || 0}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/admin/learn/${o.id}`} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-foreground">
                      <ArrowUpRight className="h-3.5 w-3.5" /> Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}