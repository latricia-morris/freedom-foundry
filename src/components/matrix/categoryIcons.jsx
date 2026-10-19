import React from 'react';
import {
  Share2,
  Mail,
  Users,
  Globe,
  Mic,
  Megaphone,
  Newspaper,
  Handshake,
  Presentation,
  Store,
} from 'lucide-react';

/** One selective icon per fixed parent category. */
export const CATEGORY_ICONS = {
  social_media: Share2,
  email_marketing: Mail,
  local_network: Users,
  website_seo: Globe,
  content_marketing: Mic,
  online_advertising: Megaphone,
  public_relations: Newspaper,
  partnerships: Handshake,
  events_workshops: Presentation,
  direct_sales_retail: Store,
};

/** Gradient icon tile used across the Matrix overview and category sections. */
export default function CategoryIcon({ iconKey, muted = false, size = 'md' }) {
  const Icon = CATEGORY_ICONS[iconKey];
  if (!Icon) return null;
  const dims = size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  return (
    <span
      className={`${dims} flex shrink-0 items-center justify-center rounded-[3px] ${
        muted
          ? 'border border-border bg-background/50 text-muted-foreground'
          : 'forged-gradient text-white shadow-[0_4px_18px_hsl(18_74%_34%_/_0.35)]'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-4.5 w-4.5' : 'h-5 w-5'} strokeWidth={1.75} />
    </span>
  );
}