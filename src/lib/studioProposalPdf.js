import { jsPDF } from 'jspdf';
import { fmtMoney } from '@/lib/proposalFormat';
const titles = {overview:'Overview',project:'Your Project',timeline:'Timeline',investment:'Investment',agreement:'Agreement',accept:'Accept & Pay'};
export default function downloadStudioProposalPdf(proposal, installments = [], signed = false) {
  const doc = signed && proposal.signing?.snapshot ? { ...proposal.signing.snapshot,signing:proposal.signing,content_digest:proposal.content_digest } : proposal;
  const pdf = new jsPDF({unit:'pt',format:'a4'}), margin=48, width=pdf.internal.pageSize.getWidth()-96, height=pdf.internal.pageSize.getHeight();
  let y=margin;
  const text=(value,bold=false,size=10)=>{
    if(!value)return;pdf.setFont('helvetica',bold?'bold':'normal').setFontSize(size);
    const plain=String(value).replace(/\*\*/g,'').replace(/^#{1,6}\s/gm,'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)');
    for(const line of pdf.splitTextToSize(plain,width)){if(y>height-margin){pdf.addPage();y=margin;}pdf.text(line,margin,y);y+=size+5;}y+=8;
  };
  text(doc.title,true,20);text(`Prepared for ${doc.recipient?.full_name} | ${doc.recipient?.company_name || ''}`);
  text(`Ox & Iron, LLC | The Brand Revivalist | LaTricia Morris`);text(`Proposal version ${doc.version || 1} | Issued ${doc.issue_date} | Valid through ${doc.expiry_date || 'Not specified'}`);text(`Approved version reference: ${doc.content_digest || proposal.content_digest || 'Draft'}`);
  const s=doc.content.studio;
  for(const [section,title] of Object.entries(titles)){
    pdf.addPage();y=margin;text(title,true,17);
    (s.blocks || []).filter(b=>b.section===section&&b.visible!==false).forEach(b=>text(b.text));
    if(section==='overview')for(const p of s.presentation || [])if(p.visible!==false&&doc.sections_visible?.[p.id]!==false){text(p.title,true,13);text(p.body);Object.values(doc.media || {}).filter(a=>a.section===p.id).forEach(a=>text(`Presentation image: ${a.name}. ${a.alt || ''}`));}
    if(section==='project')for(const m of s.services || []){text(`${m.name} (${m.acceptance_mode==='future'?'Future engagement, separate acceptance':m.acceptance_mode==='optional_now'?'Optional, explicit selection required':'Included'})`,true);if(m.quantity!=null)text(`Quantity: ${m.quantity}. ${m.quantity_note || ''}`);if(m.revision_allowance)text(`Revisions: ${m.revision_allowance}`);if(m.dependencies?.length)text(`Dependencies: ${m.dependencies.join('; ')}`);}
    if(section==='timeline'){for(const p of doc.timeline?.phases || [])text(`${p.name}: ${p.action || ''}\n${p.timing_type || 'Estimated'}: ${p.timing || ''}\nDepends on: ${p.dependency || 'Not specified'}`);}
    if(section==='investment'){
      for(const i of doc.investment?.items || [])text(`${i.label}: ${fmtMoney(i.unit_price_cents || 0)}${i.billing_type==='monthly'?'/month':''}. ${i.acceptance_mode==='future'?'Not included in current agreement, deposit or invoice. Requires separate acceptance.':i.acceptance_mode==='optional_now'?'Included only if explicitly selected.':'Included.'}${i.months?` Term: ${i.months} months.`:''} ${i.billing_start || ''}`);
      for(const o of doc.investment?.schedule || [])text(`${o.label}: ${o.percent!=null?`${o.percent}%`:fmtMoney(o.amount_cents || 0)}. ${o.due_event || ''}`);
      if(signed){text(`Accepted total: ${fmtMoney(doc.signing.total_cents)}`,true);text(`Initial payment: ${fmtMoney(doc.signing.deposit_cents)}`);text('Accepted invoice lines',true);for(const line of doc.signing.lines || [])text(`${line.title} × ${line.quantity}: ${fmtMoney(line.line_total_cents)}`);}
    }
    if(section==='agreement'){text(`Agreement version: ${doc.agreement_version}`);for(const a of doc.agreement_sections || []){text(a.heading,true,12);(a.paragraphs || []).forEach(p=>text(p));}}
    if(section==='accept'&&signed){text(`Signed by ${doc.signing.signer_name} (${doc.signing.signer_email})`);text(`Signed at ${doc.signing.signed_at_utc}`);text(`Accepted proposal version ${doc.signing.proposal_version || doc.version}`);text(`Approved version digest ${doc.signing.approved_version_digest || doc.content_digest}`);text(`Acceptance digest ${doc.signing.content_digest}`);Object.values(doc.signing.consents || {}).filter(Boolean).forEach(c=>text(c));installments.forEach(i=>text(`${i.description}: ${fmtMoney(i.amount_cents)} (${i.status})`));}
  }
  const count=pdf.internal.getNumberOfPages();for(let n=1;n<=count;n++){pdf.setPage(n);pdf.setFontSize(8);pdf.text(`Proposal v${doc.version || 1} | ${n} of ${count}`,margin,height-24);}
  pdf.save(`${doc.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-v${doc.version || 1}${signed?'-signed':''}.pdf`);
}