import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Lock } from 'lucide-react';
import apiClient from '@/api/client';
import { useMembership } from '@/lib/useMembership';
import { Image } from '@/components/ui/image';
import ReviewAskModals from './ReviewAskModals';

const COVER_FALLBACK =
  'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/227d4a0ca_flatbookright.png';

/**
 * Brand Power Moves — the dashboard companion card for the book.
 * Locked: prompts the unlock code from the book. Unlocked: cover, progress,
 * current move, and one-time milestone review-ask modals.
 */
export default function WorkbookProgressCard() {
  const [workbooks, setWorkbooks] = useState([]);
  const [responses, setResponses] = useState([]);
  const [cover, setCover] = useState(COVER_FALLBACK);
  const [loading, setLoading] = useState(true);
  const { isBpmUnlocked, loading: memberLoading } = useMembership();

  useEffect(() => {
    apiClient.entities.VaultItem.filter({ title: 'Brand Power Moves' })
      .then((items) => setCover(items?.[0]?.featured_image_url || COVER_FALLBACK))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (memberLoading || !isBpmUnlocked) {
      setWorkbooks([]);
      setResponses([]);
      setLoading(!memberLoading);
      return;
    }
    setLoading(true);
    Promise.all([
      apiClient.entities.WorkbookDefinition.filter({ status: 'published' }, 'order', 50),
      apiClient.entities.WorkbookResponse.filter({}).catch(() => []),
    ]).then(([w, r]) => {
      setWorkbooks(w || []);
      setResponses(r || []);
      setLoading(false);
    });
  }, [isBpmUnlocked, memberLoading]);

  const responsesByWorkbook = {};
  (responses || []).forEach((r) => {
    if (!responsesByWorkbook[r.workbook_id]) responsesByWorkbook[r.workbook_id] = [];
    responsesByWorkbook[r.workbook_id].push(r);
  });

  const totalWorkbooks = workbooks.length;
  const startedWorkbooks = workbooks.filter((w) => (responsesByWorkbook[w.id]?.length || 0) > 0);
  const startedCount = startedWorkbooks.length;
  const progress = totalWorkbooks > 0 ? Math.round((startedCount / totalWorkbooks) * 100) : 0;
  const nextWorkbook = workbooks.find((w) => (responsesByWorkbook[w.id]?.length || 0) === 0);

  const coverImage = (
    <div className="w-20 sm:w-24 flex-shrink-0">
      <Image
        src={cover}
        alt="Brand Power Moves book cover"
        fittingType="fit"
        className="w-full aspect-[2/3]"
      />
    </div>
  );

  if (!isBpmUnlocked) {
    return (
      <div className="dash-editorial-block h-full">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">Brand Power Moves</h3>
        </div>
        <div className="flex gap-5 items-start">
          {coverImage}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Your free companion resource to the book — twelve guided workbooks that put each
              move to work in your business.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Find the unlock code inside your copy of <em>Brand Power Moves</em>.
            </p>
            <Link
              to="/workbooks"
              className="btn-forge inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest"
            >
              <Lock className="w-4 h-4" /> Unlock With Book Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-editorial-block h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">Brand Power Moves</h3>
        </div>
        <Link to="/workbooks" className="link-warm text-xs uppercase tracking-wider">View All</Link>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : totalWorkbooks === 0 ? (
        <p className="text-sm italic text-muted-foreground">Workbooks coming soon.</p>
      ) : (
        <>
          <div className="flex gap-5 items-start mb-5">
            {coverImage}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Overall Progress</span>
                <span className="text-sm font-medium text-foreground">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-input border border-border/50">
                <div
                  className="h-full rounded-full molten-bar transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary mt-2.5">
                {startedCount} of {totalWorkbooks} moves in motion
              </p>
            </div>
          </div>

          {nextWorkbook ? (
            <div className="bg-input rounded-xl p-4 border border-border/50">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary mb-1.5">Next Up</p>
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-base text-foreground">{nextWorkbook.title}</p>
                <Link
                  to={`/workbooks/${nextWorkbook.id}`}
                  className="btn-forge inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] uppercase tracking-widest flex-shrink-0"
                >
                  Start <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-input rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground">
                All {totalWorkbooks} moves in motion — bring it home.
              </p>
            </div>
          )}
        </>
      )}

      <ReviewAskModals startedCount={startedCount} />
    </div>
  );
}