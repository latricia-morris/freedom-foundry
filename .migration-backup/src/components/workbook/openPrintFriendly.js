// Opens a clean, printer-friendly window containing only the workbook
// questions (no fill-in fields), a reflection note, and a repeating footer
// with the workbook name, lesson, and freedomfoundry.vip.

export default function openPrintFriendly(workbook) {
  const pages = workbook.pages || [];

  const escape = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const pageBlocks = pages
    .map((page, idx) => {
      const fields = (page.fields || [])
        .map(
          (f) =>
            `<li>${escape(f.label)}${f.help_text ? ` <span class="hint">${escape(f.help_text)}</span>` : ''}</li>`
        )
        .join('');

      return `
        <section class="page-block">
          <h2>${idx + 1}. ${escape(page.title)}</h2>
          ${page.content ? `<p class="page-content">${escape(page.content)}</p>` : ''}
          ${fields ? `<ol class="questions">${fields}</ol>` : ''}
        </section>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escape(workbook.title)} — Printer-Friendly</title>
<style>
  @page {
    size: letter;
    margin: 0.75in 0.75in 1in 0.75in;
  }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1a1420;
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }
  .header { text-align: center; margin-bottom: 18px; }
  .header h1 {
    font-family: Georgia, serif;
    font-size: 22px;
    font-weight: 500;
    margin: 0 0 4px;
  }
  .header p { font-size: 12px; color: #6e1f24; margin: 0; letter-spacing: 0.04em; text-transform: uppercase; }
  .note {
    background: #f7f2ea;
    border: 1px solid rgba(15,15,26,0.08);
    border-left: 3px solid #b3232c;
    border-radius: 8px;
    padding: 14px 16px;
    margin: 0 0 24px;
    font-family: 'Helvetica', Arial, sans-serif;
    font-size: 12.5px;
    color: #2c2c33;
  }
  .note strong { color: #1a1420; font-weight: 600; }
  .page-block { margin-bottom: 22px; page-break-inside: avoid; }
  .page-block h2 {
    font-family: Georgia, serif;
    font-size: 15px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #6e1f24;
    margin: 0 0 8px;
    border-bottom: 1px solid rgba(15,15,26,0.1);
    padding-bottom: 4px;
  }
  .page-content { font-size: 13px; color: #2c2c33; margin: 0 0 10px; }
  .questions {
    list-style: none;
    counter-reset: q;
    padding: 0;
    margin: 0;
  }
  .questions li {
    counter-increment: q;
    position: relative;
    padding: 10px 0 10px 28px;
    font-size: 13px;
    color: #1a1420;
    border-bottom: 1px dashed rgba(15,15,26,0.12);
  }
  .questions li::before {
    content: counter(q) ".";
    position: absolute;
    left: 0;
    top: 10px;
    font-weight: 600;
    color: #b3232c;
  }
  .questions li .hint {
    display: block;
    font-size: 11px;
    color: #6b6b73;
    font-style: italic;
    margin-top: 2px;
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 0.75in 8px;
    font-family: 'Helvetica', Arial, sans-serif;
    font-size: 10px;
    color: #6b6b73;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(15,15,26,0.1);
    background: #fff;
  }
  @media print {
    .footer { position: fixed; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${escape(workbook.title)}</h1>
    <p>Freedom Foundry · Brand Power Moves</p>
  </div>
  <div class="note">
    <strong>Before you begin:</strong> Find somewhere quiet and just talk it out.
    Writing is good and helps if you like to, but if you don't, you can read the
    questions and answer out loud into a voice memo — then just grab the transcript.
  </div>
  ${pageBlocks}
  <div class="footer">
    <span>${escape(workbook.title)}</span>
    <span>freedomfoundry.vip</span>
  </div>
  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) {
    alert('Please allow pop-ups to open the printer-friendly version.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}