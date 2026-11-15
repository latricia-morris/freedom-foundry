import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { composePrompt, learnApi } from '@/lib/learn';

/** A lesson worksheet: answers save as the learner types, and the finished prompt copies in one click. */
export default function Worksheet({ worksheet, initialAnswers, offeringId, lessonId }) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const change = (id, value) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await learnApi('saveAnswers', { offering_id: offeringId, lesson_id: lessonId, answers: next });
      setSaved(true);
    }, 900);
  };

  const answered = worksheet.questions.filter((q) => (answers[q.id] || '').trim()).length;

  const copy = async () => {
    await navigator.clipboard.writeText(composePrompt(worksheet, answers));
    setCopied(true);
    toast({ title: 'Prompt copied', description: 'Paste it into the AI tool of your choice.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border border-border bg-card p-6 sm:p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Worksheet</p>
      <h3 className="mt-2 font-heading text-3xl text-foreground">{worksheet.title || 'Do the work'}</h3>
      {worksheet.intro && <p className="mt-2 text-muted-foreground">{worksheet.intro}</p>}

      <div className="mt-6 space-y-6">
        {worksheet.questions.map((q, i) => (
          <div key={q.id}>
            <label htmlFor={`ws-${q.id}`} className="mb-2 block text-sm font-medium text-foreground">
              <span className="mr-2 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>{q.label}
            </label>
            <textarea id={`ws-${q.id}`} className="admin-input min-h-28" value={answers[q.id] || ''} onChange={(e) => change(q.id, e.target.value)} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
          {answered} of {worksheet.questions.length} answered · {saved ? 'Saved' : 'Saving…'}
        </p>
        <button type="button" onClick={copy} disabled={!answered} className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-3 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy my completed prompt'}
        </button>
      </div>
    </section>
  );
}