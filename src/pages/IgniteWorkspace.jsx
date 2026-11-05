import React, { useEffect, useState } from 'react';
import '@/components/ignite/ignite.css';
import Sidebar from '@/components/ignite/Sidebar';
import ProjectPicker from '@/components/ignite/ProjectPicker';
import ListCockpit from '@/components/ignite/ListCockpit';
import TemplatesView from '@/components/ignite/TemplatesView';
import NotificationsView from '@/components/ignite/NotificationsView';
import FolderSettings from '@/components/ignite/FolderSettings';
import ListSettings from '@/components/ignite/ListSettings';
import GuidelinesPanel from '@/components/ignite/GuidelinesPanel';
import TaskModal from '@/components/ignite/TaskModal';
import { useFolders, useLists, useReviewQueue } from '@/components/ignite/useIgnite';

export default function IgniteWorkspace() {
  const [view, setView] = useState('projects');
  const [folderId, setFolderId] = useState('');
  const [listId, setListId] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [guides, setGuides] = useState(false);
  const { data: folders = [] } = useFolders();
  const { data: lists = [] } = useLists(folderId);
  const { data: review = [] } = useReviewQueue();

  useEffect(() => { if (!folderId && folders[0]) setFolderId(folders[0].id); }, [folders, folderId]);
  useEffect(() => { if (!lists.some((l) => l.id === listId)) setListId(lists[0]?.id || ''); }, [lists, listId]);

  const folder = folders.find((f) => f.id === folderId);
  const list = lists.find((l) => l.id === listId);

  return (
    <div className="ignite">
      <Sidebar view={view} setView={setView} reviewCount={review.length} />
      <main className="ig-main">
        <header className="ig-top">
          <ProjectPicker folders={folders} lists={lists} folderId={folderId} listId={listId} setFolderId={setFolderId} setListId={setListId} />
          <button className="ig-btn" style={{ marginLeft: 'auto' }} onClick={() => setGuides(true)}>Brand Guidelines</button>
        </header>
        <div className="ig-scroll">
          {view === 'projects' && (list ? <ListCockpit key={list.id} list={list} onOpen={setTaskId} /> : <p className="ig-muted" style={{ paddingTop: 16 }}>Create a folder and list, or deploy a master template.</p>)}
          {view === 'templates' && <TemplatesView folders={folders} onDeployed={(l) => { setFolderId(l.folder_id); setListId(l.id); setView('projects'); }} />}
          {view === 'notifications' && <NotificationsView tasks={review} onOpen={setTaskId} />}
          {view === 'settings' && (
            <div style={{ display: 'grid', gap: 16, paddingTop: 16, maxWidth: 720 }}>
              {folder ? <FolderSettings key={folder.id} folder={folder} /> : <p className="ig-muted">Create a folder first.</p>}
              {list && <ListSettings key={list.id} list={list} />}
            </div>
          )}
        </div>
      </main>
      <GuidelinesPanel open={guides} folder={folder} onClose={() => setGuides(false)} />
      {taskId && <TaskModal taskId={taskId} onClose={() => setTaskId(null)} onOpen={setTaskId} />}
    </div>
  );
}