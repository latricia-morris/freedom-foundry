import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, UploadCloud, UserCheck } from 'lucide-react';
import apiClient from '@/api/client';
import ClientPicker from '@/components/admin/ClientPicker';
import ImportUploadStep from '@/components/import/ImportUploadStep';
import ImportReviewForm from '@/components/import/ImportReviewForm';
import { normalizeDraft } from '@/lib/clientImport';

const STEPS = [
  { key: 'select', label: 'Select Client' },
  { key: 'upload', label: 'Upload Files' },
  { key: 'review', label: 'Review Draft' },
  { key: 'summary', label: 'Saved' },
];

export default function AdminClientImport() {
  const [step, setStep] = useState('select');
  const [client, setClient] = useState(null);
  const [draft, setDraft] = useState(null);
  const [existing, setExisting] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const clientLabel = client
    ? `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email || 'client'
    : '';

  const pickClient = (user) => {
    setClient(user);
    setDraft(null);
    setExisting(null);
    setSummary(null);
    setError('');
    setStep('upload');
  };

  const handleParsed = (parsedDraft, uploadedFiles, assets) => {
    setDraft(normalizeDraft({ ...parsedDraft, assets }));
    setStep('review');
    setError('');
    apiClient.admin.getClientBrandData(client.id)
      .then((data) => setExisting(data))
      .catch(() => setExisting({}));
  };

  const onChangeField = (section, key, value) => {
    setDraft((previous) => ({
      ...previous,
      [section]: { ...previous[section], [key]: value },
    }));
  };

  const onArrayChange = (section, key, rows) => {
    setDraft((previous) => ({
      ...previous,
      [section]: { ...previous[section], [key]: rows },
    }));
  };

  const onAssets = (assets) => setDraft((previous) => ({ ...previous, assets }));

  const apply = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await apiClient.admin.applyClientImport(client.id, draft);
      setSummary(result);
      setStep('summary');
    } catch (err) {
      setError(err?.message || 'The import could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep('select');
    setClient(null);
    setDraft(null);
    setExisting(null);
    setSummary(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 ember-glow-bg z-[-1]" />
        <h1 className="font-heading text-4xl font-light text-foreground mb-3 tracking-wide">
          Client <span className="molten-text italic font-medium">Import</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Upload a client's brand materials and let the Foundry parse them into the right places in their portal — you review everything before it saves.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {STEPS.map((entry, index) => {
          const stepIndex = STEPS.findIndex((s) => s.key === step);
          const isActive = index === stepIndex;
          const isDone = index < stepIndex;
          return (
            <span key={entry.key} className="flex items-center gap-2">
              {index > 0 && <span className="w-6 h-px bg-border" />}
              <span
                className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                  isActive ? 'border-primary/50 text-primary bg-primary/10'
                  : isDone ? 'border-border text-muted-foreground'
                  : 'border-border/50 text-muted-foreground/60'
                }`}
              >
                {isDone ? <Check className="w-3 h-3" /> : null}
                {entry.label}
              </span>
            </span>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start justify-between gap-3">
          <span>{error}</span>
          {step === 'upload' && <button type="button" onClick={() => setError('')} className="text-xs uppercase tracking-wider underline underline-offset-4 shrink-0">Dismiss</button>}
        </div>
      )}

      {step === 'select' && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Choose the client whose portal you are loading.</p>
          <ClientPicker selected={client} onSelect={pickClient} />
        </div>
      )}

      {step === 'upload' && client && (
        <div>
          <div className="dashboard-card border border-border p-4 mb-5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-sm text-foreground">
              <UserCheck className="w-4 h-4 text-primary" />
              Importing for <strong className="font-medium">{clientLabel}</strong>
            </span>
            <button type="button" onClick={() => setStep('select')} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8a482d]">
              <ArrowLeft className="w-3.5 h-3.5" /> Change client
            </button>
          </div>
          <ImportUploadStep client={client} onParsed={handleParsed} onError={setError} />
        </div>
      )}

      {step === 'review' && draft && (
        <div>
          <ImportReviewForm
            draft={draft}
            existing={existing}
            onChange={onChangeField}
            onArrayChange={onArrayChange}
            onAssets={onAssets}
          />
          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
            <button type="button" onClick={() => setStep('upload')} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to files
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={saving}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-8 py-3 text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save to {clientLabel}'s Portal
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && summary && (
        <div className="dashboard-card border border-border p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
            <Check className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-heading text-3xl text-foreground mb-2">Import complete</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {clientLabel}'s portal has been updated. Here is exactly what was saved:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
            {[
              ['Personal Brand Profile', summary.personal],
              ['Corporate Brand Profile', summary.corporate],
              ['Brand Guidelines', summary.guidelines],
              ['Media Kit', summary.media_kit],
            ].map(([label, outcome]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-4 py-3">
                <span className="text-sm text-foreground">{label}</span>
                <span className={`text-[10px] uppercase tracking-wider ${
                  outcome === 'created' ? 'text-primary' : outcome === 'updated' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {outcome === 'created' ? 'Created' : outcome === 'updated' ? 'Updated' : 'Nothing to save'}
                </span>
              </div>
            ))}
            {summary.assets > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-4 py-3 sm:col-span-2">
                <span className="text-sm text-foreground">Brand Assets added</span>
                <span className="text-[10px] uppercase tracking-wider text-primary">{summary.assets} files</span>
              </div>
            )}
          </div>
          <button type="button" onClick={reset} className="btn-forge inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs uppercase tracking-widest mt-8">
            <UploadCloud className="w-4 h-4" /> Import Another Client
          </button>
        </div>
      )}
    </div>
  );
}