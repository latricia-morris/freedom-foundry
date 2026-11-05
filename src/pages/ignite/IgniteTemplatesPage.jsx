import React from 'react';
import { useNavigate } from 'react-router-dom';
import TemplatesView from '@/components/ignite/TemplatesView';
import { useFolders } from '@/components/ignite/useIgnite';

export default function IgniteTemplatesPage() {
  const navigate = useNavigate();
  const { data: folders = [] } = useFolders();
  return <TemplatesView folders={folders} onDeployed={(l) => navigate(`/ignite-os/clients/${l.folder_id}/projects/${l.id}`)} />;
}