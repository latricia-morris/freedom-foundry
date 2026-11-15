import React from 'react';

const inline = (text) =>
  String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold">{part}</strong> : part));

/** Long-form lesson and chapter text: paragraphs, # headings, > quotes, - lists and **bold**. */
export default function ReadingText({ content }) {
  const blocks = [];
  let list = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={`l${blocks.length}`} className="ml-6 list-disc space-y-2">{list}</ul>);
    list = [];
  };
  String(content || '').split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return flush();
    if (/^[-*]\s/.test(line)) return list.push(<li key={i}>{inline(line.slice(2))}</li>);
    flush();
    if (/^#{1,6}\s/.test(line)) {
      return blocks.push(<h2 key={i} className="pt-6 font-heading text-3xl font-medium text-foreground">{inline(line.replace(/^#{1,6}\s/, ''))}</h2>);
    }
    if (line.startsWith('>')) {
      return blocks.push(<blockquote key={i} className="border-l-2 border-primary pl-5 italic text-foreground">{inline(line.replace(/^>\s?/, ''))}</blockquote>);
    }
    return blocks.push(<p key={i}>{inline(line)}</p>);
  });
  flush();
  return <div className="space-y-6 font-heading text-[1.4rem] leading-[1.7] text-foreground/90">{blocks}</div>;
}