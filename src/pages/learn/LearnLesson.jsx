import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, List } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AudioPlayer from '@/components/learn/AudioPlayer';
import Outline from '@/components/learn/Outline';
import ProtectedContent from '@/components/learn/ProtectedContent';
import ReadingText from '@/components/learn/ReadingText';
import Worksheet from '@/components/learn/Worksheet';
import { EmbedBlock, ResourceList, VideoBlock } from '@/components/learn/MediaBlocks';
import { LearnMissing, LearnSpinner } from '@/components/learn/LearnState';
import { learnApi } from '@/lib/learn';

const NAV_BTN = 'inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground';

/** The reader and player for one lesson or chapter. */
export default function LearnLesson() {
  const { offeringId, lessonId } = useParams();
  const navigate = useNavigate();
  const [outline, setOutline] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [state, setState] = useState('loading');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    learnApi('offering', { offering_id: offeringId }).then(setOutline).catch(() => setState('missing'));
  }, [offeringId]);

  useEffect(() => {
    setLesson(null);
    setState('loading');
    window.scrollTo(0, 0);
    learnApi('lesson', { offering_id: offeringId, lesson_id: lessonId })
      .then((res) => { setLesson(res.lesson); setState('ready'); })
      .catch((e) => setState(e.response?.status === 403 ? 'locked' : e.response?.status === 404 ? 'missing' : 'error'));
  }, [offeringId, lessonId]);

  if (state === 'locked') return <LearnMissing notFound={false} message="You do not have access to this yet." />;
  if (state === 'missing') return <LearnMissing message="This lesson is not available." />;
  if (state === 'error') return <LearnMissing notFound={false} message="This could not be loaded. Please try again." />;
  if (!lesson || !outline) return <LearnSpinner />;

  const all = outline.groups.flatMap((g) => g.lessons);
  const idx = all.findIndex((l) => l.id === lessonId);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const go = (l) => navigate(`/learn/${offeringId}/${l.id}`);
  const audioSrc = lesson.audio.src || lesson.audio.url;

  const toggleComplete = async () => {
    const completed = !lesson.completed;
    setLesson({ ...lesson, completed });
    setOutline({ ...outline, groups: outline.groups.map((g) => ({ ...g, lessons: g.lessons.map((l) => (l.id === lessonId ? { ...l, completed } : l)) })) });
    await learnApi('complete', { offering_id: offeringId, lesson_id: lessonId, completed });
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in pb-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link to={`/learn/${offeringId}`} className="inline-flex min-w-0 items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{outline.offering.title}</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={NAV_BTN}><List className="h-4 w-4" /> {outline.offering.kind === 'book' ? 'Chapters' : 'Lessons'}</SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetTitle className="mb-6 font-heading text-2xl font-normal">{outline.offering.title}</SheetTitle>
            <Outline offeringId={offeringId} groups={outline.groups} hasAccess currentId={lessonId} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {audioSrc && (
        <div className="sticky top-24 z-20 mb-10">
          <AudioPlayer src={audioSrc} title={lesson.title} onPrev={prev ? () => go(prev) : undefined} onNext={next ? () => go(next) : undefined} />
        </div>
      )}

      <ProtectedContent className="space-y-10">
        <header className="text-center">
          {(lesson.module_title || outline.offering.author) && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{lesson.module_title || outline.offering.author}</p>
          )}
          <h1 className="mt-3 font-heading text-4xl font-light leading-tight text-foreground sm:text-5xl">{lesson.title}</h1>
          {lesson.subtitle && <p className="molten-text mt-4 text-xs font-semibold uppercase tracking-[0.25em]">{lesson.subtitle}</p>}
          {lesson.status === 'draft' && <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">Draft · only admins can see this</p>}
        </header>
        <VideoBlock video={lesson.video} poster={lesson.poster} />
        {lesson.body && <ReadingText content={lesson.body} />}
      </ProtectedContent>

      <div className="mt-12 space-y-10">
        <EmbedBlock code={lesson.embed_code} />
        {lesson.worksheet && <Worksheet worksheet={lesson.worksheet} initialAnswers={lesson.answers} offeringId={offeringId} lessonId={lessonId} />}
        <ResourceList title="Resources" items={lesson.resources} />
        <ResourceList title={`${lesson.module_title || 'Module'} resources`} items={lesson.module_resources} />
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        {prev ? <button type="button" onClick={() => go(prev)} className={NAV_BTN}><ArrowLeft className="h-4 w-4" /> Previous</button> : <span />}
        <button type="button" onClick={toggleComplete} aria-pressed={lesson.completed}
          className={lesson.completed ? `${NAV_BTN} border-primary/50 text-foreground` : 'btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest'}>
          <Check className="h-4 w-4" /> {lesson.completed ? 'Completed' : 'Mark complete'}
        </button>
        {next ? <button type="button" onClick={() => go(next)} className={NAV_BTN}>Next <ArrowRight className="h-4 w-4" /></button> : <span />}
      </footer>
    </div>
  );
}