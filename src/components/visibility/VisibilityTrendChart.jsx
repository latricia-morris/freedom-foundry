import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Composite score over time across report snapshots (oldest to newest). */
export default function VisibilityTrendChart({ reports, height = 220 }) {
  const data = [...(reports || [])]
    .filter((r) => typeof r.composite_score === 'number')
    .sort((a, b) => String(a.report_date || '').localeCompare(String(b.report_date || '')))
    .map((r) => ({
      date: r.report_date ? new Date(r.report_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—',
      score: r.composite_score,
    }));

  if (data.length < 2) return null;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} stroke="hsl(var(--border))" />
          <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} stroke="hsl(var(--border))" />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 2,
              color: 'hsl(var(--popover-foreground))',
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="score" stroke="#d9622c" strokeWidth={2} dot={{ r: 4, fill: '#660000' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}