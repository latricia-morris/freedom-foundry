import React, { useEffect, useState } from 'react';
import {
  ChevronRight, Download, File as FileIcon, Folder, FolderOpen,
  Image as ImageIcon, Loader2, RefreshCw, X,
} from 'lucide-react';
import apiClient from '@/api/client';

function formatBytes(value) {
  if (!value || value <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function iconFor(mimeType = '') {
  return mimeType.startsWith('image/') ? ImageIcon : FileIcon;
}

export default function DriveBrowser({ rootFolderId, rootFolderName = 'Brand Files', title, admin = false, onSelectFolder = null }) {
  const [stack, setStack] = useState([{ id: rootFolderId, name: rootFolderName }]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [busyId, setBusyId] = useState('');

  const current = stack[stack.length - 1];

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.drive.browse(current.id);
      setData(res);
    } catch (err) {
      setError(err?.message || 'The folder could not be opened.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [current.id]);

  const openFile = async (file) => {
    if (busyId) return;
    setBusyId(file.id);
    setError('');
    try {
      const res = await apiClient.drive.getFile(file.id);
      const loaded = res.file;
      const isImage = (loaded.mimeType || '').startsWith('image/');
      const isPdf = loaded.mimeType === 'application/pdf';
      if (isImage || isPdf) {
        setPreview({ ...loaded, kind: isImage ? 'image' : 'pdf' });
      } else {
        const link = document.createElement('a');
        link.href = loaded.dataUrl;
        link.download = loaded.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setError(err?.message || 'The file could not be opened.');
    } finally {
      setBusyId('');
    }
  };

  const downloadPreview = () => {
    if (!preview) return;
    const link = document.createElement('a');
    link.href = preview.dataUrl;
    link.download = preview.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const folders = (data?.files || []).filter((f) => f.isFolder);
  const files = (data?.files || []).filter((f) => !f.isFolder);

  return (
    <div className="dashboard-card border border-border overflow-hidden">
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="font-heading text-lg text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 px-5 py-3 border-b border-border overflow-x-auto text-sm">
        {stack.map((folder, index) => (
          <span key={`${folder.id}-${index}`} className="flex items-center gap-1 shrink-0">
            {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <button
              type="button"
              onClick={() => setStack(stack.slice(0, index + 1))}
              className={index === stack.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground transition-colors'}
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Opening folder...
          </div>
        ) : error ? (
          <div className="py-8 px-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button type="button" onClick={load} className="mt-3 text-xs uppercase tracking-wider text-[#8a482d]">Try again</button>
          </div>
        ) : folders.length + files.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">This folder is empty.</p>
        ) : (
          <div className="divide-y divide-border/40">
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center gap-3 py-2.5">
                <Folder className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                <button
                  type="button"
                  onClick={() => setStack([...stack, { id: folder.id, name: folder.name }])}
                  className="flex-1 min-w-0 text-left text-sm text-foreground hover:text-primary transition-colors truncate"
                >
                  {folder.name}
                </button>
                {onSelectFolder && (
                  <button
                    type="button"
                    onClick={() => onSelectFolder({ id: folder.id, name: folder.name })}
                    className="text-[10px] uppercase tracking-wider text-[#8a482d] border border-[#b3232c]/30 rounded-sm px-2.5 py-1 hover:bg-[#b3232c]/10 transition-colors shrink-0"
                  >
                    Select
                  </button>
                )}
              </div>
            ))}
            {files.map((file) => {
              const Icon = iconFor(file.mimeType);
              return (
                <button
                  type="button"
                  key={file.id}
                  onClick={() => openFile(file)}
                  disabled={busyId === file.id}
                  className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-accent/40 transition-colors disabled:opacity-60"
                >
                  {busyId === file.id
                    ? <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                    : <Icon className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />}
                  <span className="flex-1 min-w-0 text-sm text-foreground truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {preview && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-medium text-foreground truncate">{preview.name}</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={downloadPreview}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#8a482d]"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button type="button" onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {preview.kind === 'image' ? (
            <img src={preview.dataUrl} alt={preview.name} className="max-h-[420px] w-auto mx-auto rounded-md" />
          ) : (
            <iframe src={preview.dataUrl} title={preview.name} className="w-full h-[420px] rounded-md bg-white" />
          )}
        </div>
      )}
    </div>
  );
}