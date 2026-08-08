import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shuffle, Save, Trash2 } from 'lucide-react';

export default function BrandUp() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.BrandUpEntry.filter({}, '-created_date', 100),
      base44.entities.BrandUpPrompt.filter({ is_active: true }, 'order', 50),
    ]).then(([e, p]) => {
      setEntries(e || []);
      setPrompts(p || []);
      if (p?.length > 0) setCurrentIndex(Math.floor(Math.random() * p.length));
      setLoading(false);
    });
  }, []);

  const currentPrompt = prompts[currentIndex];

  const handleShuffle = () => {
    if (prompts.length <= 1) return;
    let next;
    do { next = Math.floor(Math.random() * prompts.length); } while (next === currentIndex);
    setCurrentIndex(next);
    setResponse('');
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentPrompt || !response.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.BrandUpEntry.create({
        prompt_id: currentPrompt.id,
        prompt_text: currentPrompt.prompt_text,
        response_text: response,
      });
      setEntries([created, ...entries]);
      setSaved(true);
      setResponse('');
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.BrandUpEntry.delete(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (_) {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">
          Brand <span className="molten-text italic">Up</span>
        </h1>
        <p className="text-sm text-[#f7f2ea]/60">Thoughtful prompts to empower your thinking. Save your reflections and revisit them anytime.</p>
      </div>

      {currentPrompt && (
        <div className="editorial-container mb-8">
          <h2 className="font-heading text-xl text-[#1a1420] mb-4 leading-relaxed">{currentPrompt.prompt_text}</h2>
          {currentPrompt.type === 'note' ? (
            <p className="text-sm text-[#1a1420]/50 italic mb-4">A note from The Brand Revivalist team.</p>
          ) : (
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Your response..."
              rows={4}
              className="w-full rounded-xl bg-white border border-black/10 px-4 py-3 text-sm text-[#1a1420] placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-y mb-4"
            />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-black/10 text-xs uppercase tracking-widest text-[#1a1420]/60 hover:bg-black/5 transition-colors"
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            {currentPrompt.type !== 'note' && (
              <button
                onClick={handleSave}
                disabled={saving || !response.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-30"
                style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
              >
                <Save className="w-4 h-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Response'}
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-lg text-[#f7f2ea] mb-4">Your Entries</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-[#f7f2ea]/40 italic">No saved entries yet. Respond to a prompt above to get started.</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="editorial-container group">
                <p className="font-heading text-base text-[#1a1420] mb-2 italic">"{entry.prompt_text}"</p>
                <p className="text-sm text-[#2c2c33] leading-relaxed">{entry.response_text}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
                  <span className="text-xs text-[#1a1420]/40">
                    {entry.created_date ? new Date(entry.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-[#1a1420]/30 hover:text-[#b3232c] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}