import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import VisibilityIntake from '@/components/admin/agency/VisibilityIntake';
import ReportSourceStep from '@/components/admin/brandHealth/intake/ReportSourceStep';
import StructurePromptButton from '@/components/admin/brandHealth/intake/StructurePromptButton';
import AuditReportReview from '@/components/admin/brandHealth/intake/AuditReportReview';
import { REPORT_TYPES, REPORT_TYPE_LABELS } from '@/lib/reportIntake';
import { findAudit, parseAuditReport, saveAuditReport } from '@/lib/auditReportParse';

/** The one place brand health reports are loaded: pick a client, paste or upload, review, save. */
export default function AdminBrandHealthIntake() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const [clients, setClients] = useState([]);
  const [source, setSource] = useState({
    clientId: params.get('client') || '',
    type: REPORT_TYPES.some((t) => t.key === params.get('type')) ? params.get('type') : 'visibility',
    text: '',
    fileName: '',
  });
  const [step, setStep] = useState('source');
  const [draft, setDraft] = useState(null);
  const [replaces, setReplaces] = useState(false);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    base44.entities.AgencyClient.filter({}, 'company_name', 300).then((rows) => setClients(rows || []));
  }, []);

  const client = clients.find((c) => c.id === source.clientId);
  const isVisibility = source.type === 'visibility';

  const parse = async () => {
    if (isVisibility) return setStep('review');
    setBusy('parse');
    try {
      const [parsed, existing] = await Promise.all([parseAuditReport(source.type, source.text), findAudit(source.clientId, source.type)]);
      setDraft(parsed);
      setReplaces(!!existing);
      setStep('review');
    } catch (e) {
      toast({ title: 'The report could not be parsed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const save = async () => {
    setBusy('save');
    try {
      const id = await saveAuditReport({ clientId: source.clientId, type: source.type, draft, sourceText: source.text, sourceName: source.fileName });
      toast({ title: 'Report saved', description: `${client.company_name} · ${REPORT_TYPE_LABELS[source.type]}` });
      navigate(`/admin/brand-health/${id}`);
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6 pb-12">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Intelligence</p>
        <h1 className="mt-1 font-heading text-4xl font-light text-foreground">Report <span className="molten-text italic">Intake</span></h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Load any brand health report here. Paste it or upload a text file, check the parsed fields, then save it to the client.
        </p>
      </div>

      {step === 'source' && (
        <>
          <ReportSourceStep clients={clients} value={source} onChange={setSource} onParse={parse} parsing={busy === 'parse'} />
          <StructurePromptButton type={source.type} />
        </>
      )}

      {step === 'review' && isVisibility && client && (
        <VisibilityIntake client={client} rawText={source.text} sourceName={source.fileName} onCancel={() => setStep('source')} onSaved={() => navigate(`/admin/agency/visibility/${client.id}`)} />
      )}

      {step === 'review' && !isVisibility && draft && (
        <div className="dashboard-card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl text-foreground">{REPORT_TYPE_LABELS[source.type]} · {client?.company_name}</h2>
              <p className="text-xs text-muted-foreground">
                {replaces
                  ? 'This client already has this audit. Saving replaces its scores, summary, takeaways and action plan.'
                  : 'Review the parsed fields. Nothing is saved until you press Save report.'}
              </p>
            </div>
            <button type="button" onClick={() => setStep('source')} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to source
            </button>
          </div>
          <AuditReportReview type={source.type} draft={draft} onChange={setDraft} />
          <button type="button" onClick={save} disabled={!!busy} className="btn-forge mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
            {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save report
          </button>
        </div>
      )}
    </div>
  );
}