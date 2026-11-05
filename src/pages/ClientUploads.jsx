import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePortalBrand } from '@/hooks/usePortalBrand';
import BrandUploadsPanel from '@/components/uploads/BrandUploadsPanel';

export default function ClientUploads() {
  const { brand } = usePortalBrand();

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div>
        <Link to="/brand-portal/workspace" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Client Workspace
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-light text-foreground">Client <span className="molten-text italic">Uploads</span></h1>
      </div>
      {!brand ? (
        <div className="dashboard-card p-8 text-center text-sm text-muted-foreground">Uploads open once the team links your email to a brand account.</div>
      ) : (
        <BrandUploadsPanel brandId={brand.id} />
      )}
    </div>
  );
}