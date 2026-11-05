import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@/components/crm/CrmUi';
import { useBrandAccess } from '@/hooks/useBrandAccess';
import BrandPicker from '@/components/brandTeam/BrandPicker';
import BrandAccessManager from '@/components/brandTeam/BrandAccessManager';
import BrandUploadsPanel from '@/components/uploads/BrandUploadsPanel';

export default function BrandTeam() {
  const { managed, isLoading } = useBrandAccess();
  const [brandId, setBrandId] = useState('');
  if (isLoading) return <Spinner />;
  if (!managed.length) return <Navigate to="/brand-portal/workspace" replace />;
  const active = brandId || managed[0].id;

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="mt-1 font-heading text-3xl font-light text-foreground">Team <span className="molten-text italic">Access</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Decide who can open this brand's portal, and review files your team has sent in.</p>
      </div>
      <BrandPicker brands={managed} value={active} onChange={setBrandId} />
      <BrandAccessManager key={`team-${active}`} brandId={active} />
      <BrandUploadsPanel key={`up-${active}`} brandId={active} reviewOnly />
    </div>
  );
}