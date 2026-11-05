import React from 'react';
import { Spinner } from '@/components/crm/CrmUi';
import { useClientUploads } from '@/hooks/useClientUploads';
import UploadNotice from '@/components/uploads/UploadNotice';
import UploadDropzone from '@/components/uploads/UploadDropzone';
import UploadHistory from '@/components/uploads/UploadHistory';

/** Full intake experience for one brand. `reviewOnly` hides the send form (agency view). */
export default function BrandUploadsPanel({ brandId, reviewOnly = false }) {
  const { data, isLoading, upload, open, review, progress } = useClientUploads(brandId);
  if (isLoading || !data) return <Spinner />;
  const reviewer = data.can_review;
  return (
    <div className="space-y-6">
      {!reviewOnly && <UploadNotice folderName={data.folder_name} />}
      {!reviewOnly && <UploadDropzone onUpload={upload} busy={!!progress} progress={progress} />}
      <UploadHistory
        title={reviewOnly ? data.folder_name : 'Sent for review'}
        uploads={data.uploads}
        onOpen={reviewer ? open : undefined}
        onReview={reviewer ? review : undefined}
      />
    </div>
  );
}