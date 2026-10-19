import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import MatrixView from '@/components/brandHealth/MatrixView';
import { shapeClientChannel } from '@/lib/matrix';

/**
 * Admin preview of the client-facing Marketing Matrix report, rendered from
 * the raw channel records using the same shaping the client function applies.
 * Draft-only warnings stay here; they never appear in a published report.
 */
export default function MatrixPreview({ audit, clientName, onClose }) {
  const [channels, setChannels] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.entities.MatrixChannel.filter({ audit_id: audit.id }, 'sort_order', 300).then((rows) => {
      if (alive) setChannels((rows || []).filter((c) => c.client_visible).map(shapeClientChannel));
    }).catch(() => {
      if (alive) setChannels([]);
    });
    return () => {
      alive = false;
    };
  }, [audit?.id]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Client report preview {channels === null ? '· loading' : '· draft'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="btn-forge rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest"
        >
          Close preview
        </button>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {channels === null ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : (
          <MatrixView audit={audit} matrixChannels={channels} clientName={clientName} />
        )}
      </div>
    </div>
  );
}