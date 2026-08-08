import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProgressRing from '@/components/foundry/ProgressRing';
import { useMembership } from '@/lib/useMembership';
import { SETUP_TASKS, calculateTaskProgress } from '@/lib/setupProgress';

export default function SetupProgressCard() {
  const { profile } = useMembership();
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.BigPicture.filter({}, '-created_date', 1).catch(() => []),
      base44.entities.CorporateBrandProfile.filter({}, '-created_date', 1).catch(() => []),
      base44.entities.PersonalBrandProfile.filter({}, '-created_date', 1).catch(() => []),
      base44.entities.MediaKit.filter({}, '-created_date', 1).catch(() => []),
    ]).then(([bp, cp, pb, mk]) => {
      setRecords({
        big_picture: bp?.[0],
        corporate: cp?.[0],
        personal: pb?.[0],
        media_kit: mk?.[0],
      });
      setLoading(false);
    });
  }, []);

  const setupStatus = profile?.setup_status || {};

  let totalProgress = 0;
  let nextTask = null;
  let completedTasks = 0;

  for (const task of SETUP_TASKS) {
    const status = setupStatus[task.key];
    const record = records[task.key];
    const progress = status === 'complete' ? 100 : calculateTaskProgress(task, record);
    totalProgress += progress;
    if (status === 'complete') completedTasks++;
    if (!nextTask && status !== 'complete') {
      nextTask = { ...task, progress };
    }
  }

  const overallProgress = Math.round(totalProgress / SETUP_TASKS.length);
  const allComplete = completedTasks === SETUP_TASKS.length;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#15151f] border border-[#f7f2ea]/[0.04] p-8 lg:p-10">
      <div className="absolute -bottom-20 -left-20 w-64 h-64 ember-glow-bg opacity-30" />
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <ProgressRing percentage={loading ? 0 : overallProgress} size={180} strokeWidth={8} />
        </div>
        <div className="flex-1 text-center lg:text-left">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal Setup</span>
          <h3 className="font-heading text-xl font-light text-[#f7f2ea] mt-1 mb-3">
            {allComplete ? 'Your brand portal is ready.' : 'Build your brand foundation.'}
          </h3>
          {nextTask ? (
            <>
              <p className="text-sm text-[#f7f2ea]/60 mb-4">
                Next: {nextTask.cta}
              </p>
              <Link
                to={nextTask.path}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white"
                style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
              >
                {nextTask.progress > 0 ? 'Continue' : 'Start'} <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#d9c9a3]">
              <Check className="w-4 h-4" /> All setup tasks complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}