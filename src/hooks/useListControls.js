import { useState } from 'react';

/** Sort / filter / active-only controls for a list view, persisted for the browser session. */
export function useListControls(storageKey, defaults) {
  const [controls, setControls] = useState(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || 'null');
      return { ...defaults, ...(saved || {}) };
    } catch {
      return { ...defaults };
    }
  });

  const patchControls = (next) => setControls((prev) => {
    const merged = { ...prev, ...next };
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {
      // session storage unavailable — keep in-memory state only
    }
    return merged;
  });

  return [controls, patchControls];
}