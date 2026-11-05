import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import GuidelineSlot from './GuidelineSlot';
import { E } from './igniteApi';
import { safeParse } from '@/lib/guidelineParser';

export default function GuidelineManager({ folderId }) {
  const qc = useQueryClient();
  const key = ['ig-guideline', folderId];
  const { data: g, isPending } = useQuery({ queryKey: key, queryFn: async () => (await E.IgniteGuideline.filter({ folder_id: folderId }, '-created_date', 1))[0] || null });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const sourceRef = useRef(null);
  const pdfRef = useRef(null);

  const save = async (patch) => {
    if (g) await E.IgniteGuideline.update(g.id, patch);
    else await E.IgniteGuideline.create({ folder_id: folderId, ...patch });
    await qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ['glx', folderId] });
  };
  const run = async (name, fn) => { setBusy(name); try { await fn(); } finally { setBusy(''); } };

  const uploadSource = (file) => run('source', async () => {
    setError('');
    const format = /\.xml$/i.test(file.name) ? 'xml' : 'html';
    const parsed = safeParse(await file.text(), format);
    if (parsed.error) { setError(parsed.error); return; }
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    await save({ source_file_uri: file_uri, source_name: file.name, source_format: format, section_count: parsed.sections.length });
  });
  const uploadPdf = (file) => run('pdf', async () => {
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    await save({ pdf_file_uri: file_uri, pdf_name: file.name });
  });
  const saveUrl = (e) => {
    e.preventDefault();
    if (!/^https:\/\/\S+$/i.test(url.trim())) { setError('Enter a full https:// link to the published guidelines.'); return; }
    setError('');
    run('url', () => save({ published_url: url.trim() })).then(() => setUrl(''));
  };
  const pick = (ref) => ref.current?.click();
  const onFile = (fn) => (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) fn(f); };

  if (isPending) return <p className="ig-muted">Loading guidelines…</p>;
  return (
    <section className="ig-phase">
      <div className="ig-phasehead" style={{ cursor: 'default' }}>
        Brand Guidelines
        {(g?.source_file_uri || g?.published_url || g?.pdf_file_uri) && <Link to={`/ignite-os/clients/${folderId}/guidelines`} className="ig-btn" style={{ marginLeft: 'auto', textDecoration: 'none' }}>Open guidelines view</Link>}
      </div>
      <input ref={sourceRef} type="file" accept=".html,.htm,.xml,text/html,application/xml,text/xml" hidden onChange={onFile(uploadSource)} />
      <input ref={pdfRef} type="file" accept="application/pdf,.pdf" hidden onChange={onFile(uploadPdf)} />
      <GuidelineSlot title="Searchable guidelines (HTML / XML)" hint="Upload an HTML or XML export. H1 headings become chapters, H2 headings become sections."
        status={g?.source_file_uri && `${g.source_name} · ${g.section_count || 0} chapters`}>
        <button className="ig-btn ig-primary" disabled={!!busy} onClick={() => pick(sourceRef)}>{busy === 'source' ? 'Uploading…' : g?.source_file_uri ? 'Replace' : 'Upload'}</button>
        {g?.source_file_uri && <button className="ig-btn" disabled={!!busy} onClick={() => run('source', () => save({ source_file_uri: '', source_name: '', section_count: 0 }))}>Remove</button>}
      </GuidelineSlot>
      <GuidelineSlot title="Published guidelines link (Adobe InDesign)" hint="Paste the published InDesign link." status={g?.published_url}>
        {g?.published_url
          ? <button className="ig-btn" disabled={!!busy} onClick={() => run('url', () => save({ published_url: '' }))}>Remove</button>
          : <form onSubmit={saveUrl} style={{ display: 'flex', gap: 6 }}><input className="ig-input" placeholder="https://indd.adobe.com/view/…" value={url} onChange={(e) => setUrl(e.target.value)} /><button className="ig-btn ig-primary" disabled={!!busy}>Save</button></form>}
      </GuidelineSlot>
      <GuidelineSlot title="Guidelines PDF" hint="Upload a PDF version." status={g?.pdf_file_uri && g.pdf_name}>
        <button className="ig-btn ig-primary" disabled={!!busy} onClick={() => pick(pdfRef)}>{busy === 'pdf' ? 'Uploading…' : g?.pdf_file_uri ? 'Replace' : 'Upload'}</button>
        {g?.pdf_file_uri && <button className="ig-btn" disabled={!!busy} onClick={() => run('pdf', () => save({ pdf_file_uri: '', pdf_name: '' }))}>Remove</button>}
      </GuidelineSlot>
      {error && <p style={{ color: '#ff8a6b', margin: 0, padding: '0 14px 12px' }}>{error}</p>}
    </section>
  );
}