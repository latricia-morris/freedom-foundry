import React from 'react';

/**
 * Emphasis and inline code carried over from the source document, rendered as
 * emphasis rather than as literal asterisks.
 */
export default function ReportInline({ text }) {
  return (
    <>
      {String(text ?? '')
        .split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g)
        .filter(Boolean)
        .map((part, i) => {
          if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={i} className="rounded-sm bg-background/70 px-1 py-0.5 font-mono text-[0.9em] text-foreground/90">
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={i} className="italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
    </>
  );
}