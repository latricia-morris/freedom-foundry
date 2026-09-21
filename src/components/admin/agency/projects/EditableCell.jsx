import React, { useEffect, useRef, useState } from 'react';

/**
 * Click-to-edit table cell: shows the value, clicking swaps in an editor
 * that commits on blur or Enter and cancels on Escape.
 */
export default function EditableCell({ value, type = 'text', options = [], placeholder = '—', onCommit, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => { if (!editing) setDraft(value ?? ''); }, [value, editing]);
  useEffect(() => { if (editing && inputRef.current?.focus) inputRef.current.focus(); }, [editing]);

  const commitWith = (next) => {
    setEditing(false);
    if (next !== (value ?? '')) onCommit(next);
  };

  if (editing) {
    if (type === 'select') {
      return (
        <select
          ref={inputRef}
          className="admin-input w-full py-1 text-xs"
          value={draft}
          onChange={(e) => commitWith(e.target.value)}
          onBlur={(e) => commitWith(e.target.value)}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return (
      <input
        ref={inputRef}
        type={type}
        className="admin-input w-full py-1 text-xs"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitWith(typeof draft === 'string' ? draft.trim() : draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commitWith(typeof draft === 'string' ? draft.trim() : draft); }
          if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false); }
        }}
      />
    );
  }

  let display = value;
  if (type === 'select') display = (options.find((o) => o.value === value) || {}).label;
  if (type === 'date' && value) display = new Date(value).toLocaleDateString();

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`w-full truncate rounded-sm px-1.5 py-1 text-left transition-colors hover:bg-accent/60 ${className}`}
      title={value || ''}
    >
      {display || <span className="text-muted-foreground/50">{placeholder}</span>}
    </button>
  );
}