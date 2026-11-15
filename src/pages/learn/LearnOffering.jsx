import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import Outline from '@/components/learn/Outline';
import AccessButton from '@/components/learn/AccessButton';
import { EmbedBlock, ResourceList, VideoBlock } from '@/components/learn/MediaBlocks';
import { LearnMissing, LearnSpinner } from '@/components/learn/LearnState';
import { learnApi, priceLabel } from '@/lib/learn';

/** A course or book: what it is, what is inside, and the way in. */
export default function LearnOffering() {
  const { offeringId } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [confirming, setConfirming] = useState(() => new URLSearchParams(window.location.search).get('purchase') === 'success');

  const load = useCallback(async () => {
    try {
      const res = await learnApi('offering', { offering_id: offeringId });
      setData(res);
      setState('ready');
      return res;
    } catch (e) {
      setState(e.response?.status === 404 ? 'missing' : 'error');
      return null;
    }
  }, [offeringId]);

  useEffect(() => { load(); }, [load]);

  // After checkout, access arrives once the payment is confirmed; check a few times.
  useEffect(() => {
    if (!confirming) return undefined;
    let tries = 0;
    const id = setInterval(async () => {
      tries += 1;
      const res = await load();
      if (res?.offering.has_access || tries >= 10) { clearInterval(id); setConfirming(false); }
    }, 2500);
    return () => clearInterval(id);
  }, [confirming, load]);

  if (state === 'loading') return <LearnSpinner />;
  if (state !== 'ready') return <LearnMissing notFound={state === 'missing'} message={state === 'missing' ? 'This course or book is not available.' : 'This could not be loaded. Please try again.'} />;

  const { offering: o, groups } = data;
  const firstLesson = groups.flatMap((g) => g.lessons).find((l) => !l.completed) || groups[0]?.lessons[0];

  return (
    <div className="animate-fade-in pb-12">
      <Link to="/learn" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> The Academy
      </Link>

      <header className={`grid items-center gap-10 ${o.thumbnail_url ? 'lg:grid-cols-[1.1fr_1fr]' : ''}`}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
            {o.kind === 'book' ? 'Book' : 'Course'}{o.status !== 'published' && ` · ${o.status}`}
          </p>
          <h1 className="mt-3 font-heading text-5xl font-light leading-[1.05] text-foreground sm:text-6xl">{o.title}</h1>
          {o.subtitle && <p className="mt-4 text-xl text-muted-foreground">{o.subtitle}</p>}
          {o.author && <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">By {o.author}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <AccessButton offering={o} firstLessonId={firstLesson?.id} onGranted={load} />
            {!o.has_access && <span className="text-sm text-muted-foreground">{priceLabel(o)}</span>}
            {confirming && !o.has_access && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment…</span>
            )}
          </div>
        </div>
        {o.thumbnail_url && <Image src={o.thumbnail_url} alt="" className="aspect-[4/3] w-full border border-border" />}
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          {o.description && <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{o.description}</p>}
          <VideoBlock video={o.video} poster={o.thumbnail_url} />
          <EmbedBlock code={o.embed_code} />
          <ResourceList title={o.kind === 'book' ? 'Book resources' : 'Course resources'} items={o.resources} />
        </div>
        {groups.length > 0 && (
          <aside>
            <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{o.kind === 'book' ? 'Chapters' : 'Curriculum'}</p>
            <Outline offeringId={o.id} groups={groups} hasAccess={o.has_access} />
          </aside>
        )}
      </div>
    </div>
  );
}