import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import StructureTree from '@/components/admin/learn/StructureTree';
import OfferingForm from '@/components/admin/learn/OfferingForm';
import ModuleForm from '@/components/admin/learn/ModuleForm';
import LessonForm from '@/components/admin/learn/LessonForm';
import { kindLabel, STATUS_LABELS } from '@/lib/learn';

const { LearnOffering, LearnModule, LearnLesson } = base44.entities;

/** Builds one course or book: details and pricing, then its modules and lessons. */
export default function AdminLearnEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [offering, setOffering] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState({ type: 'offering' });
  const [saving, setSaving] = useState(false);

  const loadTree = useCallback(async () => {
    const [m, l] = await Promise.all([
      LearnModule.filter({ offering_id: id }, 'sort_order', 500),
      LearnLesson.filter({ offering_id: id }, 'sort_order', 1000),
    ]);
    setModules(m || []);
    setLessons(l || []);
  }, [id]);

  useEffect(() => {
    LearnOffering.get(id).then(setOffering).catch(() => navigate('/admin/learn'));
    loadTree();
  }, [id, loadTree, navigate]);

  const run = async (work, done) => {
    setSaving(true);
    try {
      await work();
      if (done) toast({ title: done });
    } catch (e) {
      toast({ title: 'That did not save', description: e.response?.data?.error || e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveOffering = (patch) => run(async () => {
    await LearnOffering.update(id, patch);
    const res = await base44.functions.invoke('learnAdmin', { action: 'sync', offering_id: id });
    setOffering(res.data.offering);
  }, patch.is_free ? 'Saved' : 'Saved and updated in Stripe');

  const removeOffering = () => {
    if (!window.confirm(`Delete "${offering.title}" and everything in it? If members already own it, it is archived instead.`)) return;
    run(async () => {
      const res = await base44.functions.invoke('learnAdmin', { action: 'remove', offering_id: id });
      if (res.data.deleted) return navigate('/admin/learn');
      toast({ title: 'Archived instead of deleted', description: `${res.data.owners} member${res.data.owners === 1 ? ' owns' : 's own'} this, so they keep their access.` });
      setOffering(await LearnOffering.get(id));
    });
  };

  const addModule = () => run(async () => {
    const m = await LearnModule.create({ offering_id: id, title: offering.kind === 'book' ? 'New part' : 'New module', status: 'draft', sort_order: modules.length });
    await loadTree();
    setSelected({ type: 'module', id: m.id });
  });

  const addLesson = (moduleId) => run(async () => {
    const l = await LearnLesson.create({ offering_id: id, module_id: moduleId, title: offering.kind === 'book' ? 'New chapter' : 'New lesson', status: 'draft', sort_order: lessons.length });
    await loadTree();
    setSelected({ type: 'lesson', id: l.id });
  });

  const move = (list, index, dir, entity) => run(async () => {
    const next = [...list];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    await base44.entities[entity].bulkUpdate(next.map((item, i) => ({ id: item.id, sort_order: i })));
    await loadTree();
  });

  const saveItem = (entity, itemId, patch) => run(async () => {
    await entity.update(itemId, patch);
    await loadTree();
  }, 'Saved');

  const deleteModule = (m) => {
    if (!window.confirm(`Delete "${m.title}" and the lessons inside it?`)) return;
    run(async () => {
      await LearnLesson.deleteMany({ module_id: m.id });
      await LearnModule.delete(m.id);
      setSelected({ type: 'offering' });
      await loadTree();
    }, 'Deleted');
  };

  const deleteLesson = (l) => {
    if (!window.confirm(`Delete "${l.title}"?`)) return;
    run(async () => {
      await LearnLesson.delete(l.id);
      setSelected({ type: 'offering' });
      await loadTree();
    }, 'Deleted');
  };

  if (!offering) return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;

  const module = selected.type === 'module' && modules.find((m) => m.id === selected.id);
  const lesson = selected.type === 'lesson' && lessons.find((l) => l.id === selected.id);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <Link to="/admin/learn" className="mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Courses &amp; books
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{kindLabel(offering)} · {STATUS_LABELS[offering.status]}</p>
          <h1 className="mt-1 font-heading text-4xl font-light text-foreground">{offering.title}</h1>
        </div>
        <Link to={`/learn/${id}`} target="_blank" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <Eye className="h-4 w-4" /> Preview as a learner
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <StructureTree kind={offering.kind} modules={modules} lessons={lessons} selected={selected} onSelect={setSelected} onAddModule={addModule} onAddLesson={addLesson} onMove={move} />
        <div className="dashboard-card p-6">
          {lesson ? (
            <LessonForm key={lesson.id} lesson={lesson} modules={modules} saving={saving} onSave={(p) => saveItem(LearnLesson, lesson.id, p)} onDelete={() => deleteLesson(lesson)} />
          ) : module ? (
            <ModuleForm key={module.id} module={module} saving={saving} onSave={(p) => saveItem(LearnModule, module.id, p)} onDelete={() => deleteModule(module)} />
          ) : (
            <OfferingForm key={offering.updated_date} offering={offering} saving={saving} onSave={saveOffering} onRemove={removeOffering} />
          )}
        </div>
      </div>
    </div>
  );
}