import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import WorkbookExperience from '@/components/workbook/WorkbookExperience';

export default function WorkbookPage() {
  const { id } = useParams();
  const [workbook, setWorkbook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.WorkbookDefinition.get(id)
      .then(setWorkbook)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
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