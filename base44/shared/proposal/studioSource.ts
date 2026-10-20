// Attach explicit service/price meaning to every source passage without rewriting it.
export function annotateStudioSource(doc) {
  const s = doc.content.studio, items = doc.investment.items || [];
  let inherited = '';
  s.blocks = s.blocks.map(block => {
    const raw = block.source || block.text, heading = /^#{1,6}\s/.test(raw);
    if (heading) {
      const item = items.find(i => {
        const dollar = `$${(i.unit_price_cents/100).toLocaleString('en-US',{maximumFractionDigits:2})}`;
        return raw.includes(dollar) && /phase|package|option|engagement/i.test(raw);
      });
      inherited = item?.acceptance_mode || '';
    }
    const associated = s.services.filter(m => (m.source_ids || []).includes(block.id) || m.id === block.service_id);
    const mode = associated.some(m=>m.acceptance_mode==='future') && !associated.some(m=>m.acceptance_mode==='included') ? 'future' : inherited || associated[0]?.acceptance_mode || '';
    return { ...block, acceptance_mode: block.layer === 'agency' ? '' : mode };
  });
  return doc;
}