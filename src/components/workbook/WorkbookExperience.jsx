import React, { useState, useEffect, useRef } from 'react';
import { Copy, Printer, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WorkbookExperience({ workbook }) {
  const [responses, setResponses] = useState({});
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const saveTimeouts = useRef({});

  useEffect(() => {
    base44.entities.WorkbookResponse.filter({ workbook_id: workbook.id })
      .then(saved => {
        const map = {};
        (saved || []).forEach(r => { map[r.field_id] = r; });
        setResponses(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workbook.id]);

  const pages = workbook.pages || [];
  const activePage = pages[activePageIndex];

  const handleFieldChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: { ...prev[fieldId], value } }));
    if (saveTimeouts.current[fieldId]) clearTimeout(saveTimeouts.current[fieldId]);
    saveTimeouts.current[fieldId] = setTimeout(async () => {
      const existing = responses[fieldId];
      try {
        if (existing?.id) {
          const updated = await base44.entities.WorkbookResponse.update(existing.id, { value });
          setResponses(prev => ({ ...prev, [fieldId]: updated }));
        } else {
          const created = await base44.entities.WorkbookResponse.create({ workbook_id: workbook.id, field_id: fieldId, page_id: activePage?.page_id, value });
          setResponses(prev => ({ ...prev, [fieldId]: created }));
        }
      } catch (e) {}
    }, 800);
  };

  const handleCopyPrompt = () => {
    let prompt = `# ${workbook.title}\n\nYou are a brand strategist AI. Use the following brand workbook responses to provide strategic guidance.\n\n`;
    pages.forEach(page => {
      prompt += `## ${page.title}\n\n`;
      page.fields?.forEach(field => {
        const val = responses[field.field_id]?.value || '[Not yet answered]';
        prompt += `### ${field.label}\n${val}\n\n`;
      });
    });
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!pages.length) return (
    <div className="forged-border rounded-2xl bg-card p-12 text-center">
      <h3 className="font-heading text-xl text-foreground mb-2">Workbook content coming soon</h3>
      <p className="text-sm text-muted-foreground">This workbook is being forged. Check back shortly.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">{workbook.title}</h1>
        <p className="text-sm text-muted-foreground">{workbook.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={handleCopyPrompt} className="flex items-center gap-2 px-4 py-2 forged-border rounded-lg bg-card text-xs uppercase tracking-widest text-foreground hover:text-primary transition-colors">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy AI Prompt'}
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 forged-border rounded-lg bg-card text-xs uppercase tracking-widest text-foreground hover:text-primary transition-colors">
          <Printer className="w-4 h-4" /> Printer-Friendly Download
        </button>
      </div>
      <div className="flex items-center gap-2 mb-6">
        {pages.map((page, i) => (
          <button key={page.page_id} onClick={() => setActivePageIndex(i)} className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all ${i === activePageIndex ? 'forged-gradient text-white' : 'bg-card text-muted-foreground hover:text-foreground'}`}>{i + 1}</button>
        ))}
      </div>
      {activePage && (
        <div className="forged-border rounded-2xl bg-card p-6 lg:p-8">
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 forged-gradient opacity-50" />
            <h2 className="font-heading text-xl text-foreground mb-6">{activePage.title}</h2>
            <div className="space-y-6">
              {activePage.fields?.map(field => (
                <div key={field.field_id}>
                  <label className="block text-sm text-foreground mb-1">{field.label}{field.required && <span className="text-primary ml-1">*</span>}</label>
                  {field.helper_text && <p className="text-xs text-muted-foreground mb-2">{field.helper_text}</p>}
                  {field.type === 'text_short' && <input type="text" maxLength={field.character_limit} value={responses[field.field_id]?.value || ''} onChange={e => handleFieldChange(field.field_id, e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors" />}
                  {field.type === 'text_long' && <textarea maxLength={field.character_limit} value={responses[field.field_id]?.value || ''} onChange={e => handleFieldChange(field.field_id, e.target.value)} rows={5} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors resize-none" />}
                  {field.type === 'currency' && <input type="number" value={responses[field.field_id]?.value || ''} onChange={e => handleFieldChange(field.field_id, e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors" />}
                  {field.type === 'select' && <select value={responses[field.field_id]?.value || ''} onChange={e => handleFieldChange(field.field_id, e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"><option value="">Select an option...</option>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>}
                  {field.character_limit && <p className="text-xs text-muted-foreground mt-1 text-right">{(responses[field.field_id]?.value || '').length} / {field.character_limit}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))} disabled={activePageIndex === 0} className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> Previous</button>
        <button onClick={() => setActivePageIndex(Math.min(pages.length - 1, activePageIndex + 1))} disabled={activePageIndex === pages.length - 1} className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors disabled:opacity-30">Next <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}