import React from 'react';
import { useTheme } from '@/lib/theme';
import { AI_PROVIDERS, providerFor } from '@/lib/providers';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'h-7 w-7 p-1.5',
  md: 'h-10 w-10 p-2',
  lg: 'h-12 w-12 p-2.5',
};

/**
 * AI provider mark inside a rounded glass container, switching to the icon
 * variant that reads on the active theme. Renders nothing for a custom source
 * label that belongs to no known provider.
 */
export default function ProviderIcon({ label, providerId, size = 'md', className }) {
  const { theme } = useTheme();
  const provider = providerId
    ? AI_PROVIDERS.find((p) => p.id === providerId)
    : providerFor(label);
  if (!provider) return null;

  return (
    <span
      title={provider.name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-secondary/40 backdrop-blur-md',
        'shadow-[inset_0_1px_0_hsl(220_28%_96%/0.14),inset_0_-1px_0_hsl(225_20%_2%/0.35)]',
        SIZES[size],
        className
      )}
    >
      <img
        src={theme === 'light' ? provider.icon.light : provider.icon.dark}
        alt={provider.name}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}