import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Download, ArrowRight, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CoursePlayer({ vaultItem }) {
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.entities.CourseModule.filter({ vault_item_id: vaultItem.id, status: 'published' }, 'order')
      .then(async mods => {
        if (!mounted || !mods?.length) { setLoading(false); return; }
        setModules(mods);
        const lessonSets = await Promise.all(mods.map(m => base44.entities.CourseLesson.filter({ module_id: m.id, status: 'published' }, 'order')));
        if (!mounted) return;
        const map = {};
        mods.forEach((m, i) => { map[m.id] = lessonSets[i] || []; });
        setLessonsByModule(map);
        if (lessonSets[0]?.[0]) setActiveLesson(lessonSets[0][0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    base44.entities.LessonProgress.filter({}).then(p => mounted && setProgress(p || [])).catch(() => {});
    return () => { mounted = false; };
  }, [vaultItem.id]);

  const isDone = (lid) => progress.some(p => p.lesson_id === lid);
  const allLessons = Object.values(lessonsByModule).flat();
  const completedCount = allLessons.filter(l => isDone(l.id)).length;
  const coursePct = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const toggleComplete = async (lid) => {
    const existing = progress.find(p => p.lesson_id === lid);
    if (existing) {
      await base44.entities.LessonProgress.delete(existing.id);
      setProgress(progress.filter(p => p.lesson_id !== lid));
    } else {
      const np = await base44.entities.LessonProgress.create({ lesson_id: lid, completed_at: new Date().toISOString() });
      setProgress([...progress, np]);
    }
  };

  const navigateLesson = (dir) => {
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    const ni = idx + dir;
    if (ni >= 0 && ni < allLessons.length) setActiveLesson(allLessons[ni]);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!modules.length) return (
    <div className="forged-border rounded-2xl bg-card p-12 text-center">
      <h3 className="font-heading text-xl text-foreground mb-2">Course content coming soon</h3>
      <p className="text-sm text-muted-foreground">This course is being forged. Check back shortly.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      <div className="forged-border rounded-2xl bg-card p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto">
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Course Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full forged-gradient rounded-full transition-all duration-500" style={{ width: `${coursePct}%` }} />
            </div>
            <span className="text-xs text-foreground font-medium">{coursePct}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{completedCount} / {allLessons.length} lessons</p>
        </div>
        {modules.map((mod, mi) => (
          <div key={mod.id} className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-2">Module {mi + 1} — {mod.title}</p>
            <div className="space-y-1">
              {(lessonsByModule[mod.id] || []).map((lesson, li) => {
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'}`}>
                    {isDone(lesson.id) ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} /> : <Circle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />}
                    <span className="text-sm truncate">{li + 1}. {lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 min-w-0">
        {activeLesson && (
          <>
            {activeLesson.video_url && (
              <div className="forged-border rounded-2xl bg-black overflow-hidden">
                <div className="aspect-video">
                  <iframe src={activeLesson.video_url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={activeLesson.title} />
                </div>
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-heading text-2xl lg:text-3xl font-light text-foreground mb-1">{activeLesson.title}</h1>
                {activeLesson.duration_minutes && <p className="text-xs uppercase tracking-widest text-muted-foreground">{activeLesson.duration_minutes} min</p>}
              </div>
              <button onClick={() => toggleComplete(activeLesson.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition-all flex-shrink-0 ${isDone(activeLesson.id) ? 'bg-primary/10 text-primary border border-primary/30' : 'forged-border bg-card text-foreground hover:text-primary'}`}>
                {isDone(activeLesson.id) ? <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> : <Circle className="w-4 h-4" strokeWidth={1.5} />}
                {isDone(activeLesson.id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
            {activeLesson.rich_text_body && (
              <div className="forged-border rounded-2xl bg-card p-6">
                <div className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: activeLesson.rich_text_body }} />
              </div>
            )}
            {activeLesson.download_files?.length > 0 && (
              <div className="forged-border rounded-2xl bg-card p-6">
                <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-primary" strokeWidth={1.5} /> Downloads</h3>
                <div className="space-y-2">
                  {activeLesson.download_files.map((file, i) => (
                    <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-sidebar-accent transition-colors">
                      <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span className="text-sm text-foreground flex-1">{file.label || 'Download'}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-4">
              <button onClick={() => navigateLesson(-1)} disabled={allLessons.findIndex(l => l.id === activeLesson.id) === 0} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">← Previous</button>
              <button onClick={() => navigateLesson(1)} disabled={allLessons.findIndex(l => l.id === activeLesson.id) === allLessons.length - 1} className="text-xs uppercase tracking-widest text-primary hover:text-copper transition-colors disabled:opacity-30">Next →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}