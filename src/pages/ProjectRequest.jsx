import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Link2, Paperclip, ShieldCheck, Upload, X } from 'lucide-react';
import apiClient from '@/api/client';
import { base44 } from '@/api/base44Client';

const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'docx', 'txt', 'csv'];
const MAX_FILE_MB = 10;
const MAX_FILES = 3;

export default function ProjectRequest() {
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFiles = async (fileList) => {
    setError('');
    const room = MAX_FILES - files.length;
    const picked = [...fileList].slice(0, Math.max(room, 0));
    if (!picked.length) return;
    setUploading(true);
    for (const file of picked) {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`${file.name}: only PDF, Word, image, or text files are accepted.`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`${file.name}: must be ${MAX_FILE_MB} MB or smaller.`);
        continue;
      }
      try {
        const { file_uri } = await apiClient.integrations.Core.UploadPrivateFile({ file });
        const res = await base44.functions.invoke('scan-upload', { file_uri, filename: file.name });
        const scan = res?.data ?? res;
        if (!scan || !scan.ok) {
          setError(`${file.name} did not pass the security scan and was not attached.`);
          continue;
        }
        setFiles((prev) => (prev.length < MAX_FILES ? [...prev, { file_uri, name: file.name }] : prev));
      } catch {
        setError(`${file.name} could not be uploaded. Please try again.`);
      }
    }
    setUploading(false);
  };

  const removeFile = (uri) => setFiles((prev) => prev.filter((f) => f.file_uri !== uri));

  const handleSubmit = async () => {
    if (!notes.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.services.createRequest({
        request_kind: 'project_request',
        service_type: 'Project request',
        objective: '',
        notes,
        details: { message: notes, link: link.trim(), attachments: files.map((f) => f.name) },
      });
      setSubmitted(true);
    } catch {
      setError('The request could not be sent. Please try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <div className="editorial-card text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}>
            <Check className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="font-heading text-2xl text-foreground mb-3">Request Received</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for your project request. We aim to respond as quickly as possible based on project volume.
            Please allow 3-5 business days for a response.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-4">Submission does not guarantee acceptance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in text-foreground">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1 mb-1">Project <span className="molten-text italic">Request</span></h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
          Ask us to take on a project: describe the work, attach a sample document or image, and drop any reference link.
        </p>
      </div>

      <div className="editorial-card space-y-8">
        {/* Description */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">What do you need?</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us about the project, your goal, and any deadlines..."
            rows={5}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors resize-y"
          />
        </div>

        {/* Sample uploads */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Sample doc or image (up to {MAX_FILES})</h3>
          <p className="text-xs text-muted-foreground/70 mb-3">PDF, Word, images, or text. Every file is scanned for security before it is attached.</p>
          <div className="space-y-2">
            {files.map((f) => (
              <div key={f.file_uri} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <Paperclip className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                <span className="flex-1 min-w-0 truncate text-sm text-foreground">{f.name}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> Scanned
                </span>
                <button type="button" onClick={() => removeFile(f.file_uri)} className="p-1 rounded-md text-muted-foreground hover:text-foreground" aria-label={`Remove ${f.name}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {files.length < MAX_FILES && (
              <label className={`flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-4 py-6 text-sm cursor-pointer transition-colors ${uploading ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}>
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Scanning &amp; uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Choose a file</>
                )}
                <input
                  type="file"
                  className="hidden"
                  multiple
                  disabled={uploading}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.docx,.txt,.csv"
                  onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Link */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Drop a link</h3>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4">
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent py-3 text-sm text-foreground outline-none"
            />
          </div>
        </div>

        {/* Terms & deposit */}
        <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <Link to="/terms" className="link-warm inline" style={{ fontSize: '0.875rem' }}>For more information on our policies, please see our terms &amp; conditions.</Link>
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={depositAcknowledged}
              onChange={(e) => setDepositAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary flex-shrink-0"
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              I understand that should my project request be eligible for agency services, a <strong>50% deposit</strong> is required to initiate the project, and the <strong>remaining 50%</strong> must be paid prior to the release of those assets.
            </span>
          </label>
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            We aim to respond as quickly as possible based on project volume. Please allow 3-5 business days for a response. Submission does not guarantee acceptance.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!notes.trim() || !depositAcknowledged || submitting || uploading}
          className="btn-forge w-full rounded-xl px-6 py-3.5 text-sm font-semibold uppercase tracking-widest disabled:opacity-40"
        >
          {submitting ? 'Submitting...' : 'Request Project'}
        </button>
        <p className="text-center text-xs text-muted-foreground/60">Submission does not guarantee acceptance.</p>
      </div>
    </div>
  );
}