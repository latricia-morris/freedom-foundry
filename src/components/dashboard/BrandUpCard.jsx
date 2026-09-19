import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, Save, BookOpen } from 'lucide-react';
import apiClient from '@/api/client';

export default function BrandUpCard() {
  const [prompts, setPrompts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.entities.BrandUpPrompt.filter({ is_active: true }, 'order', 50)
      .then(p => {
        setPrompts(p || []);
        if (p?.length > 0) setCurrentIndex(Math.floor(Math.random() * p.length));
      })
      .catch(() => {});
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
      await apiClient.entities.BrandUpEntry.create({
        prompt_id: currentPrompt.id,
        prompt_text: currentPrompt.prompt_text,
        response_text: response,
      });
      setSaved(true);
      setResponse('');
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  if (prompts.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-8 lg:p-10">
      <div className="absolute -top-20 -right-20 w-64 h-64 ember-glow-bg opacity-40" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Brand Up</span>
          <Link to="/brand-portal/brand-up" className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> My Entries
          </Link>
        </div>
        {currentPrompt && (
          <>
            <h2 className="font-heading text-2xl lg:text-3xl font-light text-foreground leading-tight mb-6">
              {currentPrompt.prompt_text}
            </h2>
            {currentPrompt.type === 'note' ? (
            <p className="text-sm text-muted-foreground/70 italic mb-4">A note from The Brand Revivalist® team.</p>
            ) : (
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Your response..."
                rows={3}
                className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors resize-none mb-4"
              />
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-xs uppercase tracking-widest text-muted-foreground/80 hover:text-foreground hover:border-muted-foreground/40 transition-colors"
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
          </>
        )}
      </div>
    </div>
  );
}