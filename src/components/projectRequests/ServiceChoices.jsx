import React from 'react';
import { Check } from 'lucide-react';

export default function ServiceChoices({ options, selected, onChange, label = 'What would you like help with?', helper = 'Select all that apply.' }) {
  return <fieldset className="space-y-3">
    <legend className="font-medium text-foreground">{label}</legend>
    <p className="text-sm text-muted-foreground">{helper}</p>
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((service) => {
        const checked = selected.includes(service);
        return <button key={service} type="button" role="checkbox" aria-checked={checked}
          className="request-choice flex min-h-12 items-center gap-3 px-3 py-3 text-left text-sm font-medium"
          onClick={() => onChange(checked ? selected.filter((item) => item !== service) : [...selected, service])}>
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border border-current" aria-hidden="true">{checked && <Check className="h-3.5 w-3.5" />}</span>
          <span className="min-w-0">{service}</span>
        </button>;
      })}
    </div>
  </fieldset>;
}