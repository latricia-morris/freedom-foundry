import React, { useState, useEffect, useRef } from 'react';
import { Check, Upload, X, FileText, AlertCircle } from 'lucide-react';
import apiClient from '@/api/client';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AssetPreview from '@/components/brand/AssetPreview';

const PROJECT_TYPES = [
  'Brand / Rebrand',
  'Brand Refresh',
];

const SERVICE_OPTIONS = [
  'Logo Design',
  'Web Design',
  'Copywriting',
  'Print Collateral (brochures, sell sheets, stationery)',
  'Packaging Design',
  'Trade Show & Event Materials',
  'Social Assets and Ad Creative',
  'Digital Design (email templates, digital ads)',
  'Custom Website Design and Development',
  'UX/UI and Information Architecture',
  'Website Copywriting',
  'SEO Copywriting',
  'CRM Integration and Lead Capture Development',
];

export default function RequestServices() {
  const [projectTypes, setProjectTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([null, null, null]);
  const [fileUris, setFileUris] = useState([null, null, null]);
  const [uploading, setUploading] = useState([false, false, false]);
  const [depositAcknowledged, setDepositAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const prefillTasks = searchParams.get('tasks') || '';

  useEffect(() => {
    if (prefillTasks) {
      setNotes(prev => (prev ? prev + '\n\nSelected checklist items:\n' + prefillTasks : 'Selected checklist items:\n' + prefillTasks));
    }
  }, []);

  const toggleArray = (arr, setArr, value) => {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    const newUploading = [...uploading];
    newUploading[index] = true;
    setUploading(newUploading);
    try {
      const { file_uri } = await apiClient.integrations.Core.UploadPrivateFile({ file });
      const newUris = [...fileUris];
      newUris[index] = file_uri;
      setFileUris(newUris);
      const newFiles = [...files];
      newFiles[index] = file;
      setFiles(newFiles);
    } catch (_) {}
    const newUploading2 = [...uploading];
    newUploading2[index] = false;
    setUploading(newUploading2);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
    const newUris = [...fileUris];
    newUris[index] = null;
    setFileUris(newUris);
  };

  const canSubmit = (projectTypes.length > 0 || services.length > 0) && depositAcknowledged && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await apiClient.entities.ServiceRequestSubmission.create({
        service_type: 'Branding',
        project_type: projectTypes,
        service_options: services,
        notes,
        inspiration_file_uris: fileUris.filter(u => u),
        deposit_acknowledged: depositAcknowledged,
        status: 'submitted',
      });
      setSubmitted(true);
    } catch (_) {}
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="editorial-container text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}>
            <Check className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="font-heading text-2xl text-[#1a1420] mb-3">Request Received</h2>
          <p className="text-sm text-[#1a1420]/60 max-w-md mx-auto">
            Thank you for your proposal request. We aim to respond as quickly as possible based on project volume.
            Please allow 3-5 business days for a response.
          </p>
          <p className="text-sm text-[#1a1420]/50 mt-4">Submission does not guarantee acceptance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Request <span className="molten-text italic">Brand Services</span></h1>
        <p className="text-sm text-[#f7f2ea]/60">Tell us what you need and we'll prepare a proposal for your review.</p>
      </div>

      <div className="editorial-container space-y-8">
        {/* Project Type */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#1a1420]/50 mb-3 font-medium">Project Type</h3>
          <div className="space-y-2">
            {PROJECT_TYPES.map(pt => (
              <button
                key={pt}
                onClick={() => toggleArray(projectTypes, setProjectTypes, pt)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${projectTypes.includes(pt) ? 'border-[#b3232c] bg-[#b3232c]/5' : 'border-black/10 bg-white hover:border-black/25'}`}
              >
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${projectTypes.includes(pt) ? 'border-[#b3232c] bg-[#b3232c]' : 'border-black/30 bg-white'}`}>
                  {projectTypes.includes(pt) && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className="text-[#1a1420]">{pt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#1a1420]/50 mb-3 font-medium">Services Needed</h3>
          <div className="space-y-2">
            {SERVICE_OPTIONS.map(svc => (
              <button
                key={svc}
                onClick={() => toggleArray(services, setServices, svc)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${services.includes(svc) ? 'border-[#b3232c] bg-[#b3232c]/5' : 'border-black/10 bg-white hover:border-black/25'}`}
              >
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${services.includes(svc) ? 'border-[#b3232c] bg-[#b3232c]' : 'border-black/30 bg-white'}`}>
                  {services.includes(svc) && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className="text-[#1a1420]">{svc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2 font-medium">Notes</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Tell us about your project, timeline, and any specific needs..."
            rows={5}
            className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 outline-none focus:border-[#b3232c] transition-colors resize-y"
          />
        </div>

        {/* Inspiration Uploads */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2 font-medium">Inspiration (up to 3 files)</h3>
          <p className="text-xs text-[#1a1420]/40 mb-3">Upload images, documents, or links that inspire your project. Files are securely stored.</p>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i}>
                {fileUris[i] ? (
                  <div className="relative">
                    <AssetPreview url={fileUris[i]} alt={`Inspiration ${i + 1}`} size="lg" onRemove={() => removeFile(i)} />
                    <p className="text-xs text-[#1a1420]/40 mt-1 truncate">{files[i]?.name}</p>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploading[i] ? 'border-[#b3232c] bg-[#b3232c]/5' : 'border-black/15 hover:border-[#b3232c]/40'}`}>
                    {uploading[i] ? (
                      <div className="w-5 h-5 border-2 border-[#b3232c] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#1a1420]/30" />
                        <span className="text-xs text-[#1a1420]/40 mt-1">Upload {i + 1}</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={e => e.target.files[0] && handleFileUpload(i, e.target.files[0])} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Deposit */}
        <div className="space-y-4 p-4 rounded-xl bg-[#1a1420]/3 border border-black/5">
          <p className="text-sm text-[#1a1420]/70">
            <Link to="/terms" className="link-warm inline" style={{ fontSize: '0.875rem' }}>For more information on our policies, please see our terms & conditions.</Link>
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={depositAcknowledged}
              onChange={e => setDepositAcknowledged(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-black/30 text-[#b3232c] focus:ring-[#b3232c] flex-shrink-0"
            />
            <span className="text-sm text-[#1a1420]/70 leading-relaxed">
              I understand that should my project request be eligible for agency services, a <strong>50% deposit</strong> is required to initiate the project, and the <strong>remaining 50%</strong> must be paid prior to the release of those assets.
            </span>
          </label>
        </div>

        {/* Response time note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#1a1420]/3">
          <AlertCircle className="w-4 h-4 text-[#1a1420]/40 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#1a1420]/50 leading-relaxed">
            We aim to respond as quickly as possible based on project volume. Please allow 3-5 business days for a response. Submission does not guarantee acceptance.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm uppercase tracking-widest text-white disabled:opacity-30"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {submitting ? 'Submitting...' : 'Request Proposal'}
        </button>
        <p className="text-center text-xs text-[#1a1420]/40">Submission does not guarantee acceptance.</p>
      </div>
    </div>
  );
}