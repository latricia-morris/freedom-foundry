import React from 'react';
import EditableText from '@/components/proposal/studio/EditableText';
export default function PassageTable({ block, editing, onChange }) {
  const lines = block.text.trim().split('\n'), rows = lines.map(l => l.replace(/^\s*\||\|\s*$/g,'').split('|').map(s => s.trim()));
  const update = (r,c,value) => { const next = rows.map(row => [...row]); next[r][c] = value.replaceAll('|','/').replaceAll('\n',' '); onChange(next.map(row => `| ${row.join(' | ')} |`).join('\n')); };
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{rows[0]?.map((cell,c) => <th key={c} className="border-b border-border p-3"><EditableText small label={`${block.id} heading ${c+1}`} value={cell} editing={editing} onChange={v => update(0,c,v)} /></th>)}</tr></thead><tbody>{rows.slice(1).map((row,i) => row.every(c => /^:?-+:?$/.test(c)) ? null : <tr key={i}>{row.map((cell,c) => <td key={c} className="border-b border-border p-3 align-top"><EditableText small label={`${block.id} row ${i+1} column ${c+1}`} value={cell} editing={editing} onChange={v => update(i+1,c,v)} /></td>)}</tr>)}</tbody></table></div>;
}