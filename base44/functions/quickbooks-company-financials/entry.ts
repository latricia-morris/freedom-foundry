import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Company financials from QuickBooks — pull only. Reads the Profit & Loss
// report for the last 12 months and returns monthly income, expenses, and
// net income in cents. Admin-only; used by the Financial Overview page.

function parseMoneyCents(text) {
  if (!text) return 0;
  const raw = String(text).trim();
  const negative = raw.startsWith('-') || (raw.startsWith('(') && raw.endsWith(')'));
  const clean = raw.replace(/[()$\s,]/g, '').replace(/^-/, '');
  const value = Number(clean);
  if (Number.isNaN(value)) return 0;
  return Math.round(Math.abs(value) * 100) * (negative ? -1 : 1);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const { accessToken, connectionConfig } = await svc.connectors.getConnection('quickbooks');
    const realmId = connectionConfig && connectionConfig.realmId;
    if (!realmId) {
      return Response.json({ error: 'QuickBooks connection is missing its company (realm) id.' }, { status: 400 });
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const params = new URLSearchParams({
      start_date: fmt(start),
      end_date: fmt(now),
      summarize_column_by: 'Month',
    });

    const res = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`QuickBooks P&L report failed (${res.status}): ${errText.slice(0, 200)}`);
    }
    const body = await res.json();

    const columnList = (body.Columns && body.Columns.Column) || [];
    const columns = columnList.map((c) => c.ColTitle).filter(Boolean);
    // QuickBooks appends a summary "Total" column — drop it so totals are not double-counted.
    if (columns.length && columns[columns.length - 1].toLowerCase() === 'total') columns.pop();
    const rows = (body.Rows && body.Rows.Row) || [];

    const lineValues = (needle) => {
      const row = rows.find((r) => {
        const summary = r.Summary && r.Summary.ColData;
        const first = (summary && summary[0] && summary[0].value) || '';
        return String(first).toLowerCase().includes(needle);
      });
      const cells = (row && row.Summary && row.Summary.ColData) || [];
      return cells.slice(1, columns.length + 1).map((c) => parseMoneyCents(c && c.value));
    };

    const income = lineValues('total income') .length ? lineValues('total income') : lineValues('income');
    const expenses = lineValues('total expenses').length ? lineValues('total expenses') : lineValues('expenses');
    const net = lineValues('net income');

    const months = columns.map((label, i) => ({
      label,
      income_cents: (income[i] || 0),
      expense_cents: (expenses[i] || 0),
      net_cents: net.length ? (net[i] || 0) : ((income[i] || 0) - (expenses[i] || 0)),
    }));

    const totals = months.reduce(
      (acc, m) => ({
        income_cents: acc.income_cents + m.income_cents,
        expense_cents: acc.expense_cents + m.expense_cents,
        net_cents: acc.net_cents + m.net_cents,
      }),
      { income_cents: 0, expense_cents: 0, net_cents: 0 }
    );

    return Response.json({
      months,
      totals,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('quickbooks-company-financials failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}