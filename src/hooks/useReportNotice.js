import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const MAX_VIEWS = 2;

// One id per browser session, so reloading the dashboard does not count as another visit.
function sessionId() {
  let id = sessionStorage.getItem('ff-session-id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('ff-session-id', id);
  }
  return id;
}

/**
 * Whether the "report is ready" notice should show for this report. It shows in
 * at most two sessions, and never again once it is closed or the report is opened.
 */
export default function useReportNotice(key) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (!key) return undefined;
    let live = true;
    (async () => {
      const me = await base44.auth.me();
      const all = me.report_notices || {};
      const seen = all[key] || { views: 0 };
      if (seen.dismissed) return;
      const sid = sessionId();
      if (seen.session !== sid) {
        if (seen.views >= MAX_VIEWS) return;
        await base44.auth.updateMe({ report_notices: { ...all, [key]: { views: seen.views + 1, session: sid } } });
      }
      if (live) setVisible(true);
    })();
    return () => { live = false; };
  }, [key]);

  const dismiss = async () => {
    setVisible(false);
    const me = await base44.auth.me();
    const all = me.report_notices || {};
    await base44.auth.updateMe({ report_notices: { ...all, [key]: { ...all[key], dismissed: true } } });
  };

  return { visible, dismiss };
}