import React from 'react';
import { useOutletContext } from 'react-router-dom';
import NotificationsView from '@/components/ignite/NotificationsView';
import { useReviewQueue } from '@/components/ignite/useIgnite';

export default function IgniteNotificationsPage() {
  const { openTask } = useOutletContext();
  const { data: review = [] } = useReviewQueue();
  return <NotificationsView tasks={review} onOpen={openTask} />;
}