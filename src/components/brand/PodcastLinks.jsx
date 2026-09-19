import React from 'react';
import { X } from 'lucide-react';
import AddLinkButton from '@/components/brand/AddLinkButton';

const inputClass = "flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground bg-background border border-border placeholder:text-muted-foreground outline-none focus:border-primary transition-colors";
const urlClass = "flex-[2] rounded-xl px-4 py-2.5 text-sm text-foreground bg-background border border-border placeholder:text-muted-foreground outline-none focus:border-primary transition-colors";

export default function PodcastLinks({ podcastLinks, onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-2">
      {podcastLinks.map((pod, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputClass}
            value={pod.platform || ''}
            onChange={e => onUpdate(i, 'platform', e.target.value)}
            placeholder="Platform / Channel Name"
          />
          <input
            className={urlClass}
            value={pod.url || ''}
            onChange={e => onUpdate(i, 'url', e.target.value)}
            placeholder="Link"
          />
          <button onClick={() => onRemove(i)} className="px-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <AddLinkButton label="Add Podcast Channel" onAdd={() => onAdd({ platform: '', url: '' })} />
    </div>
  );
}