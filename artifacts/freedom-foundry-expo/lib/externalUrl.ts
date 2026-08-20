import { Platform } from 'react-native';

function configuredOrigin(): string | null {
  const explicitOrigin = process.env.EXPO_PUBLIC_API_ORIGIN;
  if (explicitOrigin) return explicitOrigin.replace(/\/+$/, '');

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : null;
}

/**
 * Converts API-relative resources into URLs that Linking can open on native.
 * Web keeps relative URLs on the same origin to preserve existing behavior.
 */
export function resolveExternalUrl(url: string): string | null {
  if (/^[a-z][a-z\d+.-]*:/i.test(url)) return url;
  if (Platform.OS === 'web') return url;

  const origin = configuredOrigin();
  if (!origin) return null;

  return new URL(url.startsWith('/') ? url : `/${url}`, `${origin}/`).toString();
}