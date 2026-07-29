import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MissionCard from '@/components/dashboard/MissionCard';
import VaultQuickCard from '@/components/dashboard/VaultQuickCard';
import BrandPowerCard from '@/components/dashboard/BrandPowerCard';
import ActivityCard from '@/components/dashboard/ActivityCard';

export default function Dashboard() {
  const [vaultItems, setVaultItems] = useState([]);
  const [workbooks, setWorkbooks] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.VaultItem.filter({ status: 'published' }),
      base44.entities.WorkbookDefinition.filter({ status: 'published' }),
    ]).then(([v, w]) => {
      setVaultItems(v || []);
      setWorkbooks(w || []);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1">
        <MissionCard completedCount={0} totalCount={workbooks.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VaultQuickCard vaultItems={vaultItems} />
        <BrandPowerCard workbooks={workbooks} />
        <ActivityCard />
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
