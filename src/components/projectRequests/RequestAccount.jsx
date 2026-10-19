import React from 'react';

export default function RequestAccount({ data, brandId, onChange }) {
  const brand = data.brands.find((item) => item.id === brandId);
  return <div className="mb-6 rounded-[7px] border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
    <p>Submitting as <strong className="text-foreground">{data.account.name}</strong> · <span className="break-all">{data.account.email}</span></p>
    {data.brands.length > 1 ? <label className="mt-3 block text-sm">Brand for this request<select aria-label="Brand for this request" className="admin-input mt-2" value={brandId} onChange={(e) => onChange(e.target.value)}><option value="">Select a brand</option>{data.brands.map((item) => <option key={item.id} value={item.id}>{item.company_name}</option>)}</select></label> : <p className="mt-1">{brand?.company_name || data.account.company_name || 'Associated with your signed-in account'}</p>}
  </div>;
}