import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SERIES_COLORS, VISIBILITY_CATEGORIES, reportSeries } from '@/lib/visibility';

/**
 * Model comparison chart: score scale on the left axis, scored dimensions
 * across the bottom, one colored line per loaded report so scoring patterns
 * from different sources compare directly. The baseline report renders dashed.
 */
export default function VisibilityComparisonChart({ reports, height = 340 }) {
  const series = reportSeries(reports);
  const data = VISIBILITY_CATEGORIES.map((c) => {
    const row = { dimension: c.short };
    series.forEach((s) => {
      const raw = s.report?.category_scores?.[c.key];
      row[s.key] = typeof raw === 'number' ? raw : null;
    });
    return row;
  });

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="dimension"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            stroke="hsl(var(--border))"
            interval={0}
          />
          <YAxis
            domain={[0, 20]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            stroke="hsl(var(--border))"
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 2,
              color: 'hsl(var(--popover-foreground))',
              fontSize: 12,
            }}
            labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="line" />
          {series.map((s, i) => {
            const color = SERIES_COLORS[i % SERIES_COLORS.length];
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.isBaseline ? `${s.label} · baseline` : s.label}
                type="monotone"
                stroke={color}
                strokeWidth={2}
                strokeDasharray={s.isBaseline ? '6 4' : undefined}
                connectNulls
                dot={{ r: 3.5, strokeWidth: 0, fill: color }}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}