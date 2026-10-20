import React from 'react';
const inline = value => String(value || '').split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).map((s, i) => {
  const link = s.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
  return link ? <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-primary underline">{link[1]}</a> : s.startsWith('**') ? <strong key={i}>{s.slice(2,-2)}</strong> : s;
});
export default function ProposalText({ text }) {
  return <div className="space-y-2 break-words text-sm leading-7 text-foreground">{String(text || '').split('\n').filter(Boolean).map((line, i) => {
    if (/^#{1,6}\s/.test(line)) return <h3 key={i} className="font-heading text-2xl leading-snug">{inline(line.replace(/^#{1,6}\s/,''))}</h3>;
    if (/^[-*]\s/.test(line)) return <div key={i} className="flex gap-2"><span aria-hidden="true">•</span><p>{inline(line.replace(/^[-*]\s/,''))}</p></div>;
    return <p key={i} className="whitespace-pre-wrap">{inline(line)}</p>;
  })}</div>;
}