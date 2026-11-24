// Agency-side brand portal preview. The previewed client id lives in session
// storage only: it is a UI mode, never client data, and it ends with the tab.
const PREVIEW_KEY = 'ff-portal-preview-client';

export function getPreviewClientId() {
  try {
    return window.sessionStorage.getItem(PREVIEW_KEY) || '';
  } catch {
    return '';
  }
}

export function startPortalPreview(clientId) {
  try {
    window.sessionStorage.setItem(PREVIEW_KEY, clientId);
  } catch {
    /* storage blocked — preview simply won't persist across navigation */
  }
}

export function endPortalPreview() {
  try {
    window.sessionStorage.removeItem(PREVIEW_KEY);
  } catch {
    /* nothing to clear */
  }
}