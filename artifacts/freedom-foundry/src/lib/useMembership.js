import { useState, useEffect } from 'react';
import apiClient from '@/api/client';

/**
 * Returns the current user's membership data.
 * account_type: 'free' | 'premium' | 'client' | 'premium_client'
 */
export function useMembership() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiClient.auth.me()
      .then(async u => {
        if (!mounted) return;
        setUser(u);
        try {
          const profiles = await apiClient.entities.UserProfile.filter({ user_id: u.id });
          if (mounted) setProfile(profiles?.[0] || null);
        } catch (_) {}
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const accountType = profile?.account_type || 'free';
  const isClient = accountType === 'client' || accountType === 'premium_client';
  const isPremium = accountType === 'premium' || accountType === 'premium_client';
  const isClientOrPremium = isClient || isPremium;
  const isBpmUnlocked = profile?.brand_power_moves_unlocked === true;

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profiles = await apiClient.entities.UserProfile.filter({ user_id: user.id });
      setProfile(profiles?.[0] || null);
    } catch (_) {}
  };

  return { user, profile, loading, accountType, isClient, isPremium, isClientOrPremium, isBpmUnlocked, refreshProfile };
}

export const ACCOUNT_TYPE_LABELS = {
  free: 'Free',
  premium: 'Premium Member',
  client: 'Client',
  premium_client: 'Premium Client',
};
