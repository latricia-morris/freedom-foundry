import React from 'react';

// Minimal, dependency-free markdown for agent replies: headings, bullets, bold.
const BOLD = /\*\*(.+?)\*\*/g;

function inline(text) {
  return String(text)
    .split(BOLD)
    .map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part));
}

export default function MarkdownText({ content }) {
  const blocks = [];
  let list = [];

  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-4 list-disc space-y-1">
        {list}
      </ul>,
    );
    list = [];
  };

  String(content || '')
    .split('\n')
    .forEach((raw, i) => {
      const line = raw.trim();
      if (!line) {
        flush();
        return;
      }
      if (/^#{1,6}\s/.test(line)) {
        flush();
        blocks.push(
          <p key={i} className="pt-1 font-heading text-base font-medium text-foreground">
            {inline(line.replace(/^#{1,6}\s/, ''))}
          </p>,
        );
        return;
      }
      if (/^[-*]\s/.test(line)) {
        list.push(<li key={i}>{inline(line.replace(/^[-*]\s/, ''))}</li>);
        return;
      }
      flush();
      blocks.push(<p key={i} className="leading-relaxed">{inline(line)}</p>);
    });
  flush();

  return <div className="space-y-2 text-sm text-foreground">{blocks}</div>;
}