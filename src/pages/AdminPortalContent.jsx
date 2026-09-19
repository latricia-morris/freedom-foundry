import React, { useEffect, useState } from 'react';
import {
  Eye, EyeOff, FileDown, FolderOpen, Layers, Loader2,
  Pencil, Plus, StickyNote, Trash2, X,
} from 'lucide-react';
import apiClient from '@/api/client';
import ClientPicker from '@/components/admin/ClientPicker';
import PortalContentForm from '@/components/admin/PortalContentForm';
import { PORTAL_PAGES } from '@/lib/portalPages';

const TYPE_META = {
  note: { label: 'Note', icon: StickyNote },
  file: { label: 'File', icon: FileDown },
  drive_link: { label: 'Drive Folder', icon: FolderOpen },
  custom_section: { label: 'Custom Section', icon: Layers },
};

export default function AdminPortalContent() {
  const [client, setClient] = useState(null);
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const reload = async (userId) => {
    setItems(null);
    try {
      const rows = await apiClient.entities.PortalContent.filter({ user_id: userId }, 'order', 200);
      setItems(rows || []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    if (client) {
      reload(client.id);
      setEditing(null);
    } else {
      setItems(null);
    }
  }, [client?.id]);

  const clientLabel = client
    ? `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.email || 'client'
    : '';

  const toggleVisible = async (item) => {
    setBusy(true);
    try {
      await apiClient.entities.PortalContent.update(item.id, { visible: !item.visible });
      await reload(client.id);
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Remove "${item.title}" from ${clientLabel}'s portal?`)) return;
    setBusy(true);
    try {
      await apiClient.entities.PortalContent.delete(item.id);
      await reload(client.id);
    } finally {
      setBusy(false);
    }
  };

  const groups = (items || []).reduce((acc, item) => {
    const key = PORTAL_PAGES.find((page) => page.key === item.target_page)?.key || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const groupOrder = [
    ...PORTAL_PAGES.filter((page) => groups[page.key]?.length).map((page) => ({ key: page.key, label: page.label })),
    ...(groups.other ? [{ key: 'other', label: 'Other' }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 ember-glow-bg z-[-1]" />
        <h1 className="font-heading text-4xl font-light text-foreground mb-3 tracking-wide">
          Portal <span className="molten-text italic font-medium">Content</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Drop files, notes, Drive folders, and custom sections onto any page of a client's Brand Portal. Pages with nothing added stay exactly as they are — no empty pockets.
        </p>
      </div>

      {!client ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Choose the client whose portal you are adding to.</p>
          <ClientPicker selected={client} onSelect={setClient} />
        </div>
      ) : (
        <div>
          <div className="dashboard-card border border-border p-4 mb-5 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-foreground">
              Managing <strong className="font-medium">{clientLabel}</strong>'s portal
            </span>
            <button type="button" onClick={() => setClient(null)} className="text-xs uppercase tracking-wider text-[#8a482d]">
              Change client
            </button>
          </div>

          <div className="mb-5">
            <button
              type="button"
              onClick={() => setEditing(editing === 'new' ? null : 'new')}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs uppercase tracking-widest"
            >
              {editing === 'new' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editing === 'new' ? 'Cancel New Item' : 'Add Portal Content'}
            </button>
          </div>

          {editing === 'new' && (
            <div className="mb-6">
              <PortalContentForm
                client={client}
                item={null}
                onSaved={() => { setEditing(null); reload(client.id); }}
                onCancel={() => setEditing(null)}
              />
            </div>
          )}

          {!items ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="dashboard-card border border-border p-10 text-center">
              <Layers className="w-9 h-9 text-muted-foreground mx-auto mb-4" strokeWidth={1.2} />
              <h2 className="font-heading text-2xl text-foreground mb-2">Nothing added yet</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Add a note on their Corporate Brand page, stage logo files on Brand Assets, link a Drive folder to the Portal Overview — whatever this engagement calls for.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupOrder.map((group) => (
                <div key={group.key} className="dashboard-card border border-border overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border bg-muted/40">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{group.label}</h2>
                  </div>
                  <div className="divide-y divide-border/40">
                    {groups[group.key].map((item) => {
                      const meta = TYPE_META[item.type] || TYPE_META.note;
                      const Icon = meta.icon;
                      const isEditing = editing?.id === item.id;
                      return (
                        <div key={item.id}>
                          <div className="flex items-center gap-3 px-5 py-3.5">
                            <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-foreground truncate">{item.title}</span>
                              <span className="block text-[11px] text-muted-foreground mt-0.5">
                                {meta.label}
                                {item.order ? ` · order ${item.order}` : ''}
                                {!item.visible && ' · hidden'}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleVisible(item)}
                                disabled={busy}
                                title={item.visible ? 'Hide from client' : 'Show to client'}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                              >
                                {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditing(isEditing ? null : item)}
                                title="Edit"
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item)}
                                disabled={busy}
                                title="Delete"
                                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </span>
                          </div>
                          {isEditing && (
                            <div className="px-5 pb-5">
                              <PortalContentForm
                                client={client}
                                item={item}
                                onSaved={() => { setEditing(null); reload(client.id); }}
                                onCancel={() => setEditing(null)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}