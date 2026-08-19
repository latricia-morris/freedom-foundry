import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/react';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a12]">
    <div className="w-8 h-8 border-4 border-[#4a1010] border-t-[#c0392b] rounded-full animate-spin" />
  </div>
);

export default function ProtectedRoute({ unauthenticatedElement }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <Spinner />;
  if (!isSignedIn) return unauthenticatedElement ?? <Navigate to="/sign-in" replace />;
  return <Outlet />;
}
