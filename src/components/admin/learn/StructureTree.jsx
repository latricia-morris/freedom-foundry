import React from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

const DOT = { published: 'bg-emerald-400', draft: 'bg-muted-foreground/50', archived: 'bg-destructive' };
const ADD = 'inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground';

function Row({ item, active, indent, onSelect, onMove, first, last }) {
  return (
    <div className={`group flex items-center gap-2 pr-1 ${active ? 'bg-accent' : 'hover:bg-accent/40'}`}>
      <button type="button" onClick={onSelect} className={`flex min-w-0 flex-1 items-center gap-2.5 py-2.5 text-left text-sm ${indent ? 'pl-7' : 'pl-3'} ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${DOT[item.status] || DOT.draft}`} title={item.status} />
        <span className="truncate">{item.title}</span>
      </button>
      <button type="button" aria-label="Move up" disabled={first} onClick={() => onMove(-1)} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button>
      <button type="button" aria-label="Move down" disabled={last} onClick={() => onMove(1)} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button>
    </div>
  );
}

/** The course → module → lesson outline (book → part → chapter). Select an item to edit it. */
export default function StructureTree({ kind, modules, lessons, selected, onSelect, onAddModule, onAddLesson, onMove }) {
  const unit = kind === 'book' ? ['part', 'chapter'] : ['module', 'lesson'];
  const is = (type, id) => selected.type === type && selected.id === id;
  const lessonRows = (moduleId, indent) => {
    const list = lessons.filter((l) => (l.module_id || '') === moduleId);
    return list.map((l, i) => (
      <Row key={l.id} item={l} indent={indent} active={is('lesson', l.id)} first={i === 0} last={i === list.length - 1}
        onSelect={() => onSelect({ type: 'lesson', id: l.id })} onMove={(dir) => onMove(list, i, dir, 'LearnLesson')} />
    ));
  };

  return (
    <nav aria-label="Structure" className="border border-border bg-card">
      <button type="button" onClick={() => onSelect({ type: 'offering' })} className={`block w-full px-3 py-3 text-left text-xs font-semibold uppercase tracking-widest ${selected.type === 'offering' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
        Details &amp; pricing
      </button>
      <div className="border-t border-border">
        {lessonRows('', false)}
        <button type="button" className={ADD} onClick={() => onAddLesson('')}><Plus className="h-3.5 w-3.5" /> Add {unit[1]}</button>
      </div>
      {modules.map((m, i) => (
        <div key={m.id} className="border-t border-border">
          <div className="font-medium">
            <Row item={m} active={is('module', m.id)} first={i === 0} last={i === modules.length - 1}
              onSelect={() => onSelect({ type: 'module', id: m.id })} onMove={(dir) => onMove(modules, i, dir, 'LearnModule')} />
          </div>
          {lessonRows(m.id, true)}
          <button type="button" className={`${ADD} pl-7`} onClick={() => onAddLesson(m.id)}><Plus className="h-3.5 w-3.5" /> Add {unit[1]}</button>
        </div>
      ))}
      <div className="border-t border-border">
        <button type="button" className={ADD} onClick={onAddModule}><Plus className="h-3.5 w-3.5" /> Add {unit[0]}</button>
      </div>
    </nav>
  );
}