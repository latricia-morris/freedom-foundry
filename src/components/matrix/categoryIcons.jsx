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

/**
 * Unboxed line icon: one family, one stroke weight, consistent size per
 * context, warm copper tone. No enclosing box, no gradient, and no
 * colored-versus-muted distinction — assessment status is stated in text.
 */
export default function CategoryIcon({ iconKey, size = 'md', className = '' }) {
  const Icon = CATEGORY_ICONS[iconKey];
  if (!Icon) return null;
  const dims = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  return <Icon className={`${dims} icon-warm ${className}`} strokeWidth={1.5} aria-hidden="true" />;
}