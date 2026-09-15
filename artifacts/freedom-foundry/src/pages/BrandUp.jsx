import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
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
      apiClient.entities.BrandUpEntry.filter({}, '-created_date', 100),
      apiClient.entities.BrandUpPrompt.filter({ is_active: true }, 'order', 50),
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
      const created = await apiClient.entities.BrandUpEntry.create({
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
      await apiClient.entities.BrandUpEntry.delete(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (_) {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1 mb-1">
          Brand <span className="molten-text italic">Up</span>
        </h1>
        <p className="text-sm text-muted-foreground">Thoughtful prompts to empower your thinking. Save your reflections and revisit them anytime.</p>
      </div>

      {currentPrompt && (
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <h2 className="font-heading text-xl text-foreground mb-4 leading-relaxed">{currentPrompt.prompt_text}</h2>
          {currentPrompt.type === 'note' ? (
            <p className="text-sm text-foreground/50 italic mb-4">A note from The Brand Revivalist® team.</p>
          ) : (
            <textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Your response..."
              rows={4}
              className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-y mb-4"
            />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-xs uppercase tracking-widest text-foreground/60 hover:bg-accent transition-colors"
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            {currentPrompt.type !== 'note' && (
              <button
                onClick={handleSave}
                disabled={saving || !response.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-30 bg-primary hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Response'}
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-lg text-foreground mb-4">Your Entries</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground/70 italic">No saved entries yet. Respond to a prompt above to get started.</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 shadow-sm group">
                <p className="font-heading text-base text-foreground mb-2 italic">"{entry.prompt_text}"</p>
                <p className="text-sm text-foreground leading-relaxed">{entry.response_text}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-foreground/40">
                    {entry.created_date ? new Date(entry.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-foreground/30 hover:text-primary transition-colors"
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