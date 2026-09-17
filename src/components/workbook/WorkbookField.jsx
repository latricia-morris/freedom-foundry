import React from 'react';

// WorkbookField — data-driven renderer for a single workbook question.
// Picks the right input component based on `field.type` and keeps the
// saved value as a string (per WorkbookResponse.value), serializing
// arrays (checkbox) and numbers (rating) as JSON/plain strings.

const parseArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
};

/* ---------- field renderers ---------- */

function ShortTextInput({ field, value, onChange }) {
  return (
    <input
      type="text"
      maxLength={field.character_limit}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || ''}
    />
  );
}

function LongTextInput({ field, value, onChange }) {
  return (
    <textarea
      maxLength={field.character_limit}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      placeholder={field.placeholder || ''}
    />
  );
}

function CurrencyInput({ field, value, onChange }) {
  return (
    <input
      type="number"
      min={0}
      step="0.01"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || '0.00'}
    />
  );
}

function SelectInput({ field, value, onChange }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{field.placeholder || 'Select an option...'}</option>
      {(field.options || []).map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function RadioInput({ field, value, onChange }) {
  return (
    <div className="space-y-2">
      {(field.options || []).map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm flex items-center gap-3 ${
              selected ? 'border-[#b3232c] bg-[#b3232c]/5' : 'border-black/10 bg-white hover:border-black/25'
            }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#b3232c]' : 'border-black/30'}`}>
              {selected && <span className="w-2 h-2 rounded-full forged-gradient" />}
            </span>
            <span className="text-[#1a1420]">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function CheckboxInput({ field, value, onChange }) {
  const arr = parseArray(value);
  const toggle = (opt) => {
    const next = arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt];
    onChange(JSON.stringify(next));
  };
  return (
    <div className="space-y-2">
      {(field.options || []).map((opt) => {
        const checked = arr.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm flex items-center gap-3 ${
              checked ? 'border-[#b3232c] bg-[#b3232c]/5' : 'border-black/10 bg-white hover:border-black/25'
            }`}
          >
            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'border-[#b3232c] bg-[#b3232c]' : 'border-black/30 bg-white'}`}>
              {checked && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
            </span>
            <span className="text-[#1a1420]">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function RatingInput({ field, value, onChange }) {
  const max = field.max || 5;
  const num = Number(value) || 0;
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const active = n <= num;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${
                active ? 'forged-gradient text-white border-transparent' : 'border-black/15 bg-white text-black/60 hover:border-black/30'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {field.scale_labels && (
        <div className="flex justify-between text-xs text-[#1a1420]/60 mt-2 px-1">
          <span>{field.scale_labels.low || 'Low'}</span>
          <span>{field.scale_labels.high || 'High'}</span>
        </div>
      )}
    </div>
  );
}

function DateInput({ field, value, onChange }) {
  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

const RENDERERS = {
  text_short: ShortTextInput,
  text_long: LongTextInput,
  currency: CurrencyInput,
  select: SelectInput,
  radio: RadioInput,
  checkbox: CheckboxInput,
  rating: RatingInput,
  date: DateInput,
};

const TEXT_TYPES = new Set(['text_short', 'text_long']);

/* ---------- main component ---------- */

export default function WorkbookField({ field, value, onChange }) {
  const Renderer = RENDERERS[field.type] || ShortTextInput;
  const showCounter = field.character_limit && TEXT_TYPES.has(field.type);
  const charCount = (value || '').length;

  return (
    <div>
      <label className="block text-sm mb-1 text-[#1a1420]">
        {field.label}
        {field.required && <span className="text-[#b3232c] ml-1">*</span>}
      </label>
      {field.helper_text && <p className="text-xs mb-2 opacity-70 text-[#2c2c33]">{field.helper_text}</p>}
      <Renderer field={field} value={value} onChange={onChange} />
      {showCounter && (
        <p className="text-xs mt-1 text-right opacity-50 text-[#2c2c33]">{charCount} / {field.character_limit}</p>
      )}
    </div>
  );
}