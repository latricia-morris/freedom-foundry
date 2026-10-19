import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export const ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv';
export default function useRequestFiles() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const add = async (list) => {
    if (lock.current) return;
    setError('');
    if (files.length + list.length > 2) { setError('You can attach up to two files. Remove one before choosing a replacement.'); return; }
    lock.current = true; setUploading(true);
    try {
      for (const file of list) {
        if (!ACCEPT.split(',').includes(`.${file.name.split('.').pop().toLowerCase()}`)) { setError(`${file.name}: unsupported type. Choose one of the types listed above.`); continue; }
        if (file.size > 10 * 1024 * 1024) { setError(`${file.name}: the limit is 10 MB per file.`); continue; }
        const key = crypto.randomUUID();
        setFiles((current) => [...current, { key, name: file.name, status: 'Uploading…' }]);
        try {
          const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
          setFiles((current) => current.map((item) => item.key === key ? { ...item, status: 'Validating…' } : item));
          const { data } = await base44.functions.invoke('scan-upload', { file_uri, filename: file.name });
          if (!data.ok) throw new Error(data.reason || 'The file could not be validated.');
          setFiles((current) => current.map((item) => item.key === key ? { ...item, file_uri, status: 'Uploaded privately' } : item));
        } catch (failure) {
          setFiles((current) => current.filter((item) => item.key !== key));
          setError(`${file.name}: ${failure.message || 'Upload failed. Please try again.'}`);
        }
      }
    } finally { lock.current = false; setUploading(false); }
  };
  return { files, uploading, error, add, remove: (key) => setFiles((current) => current.filter((item) => item.key !== key)) };
}