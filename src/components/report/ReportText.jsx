import React from 'react';
import { parseReportBlocks } from '@/lib/reportText';
import ReportTable from './ReportTable';
import ReportInline from './ReportInline';

const MAJOR_HEADING = {
  1: 'font-heading text-2xl font-light leading-snug text-foreground',
  2: 'font-heading text-xl font-light leading-snug text-foreground',
};

/**
 * Report body from an imported audit: headings, paragraphs, lists, quotes, and
 * tables laid out as a document rather than raw extracted text.
 */
export default function ReportText({ text, className = '' }) {
  const blocks = parseReportBlocks(text);
  if (!blocks.length) return null;

  return (
    <div className={`min-w-0 space-y-3 ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          const major = MAJOR_HEADING[block.level];
          return (
            <p
              key={i}
              className={
                major
                  ? `${major} ${i === 0 ? '' : 'pt-2'}`
                  : 'pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70'
              }
            >
              <ReportInline text={block.text} />
            </p>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={i} className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
              <ReportInline text={block.text} />
            </p>
          );
        }
        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag
              key={i}
              className={`space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary/70 ${
                block.ordered ? 'list-decimal' : 'list-disc'
              }`}
            >
              {block.items.map((item, j) => (
                <li key={j} className="break-words pl-0.5">
                  <ReportInline text={item} />
                </li>
              ))}
            </ListTag>
          );
        }
        if (block.type === 'table') {
          return <ReportTable key={i} header={block.header} rows={block.rows} />;
        }
        if (block.type === 'quote') {
          return (
            <div key={i} className="border-l-2 border-primary/50 bg-background/40 py-2 pl-3 pr-2">
              <p className="break-words text-sm leading-relaxed text-foreground/85">
                <ReportInline text={block.text} />
              </p>
            </div>
          );
        }
        return <div key={i} className="h-px w-full bg-border/50" />;
      })}
    </div>
  );
}