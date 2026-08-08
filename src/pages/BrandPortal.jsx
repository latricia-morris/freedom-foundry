import React from 'react';
import { Link } from 'react-router-dom';
import { useMembership } from '@/lib/useMembership';
import { Lock } from 'lucide-react';

const sections = [
  { name: 'Big Picture', path: '/brand-portal/big-picture', desc: 'Your vision, mission, and brand direction.', open: true },
  { name: 'Personal Brand', path: '/brand-portal/personal', desc: 'Bios, fonts, voice, and personal identity.', open: true },
  { name: 'Corporate Brand', path: '/brand-portal/corporate', desc: 'Company identity, colors, and brand system.', open: true },
  { name: 'Brand Guidelines', path: '/brand-portal/guidelines', desc: 'Standards, usage rules, and style notes.', open: false },
  { name: 'Brand Assets', path: '/brand-portal/assets', desc: 'Logos, files, and delivered design assets.', open: false },
  { name: 'Media Kit', path: '/brand-portal/media-kit', desc: 'Press-ready bios, headshots, and links.', open: true },
  { name: 'Brand Up', path: '/brand-portal/brand-up', desc: 'Empowering prompts and your reflections.', open: true },
  { name: 'Ignite OS', path: '/brand-portal/ignite', desc: 'Your activation operating system.', open: false },
];

export default function BrandPortal() {
  const { isClient, loading } = useMembership();

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-[#f7f2ea] mt-1 mb-2">
          Your Brand <span className="molten-text italic">Space</span>
        </h1>
        <p className="text-sm text-[#f7f2ea]/60 leading-relaxed max-w-md">
          Everything needed to build, communicate, and protect your brand — all in one place.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map(section => {
          const gated = !section.open && !isClient;
          return (
            <div key={section.path}>
              {gated ? (
                <div className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] opacity-60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-base text-[#f7f2ea]">{section.name}</h3>
                      <Lock className="w-3.5 h-3.5 text-[#d9c9a3]" strokeWidth={1.5} />
                    </div>
                    <p className="text-xs text-[#f7f2ea]/40">{section.desc}</p>
                  </div>
                </div>
              ) : (
                <Link
                  to={section.path}
                  className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                >
                  <div>
                    <h3 className="font-heading text-base text-[#f7f2ea] mb-1 group-hover:molten-text transition-colors">{section.name}</h3>
                    <p className="text-xs text-[#f7f2ea]/50">{section.desc}</p>
                  </div>
                  <span className="text-[#f7f2ea]/20 group-hover:text-[#f7f2ea]/50 transition-colors text-lg">›</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}