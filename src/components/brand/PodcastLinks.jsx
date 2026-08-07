import React from 'react';
import { Plus, X } from 'lucide-react';

export default function PodcastLinks({ podcastLinks, onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-2">
      {podcastLinks.map((pod, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors"
            value={pod.platform || ''}
            onChange={e => onUpdate(i, 'platform', e.target.value)}
            placeholder="Platform / Channel Name"
          />
          <input
            className="flex-[2] rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors"
            value={pod.url || ''}
            onChange={e => onUpdate(i, 'url', e.target.value)}
            placeholder="Link"
          />
          <button onClick={() => onRemove(i)} className="px-2 text-[#1a1420]/30 hover:text-[#1a1420]/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onAdd({ platform: '', url: '' })} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity">
        <Plus className="w-4 h-4" /> Add Podcast Channel
      </button>
    </div>
  );
}