import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export default function ServiceRequest() {
  const { type } = useParams();
  const categoryMap = { branding: 'strategy-branding', design: 'design-activation', software: 'saas-automation' };
  return <Navigate to={`/services?category=${encodeURIComponent(categoryMap[type] || type || '')}`} replace />;
}