import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/crm/CrmUi';
import { useBrandAccess } from '@/hooks/useBrandAccess';
import BrandPicker from '@/components/brandTeam/BrandPicker';
import BrandUploadsPanel from '@/components/uploads/BrandUploadsPanel';

export default function ClientUploads() {
  const { brands, isLoading } = useBrandAccess();
  const [brandId, setBrandId] = useState('');
  const active = brandId || brands[0]?.id;

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div>
        <Link to="/brand-portal/workspace" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Client Workspace
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-light text-foreground">Client <span className="molten-text italic">Uploads</span></h1>
      </div>
      {isLoading ? <Spinner /> : !active ? (
        <div className="dashboard-card p-8 text-center text-sm text-muted-foreground">Uploads open once the team links your email to a brand account.</div>
      ) : (
        <>
          <BrandPicker brands={brands} value={active} onChange={setBrandId} />
          <BrandUploadsPanel key={active} brandId={active} />
        </>
      )}
    </div>
  );
}