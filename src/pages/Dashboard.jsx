import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import BrandUpCard from '@/components/dashboard/BrandUpCard';
import SetupProgressCard from '@/components/dashboard/SetupProgressCard';
import WorkbookProgressCard from '@/components/dashboard/WorkbookProgressCard';
import ActivityCard from '@/components/dashboard/ActivityCard';

export default function Dashboard() {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard />
        <WorkbookProgressCard />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
        <LifeBuoy className="w-3.5 h-3.5" />
        <span>Found a bug or have an idea?</span>
        <Link to="/support" className="link-warm">Report an issue or suggest a feature</Link>
      </div>
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="h-px w-12 bg-border" />
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
          Built With Intention. Forged In Freedom.
        </span>
        <div className="h-px w-12 bg-border" />
      </div>
    </div>
  );
}