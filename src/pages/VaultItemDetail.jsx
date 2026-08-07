import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Download, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CoursePlayer from '@/components/course/CoursePlayer';
import WorkbookExperience from '@/components/workbook/WorkbookExperience';

export default function VaultItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.VaultItem.get(id)
      .then(i => {
        setItem(i);
        if (i?.type === 'Digital Workbook') {
          base44.entities.WorkbookDefinition.filter({ vault_item_id: id }).then(wbs => setWorkbook(wbs?.[0] || null));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!item) return (
    <div className="forged-border rounded-2xl bg-card p-12 text-center">
      <h3 className="font-heading text-xl text-foreground mb-2">Item not found</h3>
      <Link to="/vault" className="text-sm text-primary hover:text-copper">← Back to The Vault</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Link to="/vault" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to The Vault
      </Link>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-primary">{item.type}</span>
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mt-1 mb-2">{item.title}</h1>
        {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
      </div>
      {item.type === 'Course' && <CoursePlayer vaultItem={item} />}
      {item.type === 'Digital Workbook' && (workbook ? <WorkbookExperience workbook={workbook} /> : (
        <div className="forged-border rounded-2xl bg-card p-12 text-center">
          <h3 className="font-heading text-xl text-foreground mb-2">Workbook coming soon</h3>
          <p className="text-sm text-muted-foreground">This workbook is being forged.</p>
        </div>
      ))}
      {item.type === 'Download' && (
        <div className="space-y-6">
          <div className="forged-border rounded-2xl bg-card p-8">
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
          {item.download_url && (
            <a
              href={item.download_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              <Download className="w-4 h-4" /> Download Resource
            </a>
          )}
          <div className="forged-border rounded-2xl bg-card p-6 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium mb-1">Digital workbook coming soon</p>
              <p className="text-sm text-muted-foreground">An interactive digital workbook for this guide is being forged. In the meantime, enjoy this free resource.</p>
            </div>
          </div>
        </div>
      )}
      {item.type !== 'Course' && item.type !== 'Digital Workbook' && item.type !== 'Download' && (
        <div className="forged-border rounded-2xl bg-card p-8">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          {!item.is_free && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3 mb-4"><Lock className="w-4 h-4 text-primary" strokeWidth={1.5} /><span className="text-sm text-foreground">Premium Access Required</span></div>
              <button className="forged-border px-6 py-3 rounded-lg text-xs uppercase tracking-widest text-primary">Purchase for ${item.price}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}