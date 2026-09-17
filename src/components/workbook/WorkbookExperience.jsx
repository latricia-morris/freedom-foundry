import React, { useState, useEffect, useRef } from 'react';
import { Copy, Printer, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/api/client';
import WorkbookField from '@/components/workbook/WorkbookField';
import ChecklistAddBox from '@/components/workbook/ChecklistAddBox';
import openPrintFriendly from '@/components/workbook/openPrintFriendly';

function getPaginationItems(totalPages, activePageIndex) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);

  const visiblePages = new Set([0, totalPages - 1, activePageIndex]);
  if (activePageIndex <= 2) {
    [1, 2, 3].forEach(index => visiblePages.add(index));
  } else if (activePageIndex >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2].forEach(index => visiblePages.add(index));
  } else {
    [activePageIndex - 1, activePageIndex + 1].forEach(index => visiblePages.add(index));
  }

  const sortedPages = [...visiblePages].sort((a, b) => a - b);
  return sortedPages.reduce((items, pageIndex, position) => {
    if (position > 0 && pageIndex - sortedPages[position - 1] > 1) {
      items.push(`ellipsis-${pageIndex}`);
    }
    items.push(pageIndex);
    return items;
  }, []);
}

function WorkbookPagination({ pageCount, activePageIndex, onPageChange }) {
  if (pageCount <= 1) return null;

  const goToPrevious = () => onPageChange(Math.max(0, activePageIndex - 1));
  const goToNext = () => onPageChange(Math.min(pageCount - 1, activePageIndex + 1));

  return (
    <nav aria-label="Workbook pages" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={activePageIndex === 0}
          className="flex min-w-0 shrink-0 items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <span className="min-w-0 text-center text-xs uppercase tracking-widest text-muted-foreground">
          Page <span className="font-semibold text-foreground">{activePageIndex + 1}</span> of {pageCount}
        </span>
        <button
          type="button"
          onClick={goToNext}
          disabled={activePageIndex === pageCount - 1}
          className="flex min-w-0 shrink-0 items-center gap-1.5 text-xs uppercase tracking-widest text-primary transition-colors hover:text-copper disabled:opacity-30"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5" role="list">
        {getPaginationItems(pageCount, activePageIndex).map(item => (
          typeof item === 'string' ? (
            <span key={item} className="flex h-8 w-6 items-center justify-center text-xs text-muted-foreground" aria-hidden="true">…</span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              aria-current={item === activePageIndex ? 'page' : undefined}
              aria-label={`Go to page ${item + 1}`}
              className={`h-8 min-w-8 rounded px-2 text-xs transition-all ${
                item === activePageIndex
                  ? 'forged-gradient text-white'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {item + 1}
            </button>
          )
        ))}
      </div>
    </nav>
  );
}

export default function WorkbookExperience({ workbook }) {
  const { user } = useAuth();
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
        <button onClick={() => openPrintFriendly(workbook, responses)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <Printer className="w-4 h-4" /> Printer-Friendly Download
        </button>
      </div>
      <div className="mb-6">
        <WorkbookPagination
          pageCount={pages.length}
          activePageIndex={activePageIndex}
          onPageChange={setActivePageIndex}
        />
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
      <div className="mt-6">
        <WorkbookPagination
          pageCount={pages.length}
          activePageIndex={activePageIndex}
          onPageChange={setActivePageIndex}
        />
      </div>
    </div>
  );
}