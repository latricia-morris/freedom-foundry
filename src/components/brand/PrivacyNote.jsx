import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyNote() {
  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <Shield className="w-4 h-4 text-[#d9c9a3] flex-shrink-0" />
      <p className="text-xs text-[#f7f2ea]/50 leading-relaxed">
        This page is private — it's only viewable by those you share it with.
      </p>
    </div>
  );
}