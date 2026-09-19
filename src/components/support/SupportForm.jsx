import React, { useState } from 'react';
import { Bug, Lightbulb, Upload, X, Check, Send } from 'lucide-react';
import apiClient from '@/api/client';
import { toast } from '@/components/ui/use-toast';

const TYPES = [
  { key: 'bug_report', label: 'Bug Report', hint: 'Something broken, wrong, or missing', icon: Bug },
  { key: 'feature_request', label: 'Feature Request', hint: 'An idea to make the Foundry better', icon: Lightbulb },
];

export default function SupportForm() {
  const [type, setType] = useState('bug_report');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleScreenshot = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({ title: 'Images only', description: 'Please attach a screenshot as an image file.' });
      return;
    }
    if (screenshots.length >= 3) return;
    setUploading(true);
    try {
      const { file_url } = await apiClient.integrations.Core.UploadFile({ file });
      setScreenshots(prev => [...prev, file_url]);
    } catch (_) {
      toast({ title: 'Could not upload screenshot', variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim() || submitting) return;
    setSubmitting(true);
    try {
      let page_url = '';
      try {
        if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
          page_url = new URL(document.referrer).pathname;
        }
      } catch (_) { /* referrer optional */ }
      await apiClient.entities.BugReport.create({
        type,
        description: description.trim(),
        page_url,
        screenshot_urls: screenshots,
        status: 'open',
      });
      setDescription('');
      setScreenshots([]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 6000);
    } catch (error) {
      toast({
        title: 'Could not submit',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Type toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPES.map(({ key, label, hint, icon: Icon }) => {
          const active = type === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                active
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 ${active ? 'text-primary' : ''}`} strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs mt-0.5 opacity-70">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="support-description" className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
          {type === 'feature_request' ? 'What should we build or improve?' : 'What went wrong?'}
        </label>
        <textarea
          id="support-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={
            type === 'feature_request'
              ? 'Describe the feature or improvement you have in mind...'
              : 'Describe the issue — what you were doing and what happened...'
          }
          rows={5}
          maxLength={5000}
          required
          className="w-full forged-well px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors resize-y"
        />
        <p className="mt-1 text-right text-[11px] text-muted-foreground/60">{description.length}/5000</p>
      </div>

      {/* Screenshots — up to 3 */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
          Screenshots <span className="normal-case tracking-normal opacity-70">(optional, up to 3)</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {screenshots.map((url, i) => (
            <div key={url} className="relative">
              <img src={url} alt={`Screenshot ${i + 1}`} className="w-20 h-14 rounded object-cover border border-border" />
              <button
                type="button"
                onClick={() => setScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {screenshots.length < 3 && (
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors">
              {uploading ? 'Uploading...' : <><Upload className="w-3.5 h-3.5" /> Attach Screenshot</>}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={e => {
                  if (e.target.files[0]) handleScreenshot(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!description.trim() || submitting}
          className="btn-forge inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {submitted ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {submitting ? 'Sending...' : submitted ? 'Sent!' : 'Send to the Team'}
        </button>
        {submitted && (
          <p role="status" className="text-sm text-primary">
            Thanks — your {type === 'feature_request' ? 'feature request' : 'bug report'} is in the team's queue.
          </p>
        )}
      </div>
    </form>
  );
}