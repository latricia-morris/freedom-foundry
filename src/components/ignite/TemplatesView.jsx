import React from 'react';
import TemplateCard from './TemplateCard';
import { useTemplates } from './useIgnite';

export default function TemplatesView({ folders, onDeployed }) {
  const { data: templates = [], isPending } = useTemplates();
  return (
    <div style={{ paddingTop: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Master Brand Templates</h1>
      {isPending && <p className="ig-muted">Loading templates…</p>}
      {!isPending && !templates.length && <p className="ig-muted">No templates yet. Open any list and choose "Save Template".</p>}
      {templates.map((t) => <TemplateCard key={t.id} tpl={t} folders={folders} onDeployed={onDeployed} />)}
    </div>
  );
}