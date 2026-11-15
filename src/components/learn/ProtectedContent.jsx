import React, { useEffect, useState } from 'react';

const BLOCKED_KEYS = ['c', 'x', 'a', 's', 'p', 'u'];
const stop = (e) => e.preventDefault();

/**
 * Wraps reading content with copy deterrents: no selection, right-click, copy,
 * drag, save, print or view-source shortcuts, and the text veils itself when
 * the window loses focus or a capture shortcut is pressed. No visible mark.
 */
export default function ProtectedContent({ children, className = '' }) {
  const [veiled, setVeiled] = useState(false);

  useEffect(() => {
    let timer;
    const veilBriefly = () => {
      setVeiled(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVeiled(!document.hasFocus()), 1500);
    };
    const onKey = (e) => {
      const key = (e.key || '').toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (key === 'printscreen' || (e.metaKey && e.shiftKey)) {
        navigator.clipboard?.writeText('').catch(() => {});
        veilBriefly();
      }
      if (key === 'f12' || (mod && BLOCKED_KEYS.includes(key)) || (mod && e.shiftKey && ['i', 'j', 'c'].includes(key))) {
        const el = e.target;
        const typing = el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
        if (!typing || !['c', 'x', 'a'].includes(key) || e.shiftKey) e.preventDefault();
      }
    };
    const onBlur = () => setVeiled(true);
    const onFocus = () => setVeiled(false);
    const onVisibility = () => setVeiled(document.hidden);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div
      className={`learn-protected ${veiled ? 'learn-protected--veiled' : ''} ${className}`}
      onContextMenu={stop} onCopy={stop} onCut={stop} onDragStart={stop}
    >
      {children}
    </div>
  );
}