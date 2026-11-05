import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CrmDialog({ open, onOpenChange, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-border bg-card">
        <DialogHeader><DialogTitle className="font-heading text-2xl font-light">{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Select({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select className={`admin-input capitalize ${className}`} value={value || ''} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        return <option key={v} value={v}>{typeof o === 'string' ? o.replace(/_/g, ' ') : o.label}</option>;
      })}
    </select>
  );
}

export function FormActions({ onDelete, saving, label = 'Save' }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onDelete ? <button type="button" onClick={onDelete} className="text-xs uppercase tracking-widest text-destructive hover:opacity-80">Delete</button> : <span />}
      <button type="submit" disabled={saving} className="btn-forge rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}