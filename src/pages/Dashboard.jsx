import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import MissionCard from '@/components/dashboard/MissionCard';
import VaultQuickCard from '@/components/dashboard/VaultQuickCard';
import BrandPowerCard from '@/components/dashboard/BrandPowerCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import { useMembership } from '@/lib/useMembership';

export default function Dashboard() {
  const [vaultItems, setVaultItems] = useState([]);
  const [workbooks, setWorkbooks] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const { user, profile } = useMembership();

  useEffect(() => {
    Promise.all([
      base44.entities.VaultItem.filter({ status: 'published' }),
      base44.entities.WorkbookDefinition.filter({ status: 'published' }),
      base44.entities.LessonProgress.filter({}).catch(() => []),
    ]).then(([v, w, lp]) => {
      setVaultItems(v || []);
      setWorkbooks(w || []);
      setLessonProgress(lp || []);
    });
  }, []);

  // Determine in-progress programs — workbooks that have partial completion
  const inProgressWorkbooks = workbooks.filter(w => {
    // A workbook is "in progress" if it's published (we show all for now)
    return true;
  });

  const completedCount = lessonProgress.length;
  const totalCount = workbooks.length;

  // Active program prioritization
  const activeProgram = profile?.active_program_id
    ? workbooks.find(w => w.id === profile.active_program_id)
    : null;

  const focusedWorkbook = activeProgram || inProgressWorkbooks[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Brand Progress — top hero */}
      <div className="grid grid-cols-1">
        <MissionCard
          completedCount={completedCount}
          totalCount={totalCount}
          inProgressWorkbooks={inProgressWorkbooks}
          activeProgram={focusedWorkbook}
          user={user}
        />
      </div>

      {/* Multiple in-progress programs prompt */}
      {inProgressWorkbooks.length > 1 && !profile?.active_program_id && (
        <div className="dash-editorial-block">
          <p className="font-body text-sm text-[#2c2c33] leading-relaxed">
            It looks like you have a couple programs in the works. Which one should we be most focused on right now?
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {inProgressWorkbooks.slice(0, 4).map(w => (
              <Link
                key={w.id}
                to={`/vault/${w.vault_item_id || w.id}`}
                className="px-4 py-2 rounded-lg border border-[#1a1420]/10 text-sm font-body text-[#1a1420] hover:bg-[#1a1420]/5 transition-colors"
              >
                {w.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity first, then Vault, then Brand Power */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityCard />
        <VaultQuickCard vaultItems={vaultItems} />
        <BrandPowerCard workbooks={workbooks} activeProgram={focusedWorkbook} />
      </div>

      <div className="flex items-center justify-center gap-3 py-6">
        <div className="h-px w-12 bg-border" />
        <span className="text-xs uppercase tracking-[0.3em] text-[#d9c9a3]">
          Built With Intention. Forged In Freedom.
        </span>
        <div className="h-px w-12 bg-border" />
      </div>
    </div>
  );
}