import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BrandUpAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('prompt');
  const [bulkText, setBulkText] = useState('');
  const [bulkType, setBulkType] = useState('prompt');
  const [adding, setAdding] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') { setDenied(true); setLoading(false); return; }
      loadItems();
    }).catch(() => { setDenied(true); setLoading(false); });
  }, []);

  const loadItems = async () => {
    try {
      const all = await base44.entities.BrandUpPrompt.filter({}, 'order', 200);
      setItems(all || []);
    } catch (_) {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    setAdding(true);
    try {
      await base44.entities.BrandUpPrompt.create({
        prompt_text: newText.trim(),
        type: newType,
        is_active: true,
      });
      setNewText('');
      loadItems();
    } catch (_) {}
    setAdding(false);
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return;
    setBulkAdding(true);
    setBulkResult(null);
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l);
    let success = 0, fail = 0;
    try {
      const created = await base44.entities.BrandUpPrompt.bulkCreate(
        lines.map(text => ({ prompt_text: text, type: bulkType, is_active: true }))
      );
      success = Array.isArray(created) ? created.length : 1;
    } catch (_) {
      fail = lines.length;
    }
    setBulkResult({ success, fail, total: lines.length });
    setBulkText('');
    loadItems();
    setBulkAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.BrandUpPrompt.delete(id);
      setItems(items.filter(i => i.id !== id));
    } catch (_) {}
  };

  const toggleActive = async (item) => {
    try {
      await base44.entities.BrandUpPrompt.update(item.id, { is_active: !item.is_active });
      loadItems();
    } catch (_) {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (denied) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="font-heading text-xl text-foreground mb-1">Admin Access Required</h1>
        <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Brand Up <span className="molten-text italic">Admin</span></h1>
        <p className="text-sm text-muted-foreground">Manage prompts and notes. Notes appear as messages without response fields.</p>
      </div>

      {/* Add single */}
      <div className="mb-6 p-5 rounded-xl border border-border bg-card">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Add Single Item</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setNewType('prompt')}
            className={`px-4 py-2 rounded-lg text-xs border transition-all ${newType === 'prompt' ? 'border-primary text-white' : 'border-border text-muted-foreground'}`}
            style={newType === 'prompt' ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
          >
            Prompt
          </button>
          <button
            onClick={() => setNewType('note')}
            className={`px-4 py-2 rounded-lg text-xs border transition-all ${newType === 'note' ? 'border-primary text-white' : 'border-border text-muted-foreground'}`}
            style={newType === 'note' ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
          >
            Note
          </button>
        </div>
        <textarea
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder={newType === 'prompt' ? 'Enter prompt text...' : 'Enter note or word of encouragement...'}
          rows={3}
          className="w-full rounded-lg px-4 py-3 text-sm bg-background border border-border outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-y mb-3"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-30"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Bulk import */}
      <div className="mb-6 p-5 rounded-xl border border-border bg-card">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Bulk Import</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setBulkType('prompt')}
            className={`px-4 py-2 rounded-lg text-xs border transition-all ${bulkType === 'prompt' ? 'border-primary text-white' : 'border-border text-muted-foreground'}`}
            style={bulkType === 'prompt' ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
          >
            Prompts
          </button>
          <button
            onClick={() => setBulkType('note')}
            className={`px-4 py-2 rounded-lg text-xs border transition-all ${bulkType === 'note' ? 'border-primary text-white' : 'border-border text-muted-foreground'}`}
            style={bulkType === 'note' ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
          >
            Notes
          </button>
        </div>
        <textarea
          value={bulkText}
          onChange={e => setBulkText(e.target.value)}
          placeholder="One item per line..."
          rows={6}
          className="w-full rounded-lg px-4 py-3 text-sm bg-background border border-border outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-y mb-3"
        />
        <button
          onClick={handleBulkAdd}
          disabled={bulkAdding || !bulkText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-30"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          <Upload className="w-4 h-4" /> {bulkAdding ? 'Importing...' : 'Import All'}
        </button>
        {bulkResult && (
          <p className="text-sm text-muted-foreground mt-3">
            Imported {bulkResult.success} of {bulkResult.total} items{bulkResult.fail > 0 ? ` (${bulkResult.fail} failed)` : ''}.
          </p>
        )}
      </div>

      {/* Existing items */}
      <div>
        <h3 className="font-heading text-lg text-foreground mb-4">All Items ({items.length})</h3>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${item.type === 'note' ? 'bg-copper/20 text-copper' : 'bg-primary/20 text-primary'}`}>
                {item.type || 'prompt'}
              </span>
              <p className="flex-1 text-sm text-foreground">{item.prompt_text}</p>
              <button
                onClick={() => toggleActive(item)}
                className={`text-xs px-2 py-1 rounded ${item.is_active ? 'text-green-500' : 'text-muted-foreground'}`}
              >
                {item.is_active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-primary transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground italic">No items yet.</p>}
        </div>
      </div>
    </div>
  );
}