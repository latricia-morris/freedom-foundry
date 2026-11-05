import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePortalBrand } from '@/hooks/usePortalBrand';
import BrandAccessManager from '@/components/brandTeam/BrandAccessManager';
import BrandUploadsPanel from '@/components/uploads/BrandUploadsPanel';

export default function BrandTeam() {
  const { brand, isAdmin } = usePortalBrand();
  if (!brand || (!isAdmin && brand.role === 'team_member')) return <Navigate to="/brand-portal/workspace" replace />;

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{brand.company_name}</span>
        <h1 className="mt-1 font-heading text-3xl font-light text-foreground">Team <span className="molten-text italic">Access</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Decide who can open this brand's portal, and review files your team has sent in.</p>
      </div>
      <BrandAccessManager brandId={brand.id} />
      <BrandUploadsPanel brandId={brand.id} reviewOnly />
    </div>
  );
}