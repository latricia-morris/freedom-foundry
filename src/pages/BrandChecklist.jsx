import React, { useState, useEffect } from 'react';
import { Check, Plus, X, Edit2, Trash2, ChevronDown, ChevronRight, Send, Calendar } from 'lucide-react';
import apiClient from '@/api/client';
import { useNavigate } from 'react-router-dom';

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.deadline_date && b.deadline_date) return new Date(a.deadline_date) - new Date(b.deadline_date);
    if (a.deadline_date && !b.deadline_date) return -1;
    if (!a.deadline_date && b.deadline_date) return 1;
    return 0;
  });
}

function deadlineLabel(task) {
  if (!task.deadline_date) return 'No timeline';
  const d = new Date(task.deadline_date);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays <= 30) return `${diffDays} days`;
  if (diffDays <= 60) return '~2 months';
  if (diffDays <= 90) return '~3 months';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BrandChecklist() {
  const [tasks, setTasks] = useState([]);
  const [subTasks, setSubTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('none');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskAssignee, setSubTaskAssignee] = useState('');
  const [selectedForProposal, setSelectedForProposal] = useState(new Set());
  const navigate = useNavigate();

  const TIMEFRAMES = [
    { key: 'none', label: 'No timeline' },
    { key: '1_month', label: '1 Month' },
    { key: '3_months', label: '3 Months' },
    { key: '6_months', label: '6 Months' },
  ];

  const computeDeadline = (tf) => {
    if (tf === 'none') return '';
    const now = new Date();
    const months = tf === '1_month' ? 1 : tf === '3_months' ? 3 : 6;
    now.setMonth(now.getMonth() + months);
    return now.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const all = await apiClient.entities.ChecklistTask.filter({}, '-created_date', 200);
      const top = sortTasks(all.filter(t => !t.parent_id));
      const subs = {};
      all.filter(t => t.parent_id).forEach(t => {
        if (!subs[t.parent_id]) subs[t.parent_id] = [];
        subs[t.parent_id].push(t);
      });
      Object.keys(subs).forEach(k => { subs[k] = sortTasks(subs[k]); });
      setTasks(top);
      setSubTasks(subs);
    } catch (_) {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      await apiClient.entities.ChecklistTask.create({
        title: newTitle.trim(),
        deadline_date: newDeadline || null,
        timeframe: newTimeframe,
        status: 'pending',
      });
      setNewTitle('');
      setNewDeadline('');
      setNewTimeframe('none');
      loadTasks();
    } catch (_) {}
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await apiClient.entities.ChecklistTask.update(task.id, { status: newStatus });
      loadTasks();
    } catch (_) {}
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDeadline(task.deadline_date || '');
  };

  const saveEdit = async (id) => {
    try {
      await apiClient.entities.ChecklistTask.update(id, { title: editTitle, deadline_date: editDeadline || null });
      setEditingId(null);
      loadTasks();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    try {
      const subs = subTasks[id] || [];
      await Promise.all(subs.map(s => apiClient.entities.ChecklistTask.delete(s.id)));
      await apiClient.entities.ChecklistTask.delete(id);
      loadTasks();
    } catch (_) {}
  };

  const addSubTask = async (parentId) => {
    if (!subTaskTitle.trim()) return;
    try {
      await apiClient.entities.ChecklistTask.create({
        title: subTaskTitle.trim(),
        parent_id: parentId,
        assignee: subTaskAssignee || null,
        status: 'pending',
      });
      setSubTaskTitle('');
      setSubTaskAssignee('');
      loadTasks();
    } catch (_) {}
  };

  const updateSubTaskAssignee = async (id, assignee) => {
    try {
      await apiClient.entities.ChecklistTask.update(id, { assignee });
      loadTasks();
    } catch (_) {}
  };

  const toggleProposalSelection = (id) => {
    setSelectedForProposal(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleRequestProposal = () => {
    const selected = tasks.filter(t => selectedForProposal.has(t.id));
    const titles = selected.map(t => t.title).join('\n• ');
    navigate('/brand-portal/request-services' + (titles ? `?tasks=${encodeURIComponent('• ' + titles)}` : ''));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1 mb-1">Brand <span className="molten-text italic">Checklist</span></h1>
        <p className="text-sm text-muted-foreground">Your action items, sorted by deadline. Break tasks into sub-tasks and request services when you're ready.</p>
      </div>

      {/* Add new task */}
      <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h2 className="font-heading text-lg">Add a Task</h2>
        </div>
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="What do you need to do?"
          className="w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-background border border-border placeholder:text-muted-foreground outline-none focus:border-primary transition-colors mb-3"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.key}
              onClick={() => { setNewTimeframe(tf.key); setNewDeadline(computeDeadline(tf.key)); }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${newTimeframe === tf.key ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-foreground/50 hover:border-border'}`}
            >
              {tf.label}
            </button>
          ))}
          <input
            type="date"
            value={newDeadline}
            onChange={e => { setNewDeadline(e.target.value); setNewTimeframe('none'); }}
            className="rounded-lg px-3 py-1.5 text-xs text-foreground bg-background border border-border outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="btn-forge ml-auto px-5 py-1.5 rounded-lg text-xs uppercase tracking-widest disabled:opacity-30"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 shadow-sm text-center py-12">
          <p className="text-sm text-foreground/50">No tasks yet. Add one above or from any workbook exercise.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const subs = subTasks[task.id] || [];
            const isExpanded = expandedTask === task.id;
            const isSelected = selectedForProposal.has(task.id);
            return (
              <div key={task.id} className="bg-card text-card-foreground border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-start gap-3">
                  {/* Proposal selection checkbox */}
                  <button
                    onClick={() => toggleProposalSelection(task.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isSelected ? 'border-primary bg-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>

                  {/* Complete checkbox */}
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${task.status === 'completed' ? 'border-primary bg-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {task.status === 'completed' && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full rounded-lg px-3 py-1.5 text-sm text-foreground bg-background border border-border outline-none focus:border-primary"
                          onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editDeadline}
                            onChange={e => setEditDeadline(e.target.value)}
                            className="rounded-lg px-3 py-1.5 text-xs text-foreground bg-background border border-border outline-none focus:border-primary"
                          />
                          <button onClick={() => saveEdit(task.id)} className="btn-forge px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-foreground/50">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={`text-sm text-foreground ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs flex items-center gap-1 ${task.deadline_date ? 'text-primary' : 'text-foreground/40'}`}>
                            <Calendar className="w-3 h-3" /> {deadlineLabel(task)}
                          </span>
                          {task.source_workbook_title && (
                            <span className="text-xs text-foreground/30 italic">from {task.source_workbook_title}</span>
                          )}
                          {subs.length > 0 && (
                            <span className="text-xs text-foreground/40">{subs.length} sub-task{subs.length > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== task.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setExpandedTask(isExpanded ? null : task.id)} className="p-1.5 text-foreground/40 hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleEdit(task)} className="p-1.5 text-foreground/40 hover:text-primary transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 text-foreground/40 hover:text-primary transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-tasks */}
                {isExpanded && (
                  <div className="mt-4 ml-8 space-y-2 border-l-2 border-border pl-4">
                    {subs.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleComplete(sub)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${sub.status === 'completed' ? 'border-primary bg-primary' : 'border-border'}`}
                        >
                          {sub.status === 'completed' && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </button>
                        <span className={`text-sm flex-1 ${sub.status === 'completed' ? 'line-through opacity-50 text-foreground' : 'text-foreground'}`}>{sub.title}</span>
                        <input
                          type="text"
                          value={sub.assignee || ''}
                          onChange={e => updateSubTaskAssignee(sub.id, e.target.value)}
                          placeholder="Assignee"
                          className="w-28 rounded-lg px-2 py-1 text-xs text-foreground bg-background border border-border outline-none focus:border-primary placeholder:text-muted-foreground"
                        />
                        <button onClick={() => handleDelete(sub.id)} className="p-1 text-foreground/30 hover:text-primary">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={expandedTask === task.id ? subTaskTitle : ''}
                        onChange={e => setSubTaskTitle(e.target.value)}
                        placeholder="Add sub-task..."
                        className="flex-1 rounded-lg px-3 py-1.5 text-sm text-foreground bg-background border border-border outline-none focus:border-primary placeholder:text-muted-foreground"
                        onKeyDown={e => e.key === 'Enter' && addSubTask(task.id)}
                      />
                      <input
                        type="text"
                        value={expandedTask === task.id ? subTaskAssignee : ''}
                        onChange={e => setSubTaskAssignee(e.target.value)}
                        placeholder="Assignee"
                        className="w-28 rounded-lg px-2 py-1.5 text-xs text-foreground bg-background border border-border outline-none focus:border-primary placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={() => addSubTask(task.id)}
                        disabled={!subTaskTitle.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs text-primary border border-primary/30 hover:bg-primary/5 disabled:opacity-30"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Request Proposal bar */}
      {selectedForProposal.size > 0 && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={handleRequestProposal}
            className="btn-forge flex items-center gap-2 px-6 py-3 rounded-xl text-sm uppercase tracking-widest shadow-lg"
          >
            <Send className="w-4 h-4" /> Request Proposal ({selectedForProposal.size})
          </button>
        </div>
      )}
    </div>
  );
}