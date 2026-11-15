import React from 'react';
import { X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { GHOST, LABEL, UploadButton } from '@/components/admin/learn/fields';

/** Thumbnail: upload an image or paste a link. */
export function ImageField({ label = 'Thumbnail', value, onChange }) {
  return (
    <div>
      <span className={LABEL}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value && <Image src={value} alt="" className="h-16 w-24 border border-border" />}
        <input aria-label={`${label} link`} className="admin-input min-w-48 flex-1" placeholder="Paste an image link" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        <UploadButton label="Upload image" accept="image/*" isPublic onUploaded={(f) => onChange(f.file_url)} />
      </div>
    </div>
  );
}

/** Video or audio: link to it, or upload the file. */
export function MediaField({ label, accept, placeholder, value, onChange }) {
  const v = value || {};
  return (
    <div>
      <span className={LABEL}>{label}</span>
      {v.file_uri ? (
        <div className="flex items-center gap-3">
          <span className="admin-input flex-1 truncate">{v.file_name || 'Uploaded file'}</span>
          <button type="button" className={GHOST} onClick={() => onChange({ url: '', file_uri: '', file_name: '' })}><X className="h-3.5 w-3.5" /> Remove</button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <input aria-label={`${label} link`} className="admin-input min-w-48 flex-1" placeholder={placeholder} value={v.url || ''} onChange={(e) => onChange({ url: e.target.value, file_uri: '', file_name: '' })} />
          <UploadButton label="Upload file" accept={accept} onUploaded={(f) => onChange({ url: '', file_uri: f.file_uri, file_name: f.file_name })} />
        </div>
      )}
    </div>
  );
}

/** Reads and writes the three stored fields for one piece of media, e.g. video_url / video_file_uri / video_file_name. */
export const mediaValue = (record, key) => ({ url: record[`${key}_url`], file_uri: record[`${key}_file_uri`], file_name: record[`${key}_file_name`] });
export const mediaPatch = (key, v) => ({ [`${key}_url`]: v.url, [`${key}_file_uri`]: v.file_uri, [`${key}_file_name`]: v.file_name });