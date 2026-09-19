import React, { useState, useEffect } from 'react';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StarSlider from './StarSlider';
import { AMAZON_REVIEW_URL } from '@/lib/bpmMilestones';

/**
 * One-time celebration when a member completes all 12 Power Moves.
 * Steps: celebrate → takeaway + star rating → share (4–5 stars) / improve (below 4).
 */
export default function Move12CelebrationModal({ open, onClose, onComplete }) {
  const [step, setStep] = useState('celebrate');
  const [takeaway, setTakeaway] = useState('');
  const [rating, setRating] = useState(5);
  const [improvement, setImprovement] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('celebrate');
      setTakeaway('');
      setRating(5);
      setImprovement('');
      setSaving(false);
    }
  }, [open]);

  const complete = async () => {
    setSaving(true);
    const data = { move12_asked: true };
    if (takeaway.trim()) data.takeaway = takeaway.trim();
    if (step === 'share' || step === 'improve') data.rating = rating;
    if (rating < 4 && improvement.trim()) data.improvement = improvement.trim();
    await onComplete?.(data);
    setSaving(false);
  };

  const handleOpenChange = (o) => {
    if (o || saving) return;
    if (step === 'celebrate') onClose?.();
    else complete();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border-border bg-card rounded-2xl p-8 text-center">
        {step === 'celebrate' && (
          <>
            <div
              className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              <PartyPopper className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <DialogTitle className="font-heading text-2xl font-light text-foreground">
              Look at you go!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-1">
              Bringing something like this full circle is a heck of a feat. I am SO celebrating
              you right now.
            </DialogDescription>
            <button
              onClick={() => setStep('questions')}
              className="btn-forge flex items-center justify-center gap-2 w-full rounded-lg py-3 text-sm font-semibold mt-6"
            >
              Keep Going <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 'questions' && (
          <>
            <DialogTitle className="font-heading text-2xl font-light text-foreground">
              I would really love to know —
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-1 mb-4">
              What was your favorite takeaway?
            </DialogDescription>
            <textarea
              value={takeaway}
              onChange={(e) => setTakeaway(e.target.value)}
              placeholder="The one thing you're carrying forward..."
              rows={3}
              className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors resize-none mb-6"
            />
            <p className="text-sm text-muted-foreground mb-4">How would you rate the book?</p>
            <StarSlider value={rating} onChange={setRating} />
            <button
              onClick={() => setStep(rating >= 4 ? 'share' : 'improve')}
              className="btn-forge flex items-center justify-center w-full rounded-lg py-3 text-sm font-semibold mt-6"
            >
              Share Your Take
            </button>
          </>
        )}

        {step === 'share' && (
          <>
            <DialogTitle className="font-heading text-2xl font-light text-foreground">
              That means more than you know.
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-1 mb-2">
              Would you mind sharing that feedback for others who would benefit? It's on Amazon
              for now — the book will be available in audio soon.
            </DialogDescription>
            <div className="flex flex-col gap-2 mt-6">
              <a
                href={AMAZON_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={complete}
                className="btn-forge flex items-center justify-center w-full rounded-lg py-3 text-sm font-semibold"
              >
                Share on Amazon
              </a>
              <button
                onClick={complete}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                No Thanks
              </button>
            </div>
          </>
        )}

        {step === 'improve' && (
          <>
            <DialogTitle className="font-heading text-2xl font-light text-foreground">
              Thank you for the honest read.
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-1 mb-4">
              I take that seriously. What could I do better to serve those I'm out to serve?
            </DialogDescription>
            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Tell me straight..."
              rows={3}
              className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors resize-none mb-6"
            />
            <button
              onClick={complete}
              disabled={saving}
              className="btn-forge flex items-center justify-center w-full rounded-lg py-3 text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Sending...' : 'Send'}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}