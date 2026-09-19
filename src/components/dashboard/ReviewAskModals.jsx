import React, { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { useMembership } from '@/lib/useMembership';
import Move4NudgeModal from './Move4NudgeModal';
import Move12CelebrationModal from './Move12CelebrationModal';
import { MOVE4_THRESHOLD, TOTAL_MOVES } from '@/lib/bpmMilestones';

/**
 * Decides which one-time Brand Power Moves milestone ask to show, if any,
 * and persists the ask status to the member's profile so it never repeats.
 */
export default function ReviewAskModals({ startedCount = 0 }) {
  const { profile, refreshProfile } = useMembership();
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!profile?.id || active) return;
    const m = profile.bpm_milestones || {};
    const markAsked = (key) =>
      apiClient.entities.UserProfile.update(profile.id, {
        bpm_milestones: { ...m, [key]: true },
      }).finally(() => refreshProfile());

    // Move 12 celebration takes priority — never follow it with the move 4 nudge.
    if (startedCount >= TOTAL_MOVES && !m.move12_asked) {
      markAsked('move12_asked');
      setActive('move12');
    } else if (startedCount >= MOVE4_THRESHOLD && !m.move4_asked && !m.move12_asked) {
      markAsked('move4_asked');
      setActive('move4');
    }
  }, [profile, startedCount, active]);

  const finishMove12 = async (data) => {
    if (profile?.id) {
      await apiClient.entities.UserProfile.update(profile.id, {
        bpm_milestones: { ...(profile.bpm_milestones || {}), ...data },
      }).catch(() => {});
      refreshProfile();
    }
    setActive(null);
  };

  return (
    <>
      <Move4NudgeModal open={active === 'move4'} onClose={() => setActive(null)} />
      <Move12CelebrationModal
        open={active === 'move12'}
        onClose={() => setActive(null)}
        onComplete={finishMove12}
      />
    </>
  );
}