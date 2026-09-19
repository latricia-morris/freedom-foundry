import React from 'react';
import { Plus } from 'lucide-react';

const GRADIENT_ID = 'add-btn-warm-gradient';

/**
 * Gradient add-link control — shared standard for every "Add …" row action.
 * Carries its own gradient defs so it renders correctly on any page.
 */
export default function AddLinkButton({ label, onAdd, disabled = false }) {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b3232c" />
            <stop offset="55%" stopColor="#d9622c" />
            <stop offset="100%" stopColor="#f0d9b5" />
          </linearGradient>
        </defs>
      </svg>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
      >
        <Plus className="w-4 h-4" style={{ stroke: `url(#${GRADIENT_ID})` }} strokeWidth={2} />
        <span className="molten-text">{label}</span>
      </button>
    </>
  );
}