import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Returns the current user's membership data.
 * account_type: 'free' | 'premium' | 'client' | 'premium_client'
 * isClient: has worked with TBR / Ox & Iron
 * isPremium: purchased portal products
 * isBpmUnlocked: Brand Power Moves is unlocked
 */
export function useMembership() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(async u => {
        if (!mounted) return;
        setUser(u);
        try {
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, '-created_date', 1);
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
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
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