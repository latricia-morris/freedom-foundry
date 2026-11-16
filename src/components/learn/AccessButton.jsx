import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { learnApi, money } from '@/lib/learn';

const CTA = 'btn-forge inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50';

/** Continue, start free, or buy: whichever applies to this learner and offering. */
export default function AccessButton({ offering, firstLessonId, onGranted }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const o = offering;

  if (o.has_access) {
    return firstLessonId
      ? <Link to={`/learn/${o.id}/${firstLessonId}`} className={CTA}>{o.kind === 'book' ? 'Start reading' : 'Start learning'} <ArrowRight className="h-4 w-4" /></Link>
      : !o.link_url ? null
        : o.link_url.startsWith('/')
          ? <Link to={o.link_url} className={CTA}>Open <ArrowRight className="h-4 w-4" /></Link>
          : <a href={o.link_url} target="_blank" rel="noopener noreferrer" className={CTA}>Open <ArrowRight className="h-4 w-4" /></a>;
  }
  if (!o.purchasable) return null;

  const enroll = async () => {
    setBusy(true);
    try {
      await learnApi('enroll', { offering_id: o.id });
      onGranted();
    } catch (e) {
      toast({ title: 'Could not start', description: e.response?.data?.error || e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const buy = async () => {
    // Checkout must open as its own page; when previewed in a frame, open the tab during the click.
    const framed = window.self !== window.top;
    const tab = framed ? window.open('', '_blank') : null;
    if (framed && !tab) {
      toast({ title: 'Allow popups to continue to checkout.', variant: 'destructive' });
      return;
    }
    if (tab) tab.opener = null;
    setBusy(true);
    try {
      const data = await learnApi('checkout', { offering_id: o.id });
      if (data.has_access) { tab?.close(); onGranted(); return; }
      if (tab) tab.location.replace(data.url);
      else window.location.assign(data.url);
    } catch (e) {
      tab?.close();
      toast({ title: 'Checkout could not start', description: e.response?.data?.error || e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" disabled={busy} onClick={o.is_free ? enroll : buy} className={CTA}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {o.is_free ? 'Start free' : `Get access · ${money(o.price_cents, o.currency)}`}
    </button>
  );
}