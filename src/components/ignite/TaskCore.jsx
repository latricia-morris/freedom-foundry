import React, { useState } from 'react';
import SubtaskList from './SubtaskList';
import TaskChat from './TaskChat';
import { useTaskUpdate } from './useIgnite';

export default function TaskCore({ task, siblings, onOpen }) {
  const update = useTaskUpdate();
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || '');
  return (
    <div className="ig-left">
      <span className="ig-label">Task title</span>
      <input className="ig-input ig-bigtitle" value={title} onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title.trim() && title !== task.title && update(task.id, { title: title.trim() })} />
      <span className="ig-label" style={{ marginTop: 14 }}>Description</span>
      <textarea className="ig-input" rows={4} value={desc} placeholder="Instructions for this task" onChange={(e) => setDesc(e.target.value)}
        onBlur={() => desc !== (task.description || '') && update(task.id, { description: desc })} />
      <SubtaskList task={task} />
      <TaskChat task={task} siblings={siblings} onOpen={onOpen} />
    </div>
  );
}