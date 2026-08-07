import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMembership } from '@/lib/useMembership';
import WorkbookExperience from '@/components/workbook/WorkbookExperience';

export default function WorkbookPage() {
  const { id } = useParams();
  const [workbook, setWorkbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isBpmUnlocked, loading: memberLoading, refreshProfile } = useMembership();

  useEffect(() => {
    base44.entities.WorkbookDefinition.get(id)
      .then(setWorkbook)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || memberLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  // Gate: if not unlocked, show lock message
  if (!isBpmUnlocked) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-2xl text-foreground mb-2">Brand Power Moves Locked</h2>
        <p className="text-sm text-muted-foreground mb-6">Unlock access to all 12 workbooks with your book code or purchase.</p>
        <Link to="/workbooks" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-semibold" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}>
          Unlock Now
        </Link>
      </div>
    );
  }

  if (!workbook) return (
    <div className="forged-border rounded-2xl bg-card p-12 text-center">
      <h3 className="font-heading text-xl text-foreground mb-2">Workbook not found</h3>
      <Link to="/workbooks" className="text-sm text-primary hover:text-copper">← Back to Workbooks</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Link to="/workbooks" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Workbooks
      </Link>
      <WorkbookExperience workbook={workbook} />
    </div>
  );
}