import React from 'react';
import { useTheme } from '@/lib/theme';
import { AI_PROVIDERS, providerFor } from '@/lib/providers';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * AI provider mark, flat on whatever surface holds it: no container, no
 * background. The light or dark art is chosen from the active theme so the
 * mark keeps its contrast in both modes.
 */
export default function ProviderIcon({ label, providerId, size = 'md', className }) {
  const { theme } = useTheme();
  const provider = providerId
    ? AI_PROVIDERS.find((p) => p.id === providerId)
    : providerFor(label);
  if (!provider) return null;

  return (
    <img
      src={theme === 'light' ? provider.icon.light : provider.icon.dark}
      alt={provider.name}
      title={provider.name}
      draggable={false}
      className={cn('inline-block shrink-0 rounded-full object-contain', SIZES[size], className)}
    />
  );
}