import React from 'react';
import { cn } from '@/lib/utils';

/** Brand Health dashboard widget card: rounded, layered, breathable surface. */
export default function DashCard({ id, className, children }) {
  return (
    <section id={id} className={cn('bh-card scroll-mt-32 p-6 sm:p-8 lg:scroll-mt-44 lg:p-10', className)}>
      {children}
    </section>
  );
}