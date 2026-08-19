import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import BrandUpCard from '@/components/dashboard/BrandUpCard';
import SetupProgressCard from '@/components/dashboard/SetupProgressCard';
import WorkbookProgressCard from '@/components/dashboard/WorkbookProgressCard';
import VaultQuickCard from '@/components/dashboard/VaultQuickCard';
import ActivityCard from '@/components/dashboard/ActivityCard';

export default function Dashboard() {
  const [vaultItems, setVaultItems] = useState([]);

  useEffect(() => {
    base44.entities.VaultItem.filter({ status: 'published' }, 'order', 50)
      .then(setVaultItems)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BrandUpCard />
        </div>
        <div className="lg:col-span-1">
          <SetupProgressCard />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkbookProgressCard />
        <VaultQuickCard vaultItems={vaultItems} />
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