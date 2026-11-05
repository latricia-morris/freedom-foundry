import React from 'react';

export default function BrandPicker({ brands, value, onChange }) {
  if (brands.length < 2) return null;
  return (
    <select className="admin-input w-auto" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Brand">
      {brands.map((b) => <option key={b.id} value={b.id}>{b.company_name}</option>)}
    </select>
  );
}