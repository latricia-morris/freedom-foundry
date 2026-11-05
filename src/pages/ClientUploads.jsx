import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UploadNotice from '@/components/uploads/UploadNotice';
import UploadDropzone from '@/components/uploads/UploadDropzone';
import UploadHistory from '@/components/uploads/UploadHistory';

// Temporary sample data until the intake folder is connected.
const SAMPLE = [{ id: 's1', file_name: 'Sample — logo-primary.png', uploaded_by_email: 'sample@client.com', created_date: new Date().toISOString() }];

export default function ClientUploads() {
  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div>
        <Link to="/brand-portal/workspace" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Client Workspace
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-light text-foreground">Client <span className="molten-text italic">Uploads</span></h1>
      </div>
      <UploadNotice folderName="Your Brand — Client Uploads" />
      <UploadDropzone onUpload={async () => {}} busy={false} />
      <UploadHistory uploads={SAMPLE} />
    </div>
  );
}