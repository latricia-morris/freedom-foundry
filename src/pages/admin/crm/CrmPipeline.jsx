import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { STAGES, shortDate } from '@/lib/crm';
import { E, useRecords, useRefresh } from '@/components/crm/useCrm';
import { PageHeader, PrimaryButton, Spinner, money } from '@/components/crm/CrmUi';
import { CrmDialog } from '@/components/crm/CrmForm';
import OpportunityForm from '@/components/crm/pipeline/OpportunityForm';

export default function CrmPipeline() {
  const qc = useQueryClient();
  const refresh = useRefresh();
  const { data: opps = [], isLoading } = useRecords('opps', 'CrmOpportunity', {}, '-updated_date', 300);
  const [editing, setEditing] = useState(null);
  const openValue = opps.filter((o) => !['won', 'lost'].includes(o.stage)).reduce((s, o) => s + (o.value || 0) * (o.probability || 0) / 100, 0);

  const onDragEnd = async ({ draggableId, destination }) => {
    if (!destination) return;
    const stage = destination.droppableId;
    const probability = STAGES.find((s) => s.key === stage).probability;
    qc.setQueryData(['crm', 'opps', {}], (list) => list.map((o) => (o.id === draggableId ? { ...o, stage, probability } : o)));
    await E.CrmOpportunity.update(draggableId, { stage, probability });
    refresh('opps');
  };

  if (isLoading) return <Spinner />;
  return (
    <div className="animate-fade-in pb-12">
      <PageHeader title="Deal" accent="Pipeline" subtitle={`Drag deals between stages. Weighted open pipeline: ${money(openValue)}.`}>
        <PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New deal</PrimaryButton>
      </PageHeader>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => {
            const list = opps.filter((o) => o.stage === s.key);
            return (
              <Droppable key={s.key} droppableId={s.key}>
                {(drop, snap) => (
                  <div ref={drop.innerRef} {...drop.droppableProps} className={`dashboard-card flex w-64 shrink-0 flex-col p-3 transition-colors ${snap.isDraggingOver ? 'border-primary/50' : ''}`}>
                    <div className="mb-3 flex items-baseline justify-between px-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label} · {list.length}</p>
                      <p className="text-xs text-foreground">{money(list.reduce((t, o) => t + (o.value || 0), 0))}</p>
                    </div>
                    <div className="min-h-24 space-y-2">
                      {list.map((o, i) => (
                        <Draggable key={o.id} draggableId={o.id} index={i}>
                          {(drag) => (
                            <button ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} onClick={() => setEditing(o)} className="forged-well block w-full p-3 text-left hover:border-primary/40">
                              <p className="text-sm text-foreground">{o.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{o.client_name || 'No client'}</p>
                              <div className="mt-2 flex justify-between text-xs"><span className="text-primary">{money(o.value)}</span><span className="text-muted-foreground">{o.probability}% · {shortDate(o.expected_close_date)}</span></div>
                            </button>
                          )}
                        </Draggable>
                      ))}
                      {drop.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
      <CrmDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={editing?.id ? 'Edit deal' : 'New deal'}>
        {editing && <OpportunityForm opportunity={editing} onDone={() => { setEditing(null); refresh('opps'); }} />}
      </CrmDialog>
    </div>
  );
}