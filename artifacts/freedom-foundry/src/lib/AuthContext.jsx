/**
 * Thin compatibility shim — the real auth is now Clerk.
 * Components that import useAuth() still get isAuthenticated / user / logout.
 * New code should prefer useUser() / useClerk() from @clerk/react directly.
 */
import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/react';

export const useAuth = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [appRole, setAppRole] = useState('user');

  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  useEffect(() => {
    if (!user) {
      setAppRole('user');
      return;
    }

    fetch(`${basePath}/api/auth/me`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setAppRole(data?.user?.role ?? user.publicMetadata?.role ?? 'user'))
      .catch(() => setAppRole(user.publicMetadata?.role ?? 'user'));
  }, [basePath, user?.id, user?.publicMetadata?.role]);

  return {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          first_name: user.firstName ?? '',
          last_name: user.lastName ?? '',
          full_name: user.fullName ?? '',
          avatar_url: user.imageUrl ?? '',
          role: appRole,
        }
      : null,
    isAuthenticated: !!user,
    isLoadingAuth: !isLoaded,
    isLoadingPublicSettings: false,
    authChecked: isLoaded,
    authError: null,
    appPublicSettings: { public_settings: {} },
    logout: (shouldRedirect = true) =>
      signOut({ redirectUrl: shouldRedirect ? basePath || '/' : undefined }),
    navigateToLogin: () => {
      window.location.href = `${basePath}/sign-in`;
    },
    checkUserAuth: () => {},
    checkAppState: () => {},
    setUser: () => {},
    setIsAuthenticated: () => {},
  };
};

// Legacy named export kept for compatibility
export const AuthProvider = ({ children }) => children;
