import React, { useState, useEffect, useRef } from 'react';
import { Copy, Printer, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@clerk/react';
import apiClient from '@/api/client';
import WorkbookField from '@/components/workbook/WorkbookField';
import ChecklistAddBox from '@/components/workbook/ChecklistAddBox';
import openPrintFriendly from '@/components/workbook/openPrintFriendly';

export default function WorkbookExperience({ workbook }) {
  const { user } = useUser();
  const [responses, setResponses] = useState({});
  const [responseRecord, setResponseRecord] = useState(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const saveTimeouts = useRef({});
  const saveChain = useRef(Promise.resolve());
  const responsesRef = useRef({});
  const responseRecordRef = useRef(null);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  useEffect(() => {
    responseRecordRef.current = responseRecord;
  }, [responseRecord]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient.entities.WorkbookResponse.filter({ user_id: user.id, workbook_id: workbook.id })
      .then(saved => {
        const record = saved?.[0] || null;
        setResponseRecord(record);
        setResponses(record?.responses && typeof record.responses === 'object' ? record.responses : {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, workbook.id]);

  const rawPages = Array.isArray(workbook.pages)
    ? workbook.pages
    : Array.isArray(workbook.fields)
      ? workbook.fields
      : [];
  const pages = rawPages[0]?.fields
    ? rawPages
    : rawPages.length
      ? [{ page_id: 'workbook', title: workbook.title, fields: rawPages }]
      : [];
  const activePage = pages[activePageIndex];

  const handleFieldChange = (fieldId, value) => {
    if (!user?.id) return;
    const nextResponses = { ...responsesRef.current, [fieldId]: value };
    responsesRef.current = nextResponses;
    setResponses(nextResponses);
    if (saveTimeouts.current[fieldId]) clearTimeout(saveTimeouts.current[fieldId]);
    saveTimeouts.current[fieldId] = setTimeout(() => {
      saveChain.current = saveChain.current.catch(() => {}).then(async () => {
        const currentResponses = responsesRef.current;
        const existing = responseRecordRef.current;
        if (existing?.id) {
          const updated = await apiClient.entities.WorkbookResponse.update(existing.id, { responses: currentResponses });
          responseRecordRef.current = updated;
          setResponseRecord(updated);
        } else {
          const created = await apiClient.entities.WorkbookResponse.create({ user_id: user.id, workbook_id: workbook.id, responses: currentResponses });
          responseRecordRef.current = created;
          setResponseRecord(created);
        }
      });
    }, 800);
  };

  const handleCopyPrompt = () => {
    let prompt = `${workbook.title}\n\n`;
    pages.forEach(page => {
      prompt += `${page.title}\n\n`;
      page.fields?.forEach(field => {
        const val = responses[field.field_id] || '[Not yet answered]';
        prompt += `${field.label}\n${val}\n\n`;
      });
    });
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!pages.length) return (
    <div className="editorial-container text-center">
      <h3 className="text-xl mb-2">No original workbook content is available</h3>
      <p className="text-sm">This title was published without its original exercises, so no replacement content has been invented.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">{workbook.title}</h1>
        <p className="text-sm text-muted-foreground">{workbook.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={handleCopyPrompt} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy Responses'}
        </button>
        <button onClick={() => openPrintFriendly(workbook)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <Printer className="w-4 h-4" /> Printer-Friendly Download
        </button>
      </div>
      <div className="flex items-center gap-2 mb-6">
        {pages.map((page, i) => (
          <button key={page.page_id || i} onClick={() => setActivePageIndex(i)} className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all ${i === activePageIndex ? 'forged-gradient text-white' : 'bg-card text-muted-foreground hover:text-foreground'}`}>{i + 1}</button>
        ))}
      </div>
      {activePage && (
        <div className="editorial-container">
          <h2 className="text-xl mb-4">{activePage.title}</h2>
          {activePage.content && <p className="text-sm mb-6 opacity-80 leading-relaxed">{activePage.content}</p>}
          <div className="space-y-6">
            {activePage.fields?.map(field => (
              <div key={field.field_id}>
                <WorkbookField
                  field={field}
                  value={responses[field.field_id] || ''}
                  onChange={(v) => handleFieldChange(field.field_id, v)}
                />
                <ChecklistAddBox workbookTitle={workbook.title} />
              </div>
            ))}
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