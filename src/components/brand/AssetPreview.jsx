import React from 'react';
import { X, FileImage, Download } from 'lucide-react';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];

export function getExtension(url) {
  if (!url) return '';
  const cleanUrl = url.split('?')[0].split('#')[0];
  const parts = cleanUrl.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
}

export function isPreviewableImage(url) {
  return IMAGE_EXTENSIONS.includes(getExtension(url));
}

export default function AssetPreview({ url, alt = '', size = 'md', contain = false, onRemove }) {
  const ext = getExtension(url);
  const isImage = isPreviewableImage(url);

  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  }[size] || 'w-20 h-20';

  if (isImage) {
    return (
      <div className={`relative ${sizeClass} rounded-xl overflow-hidden border border-black/10 group ${contain ? 'bg-white' : ''}`}>
        <img src={url} alt={alt} className={`w-full h-full ${contain ? 'object-contain p-1' : 'object-cover'}`} />
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // Non-previewable file: show icon with file type and download link
  return (
    <div className={`relative ${sizeClass} rounded-xl overflow-hidden border border-black/10 group bg-[#f7f2ea]`}>
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-[#f0eadc] transition-colors"
      >
        <FileImage className="w-5 h-5 text-[#b3232c]" />
        <span className="text-[10px] uppercase tracking-wider text-[#1a1420]/60 font-semibold">{ext}</span>
        <Download className="w-3 h-3 text-[#1a1420]/40" />
      </a>
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}