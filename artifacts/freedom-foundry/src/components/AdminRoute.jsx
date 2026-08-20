import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';

function Spinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

export default function AdminRoute() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    apiClient.auth.me()
      .then((user) => {
        if (active) setStatus(user.role === 'admin' ? 'allowed' : 'denied');
      })
      .catch(() => {
        if (active) setStatus('denied');
      });
    return () => { active = false; };
  }, []);

  if (status === 'checking') return <Spinner />;
  return status === 'allowed' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}