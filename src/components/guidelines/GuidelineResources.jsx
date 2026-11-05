import React from 'react';
import { BookOpen, FileText } from 'lucide-react';

// Renders only the formats that have actually been added — nothing at all when neither exists.
export default function GuidelineResources({ published_url, pdf_url }) {
  if (!published_url && !pdf_url) return null;
  return (
    <div className="gl-res">
      {published_url && (
        <a className="gl-btn primary" href={published_url} target="_blank" rel="noopener noreferrer"><BookOpen size={15} />Published guidelines</a>
      )}
      {pdf_url && (
        <a className="gl-btn" href={pdf_url} target="_blank" rel="noopener noreferrer"><FileText size={15} />Guidelines PDF</a>
      )}
    </div>
  );
}