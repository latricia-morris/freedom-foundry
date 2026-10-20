import { jsPDF } from "jspdf";
import { fmtMoney, fmtDate } from "@/lib/proposalFormat";
import { AGENCY } from "@/lib/proposalAgencyClient";
import downloadStudioProposalPdf from '@/lib/studioProposalPdf';

/**
 * Text-based agreement PDF: selectable text, wrapped paragraphs, page numbers,
 * and intentional section breaks. Renders from the frozen published snapshot,
 * never from live library records. When signed, includes the signature block
 * and a signing-record appendix.
 */
export function downloadProposalPdf(doc, installments = [], signed = false) {
  if (doc.content?.studio?.schema_version === 2) return downloadStudioProposalPdf(doc, installments, signed);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (needed) => {
    if (y + needed > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };
  const heading = (text, size = 14) => {
    ensure(size + 20);
    pdf.setFont("helvetica", "bold").setFontSize(size);
    const lines = pdf.splitTextToSize(text, maxW);
    pdf.text(lines, margin, y);
    y += lines.length * (size + 4) + 6;
  };
  const para = (text, size = 10.5, gap = 8) => {
    if (!text) return;
    pdf.setFont("helvetica", "normal").setFontSize(size);
    const lines = pdf.splitTextToSize(String(text), maxW);
    for (const line of lines) {
      ensure(size + 6);
      pdf.text(line, margin, y);
      y += size + 3;
    }
    y += gap;
  };
  const bullet = (text) => {
    pdf.setFont("helvetica", "normal").setFontSize(10.5);
    const lines = pdf.splitTextToSize(String(text), maxW - 14);
    lines.forEach((line, i) => {
      ensure(16);
      pdf.text(i === 0 ? `- ${line}` : `  ${line}`, margin, y);
      y += 14;
    });
    y += 4;
  };

  // Cover
  pdf.setFont("times", "bold").setFontSize(22);
  y += 40;
  pdf.text(doc.title || "Client proposal", margin, y);
  y += 30;
  pdf.setFont("helvetica", "normal").setFontSize(11);
  para(`${AGENCY.presentation_brand} | ${AGENCY.representative}`);
  const r = doc.recipient || {};
  para(`Prepared for: ${r.is_individual ? r.full_name : r.company_name || r.full_name}`);
  if (!r.is_individual && r.full_name) para(`Recipient: ${r.full_name}`);
  para(`Issued: ${fmtDate(doc.issue_date)}`);
  para(`Valid through: ${fmtDate(doc.expiry_date)}`);
  para(`Contracting party: ${r.contracting_party_name || ""}`);
  y += 6;

  // Your Project
  pdf.addPage(); y = margin;
  heading("Your Project");
  const project = doc.content?.project || {};
  para(project.context, 10.5, 10);
  (project.goals || []).forEach((g) => bullet(g));
  for (const m of project.modules || []) {
    heading(m.name, 12);
    para(m.objective);
    (m.deliverables || []).forEach((d) => bullet(d));
    if (m.quantity_note) para(`Quantities: ${m.quantity_note}`, 10);
    if (m.revision_allowance) para(`Revisions: ${m.revision_allowance}`, 10);
    if (m.dependencies?.length) para(`Dependencies: ${m.dependencies.join("; ")}`, 10);
  }
  if (project.not_included?.length) {
    heading("Not included", 12);
    project.not_included.forEach((x) => bullet(x));
  }

  // Timeline
  pdf.addPage(); y = margin;
  heading("Timeline (Estimated)");
  para("The following sequence shows the anticipated work, review points, and payment milestones. Timelines are estimates and depend on start conditions, scope, and timely access, materials, feedback, and approvals.");
  for (const p of doc.timeline?.phases || []) {
    bullet(`${p.name}: ${p.action || ""} (${p.timing || ""})${p.dependency ? `. Depends on: ${p.dependency}` : ""}`);
  }
  heading("Payment milestones", 12);
  for (const m of doc.timeline?.milestones || []) bullet(`${m.description}: ${m.due_event || ""}`);

  // Investment
  pdf.addPage(); y = margin;
  heading("Investment");
  const inv = doc.investment || {};
  for (const item of inv.items || []) {
    const qty = item.quantity_default || 1;
    const price = item.unit_price_cents || 0;
    bullet(`${item.label}${qty > 1 ? ` x ${qty}` : ""}: ${fmtMoney(price * qty)}`);
    if (item.description) para(item.description, 9.5, 4);
  }
  for (const c of inv.credits || []) bullet(`Credit: ${c.label}: -${fmtMoney(c.amount_cents || 0)}`);
  y += 4;
  if (inv.mode === "monthly" && inv.monthly) {
    para(`Monthly payment: ${fmtMoney(inv.monthly.amount_cents || 0)}`);
    para(`Number of months: ${inv.monthly.months}`);
    para(`Total commitment: ${fmtMoney((inv.monthly.amount_cents || 0) * (inv.monthly.months || 0))}`);
    para(`Billing start condition: ${inv.monthly.billing_start || ""}`);
  } else {
    for (const s of inv.schedule || []) bullet(`${s.label}: ${s.percent}% of project fee. ${s.due_event || ""}`);
  }
  const snap = doc.signing || {};
  if (snap.total_cents) para(`Accepted total: ${fmtMoney(snap.total_cents)}`);
  if (snap.deposit_cents) para(`Due upon acceptance: ${fmtMoney(snap.deposit_cents)}`);

  // Agreement
  pdf.addPage(); y = margin;
  heading("Terms & Policies");
  para(`Agreement version: ${doc.agreement_version || ""}`);
  para("The accepted Statement of Work (Your Project, Timeline, and Investment above) forms part of this Agreement.");
  for (const section of doc.agreement_sections || []) {
    heading(section.heading, 11.5);
    (section.paragraphs || []).forEach((p) => para(p, 10, 6));
  }

  // Signature + records
  if (signed && snap.signer_name) {
    pdf.addPage(); y = margin;
    heading("Acceptance");
    para(`Signed by: ${snap.signer_name}`);
    if (snap.signer_title) para(`Title or role: ${snap.signer_title}`);
    if (snap.signer_company) para(`Company: ${snap.signer_company}`);
    para(`Email: ${snap.signer_email}`);
    para(`Electronically signed: ${snap.signed_at_utc || doc.signed_at || ""}`);
    para(`Consent records: ${snap.consents_version || ""}`);
    para(`Content digest: ${snap.content_digest || doc.content_digest || ""}`);
    para(`Proposal version: ${doc.version || 1}`);
    heading("Payment record", 12);
    for (const inst of installments) {
      bullet(`${inst.description || inst.installment_type}: ${fmtMoney(inst.amount_cents)} (${inst.status})`);
    }
  }

  // Page numbers
  const total = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal").setFontSize(9);
    pdf.text(`${i} of ${total}`, pageW / 2 - 12, pageH - 30);
  }

  pdf.save(`${(doc.title || "proposal").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}${signed ? "-signed" : ""}.pdf`);
}