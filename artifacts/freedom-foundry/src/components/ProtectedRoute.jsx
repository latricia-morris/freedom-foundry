import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a12]">
    <div className="w-8 h-8 border-4 border-[#4a1010] border-t-[#c0392b] rounded-full animate-spin" />
  </div>
);

export default function ProtectedRoute({ unauthenticatedElement, requireMember = false }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => apiClient.auth.me(),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoaded || (isSignedIn && isUserLoading)) return <Spinner />;

  if (!isSignedIn) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return unauthenticatedElement ?? <Navigate to={`/sign-in?return_url=${returnUrl}`} replace />;
  }

  // Redirect referral-only users away from member pages
  if (requireMember && user?.referral_only) {
    return <Navigate to="/referral-partner-program" replace />;
  }

  return <Outlet />;
}
