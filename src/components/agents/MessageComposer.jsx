import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Message input for the agent conversation. */
export default function MessageComposer({ onSend, busy, disabled }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text || busy || disabled) return;
    setValue('');
    onSend(text);
  };

  return (
    <div className="flex items-end gap-2 border-t border-border/60 pt-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={2}
        disabled={disabled}
        placeholder={
          disabled
            ? 'Start a curation draft to begin.'
            : 'Describe the project or the batch you want organized…'
        }
        className="admin-input resize-none"
      />
      <Button type="button" onClick={submit} disabled={busy || disabled || !value.trim()} className="btn-forge gap-2">
        <Send className="h-4 w-4" /> Send
      </Button>
    </div>
  );
}