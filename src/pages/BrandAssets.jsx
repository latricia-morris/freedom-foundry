import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMembership } from '@/lib/useMembership';
import { Lock, Upload, Download, Trash2, Sun, Moon } from 'lucide-react';

function ClientGate() {
  return (
    <div className="max-w-lg mx-auto py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(131deg, rgba(179,35,44,0.12), rgba(217,98,44,0.08))' }}>
        <Lock className="w-7 h-7 text-[#d9c9a3]" strokeWidth={1} />
      </div>
      <h2 className="font-heading text-2xl font-light text-[#f7f2ea] mb-3">Client Feature</h2>
      <p className="text-sm text-[#f7f2ea]/60 leading-relaxed max-w-sm mx-auto">
        This feature is reserved for clients working directly with The Brand Revivalist and/or her agency, Ox & Iron.
      </p>
    </div>
  );
}

const FILE_TYPES = ['logo', 'design_asset', 'print_collateral', 'digital_asset', 'deliverable', 'other'];
const FILE_TYPE_LABELS = { logo: 'Logo', design_asset: 'Design Asset', print_collateral: 'Print Collateral', digital_asset: 'Digital Asset', deliverable: 'Deliverable', other: 'Other' };

export default function BrandAssets() {
  const { isClient, loading: memberLoading } = useMembership();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (memberLoading) return;
    if (!isClient) { setLoading(false); return; }
    base44.entities.BrandAsset.filter({}, '-created_date', 100)
      .then(a => setAssets(a || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isClient, memberLoading]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const ext = file.name.split('.').pop()?.toLowerCase();
      let file_type = 'other';
      if (['png', 'svg', 'ai', 'eps'].includes(ext)) file_type = 'logo';
      const created = await base44.entities.BrandAsset.create({
        title: file.name.replace(/\.[^.]+$/, ''),
        file_url,
        file_type,
      });
      setAssets(prev => [created, ...prev]);
    } catch (_) {}
    setUploading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.BrandAsset.delete(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  if (memberLoading || loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!isClient) return <ClientGate />;

  const filtered = filter === 'all' ? assets : assets.filter(a => a.file_type === filter);

  return (
    <div className={`max-w-4xl animate-fade-in ${lightMode ? 'text-[#1a1420]' : ''}`}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
          <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Brand <span className="molten-text italic">Assets</span></h1>
          <p className="text-sm text-[#f7f2ea]/60">Logos, deliverables, and design files from your brand projects.</p>
        </div>
        <button
          onClick={() => setLightMode(!lightMode)}
          className="flex items-center gap-1.5 text-xs text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70 transition-colors"
        >
          {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="hidden sm:inline">{lightMode ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Upload + Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#f7f2ea]/70 hover:text-[#f7f2ea] hover:border-white/20 transition-colors">
          {uploading ? <span className="text-xs">Uploading...</span> : <><Upload className="w-4 h-4" /> Upload Asset</>}
          <input type="file" className="hidden" disabled={uploading} onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
        </label>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilter('all')} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filter === 'all' ? 'text-white' : 'text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70'}`} style={filter === 'all' ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}>All</button>
          {FILE_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${filter === t ? 'text-white' : 'text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70'}`} style={filter === t ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}>
              {FILE_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-12 text-center">
          <p className="text-[#f7f2ea]/40 text-sm">No assets uploaded yet.</p>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${lightMode ? 'bg-[#f7f2ea]' : 'bg-white/[0.02] border border-white/[0.04]'}`}>
          {filtered.map((asset, i) => (
            <div key={asset.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? (lightMode ? 'border-t border-black/10' : 'border-t border-white/5') : ''}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${lightMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <span className="text-xs uppercase font-mono opacity-50">{asset.file_url?.split('.').pop()?.slice(0, 3) || '...'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${lightMode ? 'text-[#1a1420]' : 'text-[#f7f2ea]'}`}>{asset.title}</p>
                <p className={`text-xs mt-0.5 ${lightMode ? 'text-[#1a1420]/50' : 'text-[#f7f2ea]/40'}`}>{FILE_TYPE_LABELS[asset.file_type] || 'File'}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={asset.file_url} download target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors ${lightMode ? 'hover:bg-black/5 text-[#1a1420]/50' : 'hover:bg-white/5 text-[#f7f2ea]/40'}`}>
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <button onClick={() => handleDelete(asset.id)} className={`p-2 rounded-lg transition-colors ${lightMode ? 'hover:bg-red-50 text-red-700/40' : 'hover:bg-red-900/20 text-red-400/40'}`}>
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}