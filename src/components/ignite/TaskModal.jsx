import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import TaskCore from './TaskCore';
import TaskMatrix from './TaskMatrix';
import { useTasks } from './useIgnite';
import { E } from './igniteApi';

export default function TaskModal({ taskId, onClose, onOpen }) {
  const { data: task } = useQuery({ queryKey: ['ig-task', taskId], queryFn: () => E.IgniteTask.get(taskId) });
  const { data: list } = useQuery({ queryKey: ['ig-list', task?.list_id], queryFn: () => E.IgniteList.get(task.list_id), enabled: !!task });
  const { data: folder } = useQuery({ queryKey: ['ig-folder', list?.folder_id], queryFn: () => E.IgniteFolder.get(list.folder_id), enabled: !!list?.folder_id });
  const { data: siblings = [] } = useTasks(task?.list_id);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ig-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ig-modal" role="dialog" aria-modal="true">
        <div className="ig-top" style={{ padding: '10px 18px' }}>
          <button className="ig-btn" onClick={onClose} aria-label="Close"><X size={14} /></button>
          <span className="ig-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Task Detail Window: {[folder?.name, list?.name, task?.phase].filter(Boolean).join(' > ')}
          </span>
        </div>
        {!task ? <p className="ig-muted" style={{ padding: 18 }}>Loading task…</p> : (
          <div className="ig-modalbody">
            <TaskCore key={task.id} task={task} siblings={siblings} onOpen={onOpen} />
            <TaskMatrix task={task} />
          </div>
        )}
      </div>
    </div>
  );
}