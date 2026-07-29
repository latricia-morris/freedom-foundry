import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MissionCard from '@/components/dashboard/MissionCard';
import VaultQuickCard from '@/components/dashboard/VaultQuickCard';
import BrandPowerCard from '@/components/dashboard/BrandPowerCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import WarmGradientDefs from '@/components/shared/WarmGradientDefs';

export default function Dashboard() {
  const [vaultItems, setVaultItems] = useState([]);
  const [workbooks, setWorkbooks] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.VaultItem.filter({ status: 'published' }, 'order', 50).catch(() => []),
      base44.entities.WorkbookDefinition.filter({ status: 'published' }, 'order', 10).catch(() => []),
    ]).then(([v, w]) => {
      setVaultItems(v || []);
      setWorkbooks(w || []);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <WarmGradientDefs />
      <MissionCard completedCount={0} totalCount={workbooks.length || 0} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrandPowerCard workbooks={workbooks} />
        <VaultQuickCard vaultItems={vaultItems} />
      </div>

      <ActivityCard />

      <div className="flex items-center justify-center gap-3 py-6">
        <div className="h-px w-12 bg-border" />
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Built with intention. Forged in freedom.™</span>
        <div className="h-px w-12 bg-border" />
      </div>
    </div>
  );
}