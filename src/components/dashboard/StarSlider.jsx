import React from 'react';
import { Star } from 'lucide-react';

/**
 * 1–5 star rating slider with a molten gradient fill track.
 */
export default function StarSlider({ value = 5, onChange }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className="w-8 h-8 transition-all duration-200"
            style={{
              stroke: 'url(#warmGradient)',
              fill: n <= value ? 'url(#warmGradient)' : 'none',
              opacity: n <= value ? 1 : 0.35,
            }}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <div className="relative w-full max-w-[260px] h-8">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-input overflow-hidden border border-border/50">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
            style={{
              width: `${((value - 1) / 4) * 100}%`,
              background: 'linear-gradient(131deg, #b3232c 0%, #d9622c 55%, #f0d9b5 100%)',
            }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Rate the book from 1 to 5 stars"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}