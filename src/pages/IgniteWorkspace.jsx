import React, { useState } from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';
import '@/components/ignite/ignite.css';
import Sidebar from '@/components/ignite/Sidebar';
import GuidelinesPanel from '@/components/ignite/GuidelinesPanel';
import TaskModal from '@/components/ignite/TaskModal';
import { useFolders, useLists, useReviewQueue } from '@/components/ignite/useIgnite';

export default function IgniteWorkspace() {
  const clientMatch = useMatch('/ignite-os/clients/:clientId/*');
  const projectMatch = useMatch('/ignite-os/clients/:clientId/projects/:projectId');
  const clientId = clientMatch?.params.clientId;
  const projectId = projectMatch?.params.projectId;
  const [taskId, setTaskId] = useState(null);
  const [guides, setGuides] = useState(false);
  const { data: folders = [] } = useFolders();
  const { data: lists = [] } = useLists(clientId);
  const { data: review = [] } = useReviewQueue();
  const folder = folders.find((f) => f.id === clientId);
  const list = lists.find((l) => l.id === projectId);

  return (
    <div className="ignite">
      <Sidebar folders={folders} clientId={clientId} projectId={projectId} reviewCount={review.length} />
      <main className="ig-main">
        <header className="ig-top">
          <nav className="ig-crumbs" aria-label="Breadcrumb">
            <Link to="/ignite-os">Active Projects</Link>
            {folder && <><span>/</span><Link to={`/ignite-os/clients/${folder.id}`}>{folder.name}</Link></>}
            {folder && list && <><span>/</span><span className="ig-crumbnow">{list.name}</span></>}
          </nav>
          {folder && <button className="ig-btn" style={{ marginLeft: 'auto' }} onClick={() => setGuides(true)}>Brand Guidelines</button>}
        </header>
        <div className="ig-scroll">
          <Outlet context={{ openTask: setTaskId }} />
        </div>
      </main>
      <GuidelinesPanel open={guides} folder={folder} onClose={() => setGuides(false)} />
      {taskId && <TaskModal taskId={taskId} onClose={() => setTaskId(null)} onOpen={setTaskId} />}
    </div>
  );
}