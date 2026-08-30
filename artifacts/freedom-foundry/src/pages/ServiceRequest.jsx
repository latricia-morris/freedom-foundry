import React from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

export default function ServiceRequest() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const categoryMap = { branding: 'strategy-branding', design: 'design-activation', software: 'saas-automation' };
  const destination = new URLSearchParams();
  const category = categoryMap[type] || type;
  if (category) destination.set('category', category);
  const tasks = searchParams.get('tasks');
  if (tasks) destination.set('tasks', tasks);
  const query = destination.toString();
  return <Navigate to={`/services${query ? `?${query}` : ''}`} replace />;
}