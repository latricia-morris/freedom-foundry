import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CaseStudyView from '@/components/portfolio/CaseStudyView';

/** Admin-only live preview of the real public layout with current draft data. */
export default function PortfolioPreview() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    base44.functions.invoke('portfolio-public', { action: 'preview', id })
      .then((response) => { if (active) setData(response?.data || null); })
      .catch((e) => { if (active) setError(e?.message || 'The preview could not load.'); });
    return () => { active = false; };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-heading text-4xl font-light text-foreground">Preview unavailable</h1>
        <p className="mt-4 text-sm text-muted-foreground">{error}</p>
        <Link to="/admin/portfolio" className="link-warm mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to the Portfolio Manager
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CaseStudyView
      project={data.project}
      assets={data.assets || []}
      beforeAfter={data.before_after || []}
      related={data.related || []}
      intro={(
        <div className="dashboard-card ember-glow mb-10 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="mr-2 rounded-sm border border-primary/50 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
              {data.project.status === 'published' ? 'Published preview' : 'Draft preview'}
            </span>
            This is exactly what visitors will see on the public case-study page.
          </p>
          <Link to={`/admin/portfolio/${id}`} className="link-warm inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to the editor
          </Link>
        </div>
      )}
    />
  );
}