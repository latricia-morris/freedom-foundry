import React, { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import MatrixMapChart from '@/components/matrix/MatrixMapChart';
import ChannelEditPanel from './ChannelEditPanel';
import { channelPos, opportunityScore } from '@/lib/matrix';

/**
 * The consultant-only channel matrix workspace: the interactive quadrant map
 * with draggable dots, channel records loaded from the MatrixChannel entity,
 * and prefill from the internal Channel Profile Library. Nothing here reaches
 * a client until a channel is explicitly marked client-facing and the audit
 * is published.
 */
export default function ChannelMatrixEditor({ audit, busy }) {
  const [channels, setChannels] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const writesRef = useRef(Promise.resolve());
  const { toast } = useToast();

  const load = () => {
    base44.entities.MatrixChannel.filter({ audit_id: audit.id }, 'sort_order', 300)
      .then((rows) => setChannels(rows || []))
      .catch(() => setChannels([]));
  };
  useEffect(load, [audit.id]);

  useEffect(() => {
    base44.entities.ChannelProfile.filter({}, 'name', 300)
      .then((rows) => setProfiles(rows || []))
      .catch(() => setProfiles([]));
  }, []);

  // Writes serialize through a promise chain so rapid successive edits can
  // never race each other on the same record.
  const updateChannel = (id, patch) => {
    setChannels((prev) => (prev || []).map((c) => (c.id === id ? { ...c, ...patch } : c)));
    writesRef.current = writesRef.current.then(async () => {
      try {
        await base44.entities.MatrixChannel.update(id, patch);
      } catch (err) {
        toast({ title: 'Could not save channel', description: err.message, variant: 'destructive' });
        load();
      }
    });
  };

  const addChannel = async (prefill = {}) => {
    try {
      const created = await base44.entities.MatrixChannel.create({
        audit_id: audit.id,
        agency_client_id: audit.agency_client_id,
        channel_name: prefill.channel_name || 'New channel',
        category: prefill.category || null,
        description: prefill.description || null,
        maturity: 0,
        strategic_fit: 3,
        buyer_impact: 3,
        time_to_impact: 3,
        investment_required: 3,
        execution_confidence: 3,
        measurement_readiness: 2,
        consultant_priority: 'build',
        metrics: {},
        sort_order: channels ? channels.length : 0,
      });
      setChannels((prev) => [...(prev || []), created]);
      setSelectedId(created.id);
    } catch (err) {
      toast({ title: 'Could not add channel', description: err.message, variant: 'destructive' });
    }
  };

  const deleteChannel = async (id) => {
    try {
      await base44.entities.MatrixChannel.delete(id);
      setSelectedId(null);
      load();
    } catch (err) {
      toast({ title: 'Could not delete channel', description: err.message, variant: 'destructive' });
    }
  };

  const onDragEnd = (id, x, y) => {
    const ch = (channels || []).find((c) => c.id === id);
    if (!ch) return;
    const round1 = (v) => Math.round(v * 10) / 10;
    const clamp5 = (v) => Math.max(1, Math.min(5, round1(v)));
    const maturity = Math.max(0, Math.min(5, round1(x * 5)));
    const fit = Number(ch.strategic_fit);
    const impact = Number(ch.buyer_impact);
    const curAvg = (fit + impact) / 2;
    const delta = y * 5 - curAvg;
    updateChannel(id, {
      maturity,
      strategic_fit: clamp5(fit + delta),
      buyer_impact: clamp5(impact + delta),
    });
  };

  const dots = (channels || []).map((c) => {
    const pos = channelPos(c);
    return {
      id: c.id,
      label: c.channel_name,
      x: pos.x,
      y: pos.y,
      opportunity: opportunityScore(c, audit),
      priority: c.consultant_priority,
    };
  });
  const selected = (channels || []).find((c) => c.id === selectedId) || null;

  if (!channels) {
    return <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => addChannel()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add channel
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Add from profile library
          <select
            className="admin-input max-w-56"
            value=""
            onChange={(e) => {
              const p = profiles.find((x) => x.id === e.target.value);
              if (p) addChannel({ channel_name: p.name, description: p.description, category: null });
            }}
          >
            <option value="">— choose a profile —</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <span className="text-xs text-muted-foreground/70">
          Drag a dot to set execution strength and strategic fit · click to edit
        </span>
      </div>

      <MatrixMapChart
        dots={dots}
        editable
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDragEnd={onDragEnd}
      />

      {selected && (
        <ChannelEditPanel channel={selected} audit={audit} onChange={updateChannel} onDelete={deleteChannel} busy={busy} />
      )}
    </div>
  );
}