import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useProjectRequest(files, data) {
  const intent = new URLSearchParams(window.location.search).get('intent') === 'brand-health-index';
  const [form, setForm] = useState({ service_options: intent ? ['Brand Strategy & Rebranding'] : [], notes: intent ? 'I would like to request a Brand Health Index audit.' : '', timeline_window: '', deadline_date: '', deadline_firm: false, deadline_note: '', budget_original: '', budget_basis: 'total_project', budget_help_requested: false, link: '', acknowledged: false, agency_client_id: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const key = useRef(crypto.randomUUID());
  const lock = useRef(false);
  const queryClient = useQueryClient();
  const update = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setError(''); };
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current) return;
    if (!form.service_options.length) { setError('Select at least one service.'); document.querySelector('.request-choice')?.focus(); return; }
    if (!/[\p{L}\p{N}]/u.test(form.notes)) { setError('Tell us what needs to be created or improved.'); document.getElementById('project-description')?.focus(); return; }
    if (data.brands.length > 1 && !form.agency_client_id) { setError('Select the brand for this request.'); return; }
    lock.current = true; setSubmitting(true); setError('');
    try {
      const response = await base44.functions.invoke('submitProjectRequest', { ...form, agency_client_id: form.agency_client_id || data.brands[0]?.id || '', attachments: files.map(({ name, file_uri }) => ({ name, file_uri })), submission_key: key.current, request_purpose: intent ? 'brand_health_index' : 'project' });
      if (!response.data.record) throw new Error(response.data.error || 'The request could not be sent.');
      setSubmitted(response.data.record);
      queryClient.invalidateQueries({ queryKey: ['project-requests'] });
    } catch (failure) { setError(failure.response?.data?.error || failure.message || 'The request could not be sent. Your entries are still here; please try again.'); }
    finally { lock.current = false; setSubmitting(false); }
  };
  return { form, update, submit, error, submitting, submitted };
}