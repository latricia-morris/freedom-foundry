import React from 'react';
import BrandAccessManager from '@/components/brandTeam/BrandAccessManager';
import BrandUploadsPanel from '@/components/uploads/BrandUploadsPanel';

export default function ClientAccessTab({ client }) {
  return (
    <div className="space-y-6">
      <BrandAccessManager brandId={client.id} />
      <BrandUploadsPanel brandId={client.id} reviewOnly />
    </div>
  );
}