import React from 'react';
import { Link } from 'react-router-dom';

export const ACKNOWLEDGMENT = 'I understand that this request is subject to review and does not start a project. If accepted, the scope, payment terms, and schedule will be confirmed in a proposal. Work begins only after the signed proposal and required initial payment have been received.';

export default function RequestAcknowledgment({ checked, onChange, submitting, uploading }) {
  return <div className="space-y-4">
    <Link to="/terms" target="_blank" rel="noopener noreferrer" className="link-warm inline-block">Terms &amp; Conditions</Link>
    <label className="request-check-row">
      <input id="request-acknowledgment" type="checkbox" required checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm leading-relaxed">{ACKNOWLEDGMENT}</span>
    </label>
    <p className="text-sm text-muted-foreground">Please allow 3–5 business days for a response. Submission does not guarantee acceptance.</p>
    <button type="submit" className="request-primary w-full px-5 py-3.5 text-sm font-semibold" disabled={submitting || uploading}>
      {submitting ? 'Sending…' : 'Send project request'}
    </button>
  </div>;
}