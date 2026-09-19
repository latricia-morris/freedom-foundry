import React from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AMAZON_REVIEW_URL } from '@/lib/bpmMilestones';

/**
 * One-time review nudge when a member reaches Power Move 4.
 */
export default function Move4NudgeModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md border-border bg-card rounded-2xl p-8 text-center">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          <Star className="w-7 h-7 text-white" fill="white" strokeWidth={1} />
        </div>
        <DialogTitle className="font-heading text-2xl font-light text-foreground">
          Four moves in — it's working.
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
          If Brand Power Moves is earning its spot in your hands, would you mind leaving the
          book a quick review? It's the single most helpful way for other brand-led businesses
          to find their way here.
        </DialogDescription>
        <div className="flex flex-col gap-2 mt-6">
          <a
            href={AMAZON_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-forge flex items-center justify-center w-full rounded-lg py-3 text-sm font-semibold"
          >
            Leave a Review
          </a>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}