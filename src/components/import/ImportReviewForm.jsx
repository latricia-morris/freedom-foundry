import React from 'react';
import { FileDown, Plus, X } from 'lucide-react';
import { IMPORT_FILE_TYPES } from '@/lib/clientImport';

const ARRAY_DEFS = {
  social_links: { label: 'Social Links', cols: [{ k: 'platform', ph: 'Platform' }, { k: 'url', ph: 'URL' }], blank: { platform: '', url: '' } },
  feature_links: { label: 'Feature Links', cols: [{ k: 'label', ph: 'Label' }, { k: 'url', ph: 'URL' }], blank: { label: '', url: '' } },
  book_links: { label: 'Books', cols: [{ k: 'title', ph: 'Book title' }, { k: 'url', ph: 'Link' }], blank: { title: '', url: '' } },
  colors: { label: 'Brand Colors', cols: [{ k: 'name', ph: 'Color name' }, { k: 'hex', ph: 'Hex (e.g. #B3232C)' }], blank: { name: '', hex: '' } },
};

const SECTIONS = [
  {
    key: 'personal', label: 'Personal Brand Profile',
    fields: [
      { k: 'first_name', l: 'First Name' }, { k: 'last_name', l: 'Last Name' },
      { k: 'short_bio', l: 'Short Bio', long: true }, { k: 'long_bio', l: 'Long Bio', long: true },
      { k: 'brand_voice', l: 'Brand Voice', long: true }, { k: 'brand_tonality', l: 'Brand Tonality', long: true },
      { k: 'positioning', l: 'Positioning', long: true },
      { k: 'heading_font', l: 'Heading Font' }, { k: 'subheading_font', l: 'Subheading Font' },
      { k: 'body_font', l: 'Body Font' }, { k: 'accent_font', l: 'Accent Font' },
      { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }, { k: 'website', l: 'Website' },
      { k: 'location_city', l: 'City' }, { k: 'location_state', l: 'State' }, { k: 'location_country', l: 'Country' },
    ],
    arrays: ['social_links', 'book_links'],
  },
  {
    key: 'corporate', label: 'Corporate Brand Profile',
    fields: [
      { k: 'company_name', l: 'Company Name' }, { k: 'tagline', l: 'Tagline' },
      { k: 'mission_statement', l: 'Mission Statement', long: true },
      { k: 'brand_voice', l: 'Brand Voice', long: true }, { k: 'brand_tonality', l: 'Brand Tonality', long: true },
      { k: 'brand_personality', l: 'Brand Personality', long: true },
      { k: 'positioning', l: 'Positioning', long: true }, { k: 'target_audience', l: 'Target Audience', long: true },
      { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }, { k: 'website', l: 'Website' },
      { k: 'location_city', l: 'City' }, { k: 'location_state', l: 'State' }, { k: 'location_country', l: 'Country' },
    ],
    arrays: ['colors'],
  },
  {
    key: 'guidelines', label: 'Brand Guidelines',
    fields: [
      { k: 'heading_font', l: 'Heading Font' }, { k: 'subheading_font', l: 'Subheading Font' },
      { k: 'body_font', l: 'Body Font' }, { k: 'accent_font', l: 'Accent Font' },
      { k: 'logo_usage_notes', l: 'Logo Usage Notes', long: true },
      { k: 'color_usage_notes', l: 'Color Usage Notes', long: true },
      { k: 'typography_notes', l: 'Typography Notes', long: true },
      { k: 'photography_style', l: 'Photography Style', long: true },
      { k: 'tone_notes', l: 'Tone Notes', long: true },
      { k: 'brand_dont_list', l: 'Brand Don\u2019ts', long: true },
      { k: 'additional_standards', l: 'Additional Standards', long: true },
    ],
  },
  {
    key: 'media_kit', label: 'Media Kit',
    fields: [
      { k: 'short_bio', l: 'Short Bio', long: true }, { k: 'long_bio', l: 'Long Bio', long: true },
      { k: 'phone', l: 'Phone' }, { k: 'email', l: 'Email' }, { k: 'website', l: 'Website' },
      { k: 'location_city', l: 'City' }, { k: 'location_state', l: 'State' }, { k: 'location_country', l: 'Country' },
    ],
    arrays: ['social_links', 'feature_links', 'book_links'],
  },
];

