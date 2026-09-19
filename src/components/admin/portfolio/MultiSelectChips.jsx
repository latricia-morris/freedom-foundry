import React from 'react';

export default function MultiSelectChips({ options, selected, onToggle, emptyText }) {
  const items = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
  if (!items.length) {
    return <p className="text-xs text-muted-foreground/70">{emptyText || 'No options available yet.'}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ value, label }) => {
        const active = (selected || []).includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(value)}
            className={`rounded-sm px-2.5 py-1.5 text-xs tracking-wide transition-colors ${
              active
                ? 'btn-forge font-semibold'
                : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}