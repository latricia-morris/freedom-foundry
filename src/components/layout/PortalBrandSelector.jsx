import React from 'react';

const ROLE_LABELS = { owner: 'Owner', brand_admin: 'Brand Admin', team_member: 'Team Member' };

export default function PortalBrandSelector({ brands, brand, onSelect, id = 'portal-brand' }) {
  if (!brand || brands.length < 2) return null;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block px-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        Brand
      </label>
      <select id={id} className="admin-input" value={brand.id} onChange={(e) => onSelect(e.target.value)}>
        {brands.map((b) => <option key={b.id} value={b.id}>{b.company_name}</option>)}
      </select>
      <p className="mt-1.5 px-1 text-xs text-muted-foreground">Your access: {ROLE_LABELS[brand.role] || 'Member'}</p>
    </div>
  );
}