function Field({ label, value, existing, long, onChange }) {
  const hint = existing && typeof existing === 'string' && existing.trim()
    ? existing.trim()
    : '';
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {long ? (
        <textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} className="admin-input resize-y" />
      ) : (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="admin-input" />
      )}
      {hint && value !== hint && (
        <span className="block text-[11px] text-[#8a482d] mt-1 truncate">
          Client's current value: {hint}
        </span>
      )}
    </label>
  );
}

function ArrayEditor({ label, rows, cols, def, onChange }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      <div className="space-y-2">
        {(rows || []).map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            {cols.map((col) => (
              <input
                key={col.k}
                value={row[col.k] || ''}
                placeholder={col.ph}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...row, [col.k]: e.target.value };
                  onChange(next);
                }}
                className="admin-input flex-1"
              />
            ))}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...(rows || []), { ...def.blank }])}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8a482d]"
        >
          <Plus className="w-3.5 h-3.5" /> Add {label.replace(/s$/, '')}
        </button>
      </div>
    </div>
  );
}

export default function ImportReviewForm({ draft, existing, onChange, onArrayChange, onAssets }) {
  const assets = draft.assets || [];

  return (
    <div className="space-y-6">
      <div className="dashboard-card border border-[#b3232c]/30 bg-[#b3232c]/10 p-5">
        <p className="text-sm text-foreground/90">
          Review the parsed content below, edit anything that looks off, then save it into the client's portal.
          Fields showing <span className="text-[#8a482d]">"Client's current value"</span> will overwrite that existing content when you save.
        </p>
      </div>

      {SECTIONS.map((section) => {
        const sectionDraft = draft[section.key] || {};
        const sectionExisting = existing?.[section.key] || {};
        return (
          <div key={section.key} className="dashboard-card border border-border p-6">
            <h3 className="font-heading text-xl text-foreground mb-5">
              {section.label}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.k} className={field.long ? 'md:col-span-2' : ''}>
                  <Field
                    label={field.l}
                    value={sectionDraft[field.k]}
                    existing={sectionExisting[field.k]}
                    long={field.long}
                    onChange={(value) => onChange(section.key, field.k, value)}
                  />
                </div>
              ))}
            </div>
            {(section.arrays || []).map((arrayKey) => {
              const def = ARRAY_DEFS[arrayKey];
              return (
                <div key={arrayKey} className="mt-5">
                  <ArrayEditor
                    label={def.label}
                    rows={sectionDraft[arrayKey]}
                    cols={def.cols}
                    def={def}
                    onChange={(rows) => onArrayChange(section.key, arrayKey, rows)}
                  />
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="dashboard-card border border-border p-6">
        <h3 className="font-heading text-xl text-foreground mb-2">Brand Assets</h3>
        <p className="text-xs text-muted-foreground mb-5">
          These uploaded files will be added to the client's Brand Assets library with the titles and types below.
        </p>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files staged for the asset library.</p>
        ) : (
          <div className="space-y-2">
            {assets.map((asset, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileDown className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                  <input
                    value={asset.title || ''}
                    onChange={(e) => {
                      const next = [...assets];
                      next[index] = { ...asset, title: e.target.value };
                      onAssets(next);
                    }}
                    className="admin-input"
                  />
                </div>
                <select
                  value={asset.file_type || 'other'}
                  onChange={(e) => {
                    const next = [...assets];
                    next[index] = { ...asset, file_type: e.target.value };
                    onAssets(next);
                  }}
                  className="admin-input sm:w-48"
                >
                  {IMPORT_FILE_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => onAssets(assets.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-foreground shrink-0 self-start sm:self-auto p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}