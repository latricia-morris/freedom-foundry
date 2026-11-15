import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const LearnSpinner = () => (
  <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
);

/** Shown when a course, book or lesson does not exist or is not available to this member. */
export function LearnMissing({ message = 'This is not available.', notFound = true }) {
  useEffect(() => {
    if (!notFound) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);
  return (
    <div className="py-24 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Link to="/learn" className="link-warm mt-4 inline-block">Back to the Academy</Link>
    </div>
  );
}