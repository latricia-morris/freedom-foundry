import React from 'react';
import { Plus, X, BookOpen } from 'lucide-react';

export default function BookLinks({ hasBooks, bookLinks, onToggle, onUpdate, onAdd, onRemove, dark = false }) {
  const labelClass = dark
    ? "block text-xs uppercase tracking-wider text-[#f7f2ea]/50 mb-2"
    : "block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2";
  const btnClass = dark
    ? "px-4 py-2 rounded-lg border text-sm transition-colors"
    : "px-4 py-2 rounded-lg border text-sm transition-colors";

  return (
    <div>
      <label className={labelClass}>Have you authored any books?</label>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onToggle(true)}
          className={`${btnClass} ${hasBooks
            ? dark ? 'border-[#b3232c] bg-[#b3232c]/20 text-[#f7f2ea]' : 'border-[#b3232c] bg-[#b3232c]/10 text-[#b3232c]'
            : dark ? 'border-white/10 text-[#f7f2ea]/50 hover:text-[#f7f2ea]' : 'border-black/10 text-[#1a1420]/50 hover:text-[#1a1420]'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onToggle(false)}
          className={`${btnClass} ${!hasBooks
            ? dark ? 'border-white/20 bg-white/10 text-[#f7f2ea]' : 'border-black/20 bg-black/5 text-[#1a1420]'
            : dark ? 'border-white/10 text-[#f7f2ea]/50 hover:text-[#f7f2ea]' : 'border-black/10 text-[#1a1420]/50 hover:text-[#1a1420]'
          }`}
        >
          No
        </button>
      </div>

      {hasBooks && (
        <div className="space-y-2">
          {bookLinks.map((book, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm ${dark ? 'bg-white/[0.04] text-[#f7f2ea] border-white/10 placeholder:text-[#f7f2ea]/30' : 'bg-white text-[#1a1420] border-black/10 placeholder:text-black/30'} border outline-none focus:border-[#b3232c] transition-colors`}
                value={book.title || ''}
                onChange={e => onUpdate(i, 'title', e.target.value)}
                placeholder="Book title"
              />
              <input
                className={`flex-[2] rounded-xl px-4 py-2.5 text-sm ${dark ? 'bg-white/[0.04] text-[#f7f2ea] border-white/10 placeholder:text-[#f7f2ea]/30' : 'bg-white text-[#1a1420] border-black/10 placeholder:text-black/30'} border outline-none focus:border-[#b3232c] transition-colors`}
                value={book.url || ''}
                onChange={e => onUpdate(i, 'url', e.target.value)}
                placeholder="Link (Amazon, website, etc.)"
              />
              <button onClick={() => onRemove(i)} className={`px-2 ${dark ? 'text-[#f7f2ea]/30 hover:text-[#f7f2ea]/60' : 'text-black/30 hover:text-black/60'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onAdd({ title: '', url: '' })}
            className={`flex items-center gap-1.5 text-sm ${dark ? 'text-[#d9c9a3] hover:opacity-80' : 'text-[#b3232c] hover:opacity-80'} transition-opacity`}
          >
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </div>
      )}
    </div>
  );
}