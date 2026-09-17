import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Download, ExternalLink, BookOpen, FileText } from 'lucide-react';
import apiClient from '@/api/client';
import CoursePlayer from '@/components/course/CoursePlayer';
import WorkbookExperience from '@/components/workbook/WorkbookExperience';

export default function VaultItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('options');

  useEffect(() => {
    apiClient.entities.VaultItem.get(id)
      .then(i => {
        setItem(i);
        if (i?.type === 'Digital Workbook' || i?.title?.startsWith('Above the Noise')) {
          apiClient.entities.WorkbookDefinition.filter({ vault_item_id: id }).then(wbs => setWorkbook(wbs?.[0] || null));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!item) return (
    <div className="forged-border rounded-2xl bg-card p-12 text-center">
      <h3 className="font-heading text-xl text-foreground mb-2">Item not found</h3>
      <Link to="/vault" className="text-sm link-molten">← Back to The Vault</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Link to="/vault" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to The Vault
      </Link>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest molten-text">{item.type}</span>
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mt-1 mb-2">{item.title}</h1>
        {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
      </div>
      {item.type === 'Course' && <CoursePlayer vaultItem={item} />}
      {item.type === 'Digital Workbook' && (
        <div className="space-y-6">
          <div className="forged-border rounded-2xl bg-card p-6 sm:p-8">
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            <div className="grid gap-3 sm:grid-cols-2 mt-6">
              <button
                type="button"
                onClick={() => setView('pdf')}
                className={`text-left rounded-xl border p-4 transition-colors ${view === 'pdf' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
              >
                <FileText className="w-5 h-5 text-primary mb-3" />
                <span className="block text-sm font-semibold text-foreground">Read the original PDF</span>
                <span className="block text-xs text-muted-foreground mt-1">Preview or download the complete source guide.</span>
              </button>
              <button
                type="button"
                onClick={() => setView('workbook')}
                disabled={!workbook}
                className={`text-left rounded-xl border p-4 transition-colors disabled:opacity-60 ${view === 'workbook' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
              >
                <BookOpen className="w-5 h-5 text-primary mb-3" />
                <span className="block text-sm font-semibold text-foreground">Open the digital workbook</span>
                <span className="block text-xs text-muted-foreground mt-1">Complete, save, revisit, and print your responses.</span>
              </button>
            </div>
          </div>
          {view === 'workbook' && (workbook ? <WorkbookExperience workbook={workbook} /> : (
            <div className="forged-border rounded-2xl bg-card p-12 text-center">
              <h3 className="font-heading text-xl text-foreground mb-2">Workbook coming soon</h3>
              <p className="text-sm text-muted-foreground">This workbook is being forged.</p>
            </div>
          ))}
          {view === 'pdf' && item.download_url && (
            <div className="space-y-4">
              <div className="forged-border overflow-hidden rounded-2xl bg-card">
                <iframe
                  src={item.download_url}
                  title={`${item.title} preview`}
                  className="h-[68vh] min-h-[32rem] w-full bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={item.download_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  <ExternalLink className="w-4 h-4" /> View in a new tab
                </a>
                <a href={item.download_url} download className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      {item.type === 'Download' && (
        <div className="space-y-6">
          <div className="forged-border rounded-2xl bg-card p-8">
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
          {item.download_url && (
            <>
              {item.download_url.toLowerCase().includes('.pdf') && (
                <div className="forged-border overflow-hidden rounded-2xl bg-card">
                  <iframe
                    src={item.download_url}
                    title={`${item.title} preview`}
                    className="h-[68vh] min-h-[32rem] w-full bg-white"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <a
                  href={item.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="w-4 h-4" /> View in a new tab
                </a>
                <a
                  href={item.download_url}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            </>
          )}
        </div>
      )}
      {item.type !== 'Course' && item.type !== 'Digital Workbook' && item.type !== 'Download' && (
        <div className="forged-border rounded-2xl bg-card p-8">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          {!item.is_free && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 mb-4"><Lock className="w-4 h-4" strokeWidth={1.5} style={{ stroke: 'url(#warmGradientSvg)' }} /><span className="text-sm text-foreground">Premium Access Required</span></div>
              <button className="forged-border px-6 py-3 rounded-lg text-xs uppercase tracking-widest link-molten">Purchase for ${item.price}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}