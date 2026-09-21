import React, { useRef, useState } from 'react';
import { PRIORITY_COLORS, dotSizePx } from '@/lib/matrix';

const QUADRANT_CORNER = {
  'top-left': 'top-2 left-3',
  'top-right': 'top-2 right-3',
  'bottom-left': 'bottom-8 left-3',
  'bottom-right': 'bottom-8 right-3',
};

/**
 * The Marketing Matrix visual: X = Current Execution Strength,
 * Y = Buyer Impact / Strategic Fit, four quadrants, one dot per channel.
 * Dot size carries the internal Channel Opportunity Score; dot color carries
 * the consultant priority. Shared by the consultant editor (editable) and the
 * published client view (read-only).
 */
export default function MatrixMapChart({ dots, editable, selectedId, onSelect, onDragEnd }) {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [dragPos, setDragPos] = useState(null);

  const posOf = (d) => (dragPos && dragPos.id === d.id ? dragPos : { x: d.x, y: d.y });

  const startDrag = (e, d) => {
    if (!editable) {
      onSelect && d.id && onSelect(d.id);
      return;
    }
    dragRef.current = { id: d.id, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
    setDragPos({ id: d.id, x: d.x, y: d.y });
  };

  const onMove = (e) => {
    if (!dragRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
    dragRef.current.moved = true;
    setDragPos((p) => (p ? { ...p, x, y } : p));
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    const info = dragRef.current;
    const pos = dragPos && dragPos.id === info.id ? dragPos : null;
    dragRef.current = null;
    setDragPos(null);
    if (!info.moved || !pos) {
      onSelect && onSelect(info.id);
      return;
    }
    onDragEnd && onDragEnd(info.id, pos.x, pos.y);
  };

  return (
    <div>
      <div ref={mapRef} className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border bg-input/40">
        {/* quadrant grid */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-border" />
        {[
          { label: 'Priority Build', pos: 'top-left' },
          { label: 'Scale With Intention', pos: 'top-right' },
          { label: 'Monitor', pos: 'bottom-left' },
          { label: 'Reassess', pos: 'bottom-right' },
        ].map((q) => (
          <span key={q.pos} className={`absolute text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 ${QUADRANT_CORNER[q.pos]}`}>
            {q.label}
          </span>
        ))}

        {/* axis labels */}
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Current Execution Strength →
        </span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 sm:left-0">
          Buyer Impact / Strategic Fit →
        </span>

        {dots.map((d) => {
          const pos = posOf(d);
          const size = dotSizePx(d.opportunity);
          const color = PRIORITY_COLORS[d.priority] || PRIORITY_COLORS.not_applicable;
          return (
            <div
              key={d.id}
              role="button"
              tabIndex={0}
              aria-label={`${d.label} position`}
              title={d.label}
              onPointerDown={(e) => startDrag(e, d)}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onKeyDown={(e) => { if (editable && e.key === 'Enter' && onSelect) onSelect(d.id); }}
              className={`absolute flex items-center justify-center rounded-full border border-background/60 shadow-md transition-shadow ${
                editable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              } ${selectedId === d.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              style={{
                left: `${pos.x * 100}%`,
                top: `${(1 - pos.y) * 100}%`,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
                backgroundColor: color,
                touchAction: 'none',
              }}
            />
          );
        })}

        {!dots.length && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground/70">
            {editable ? 'Add channels to place them on the matrix.' : 'Your consultant will publish the channel map here.'}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(PRIORITY_COLORS)
          .filter(([key]) => key !== 'not_applicable')
          .map(([key, color]) => (
            <span key={key} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full border border-background/60" style={{ backgroundColor: color }} />
              {key.replace('_', ' ')}
            </span>
          ))}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Dot size = opportunity</span>
      </div>
    </div>
  );
}