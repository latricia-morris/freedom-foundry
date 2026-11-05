import React from 'react';
import { Inbox } from 'lucide-react';

export default function UploadNotice({ folderName }) {
  return (
    <div className="dashboard-card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="icon-tile hidden sm:flex"><Inbox className="h-6 w-6 text-primary" strokeWidth={1.5} /></div>
        <div className="space-y-3">
          <p className="text-base leading-relaxed text-foreground">
            Upload files you’d like to share with The Brand Revivalist, including existing logos, photos, documents, and other brand materials.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Files submitted here are for review. Uploading a file does not automatically add it to your team’s approved Brand Assets.
          </p>
          {folderName && (
            <p className="pt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Intake folder · <span className="text-foreground">{folderName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}