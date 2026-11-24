import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isValidScore, SERIES_COLORS, VISIBILITY_CATEGORIES, reportSeries } from '@/lib/visibility';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';

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
      row[s.key] = isValidScore(raw, 0, c.max) ? raw : null;
    });
    return row;
  });

  return (
    <div className="w-full min-w-0">
      {series.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {series.map((s, i) => (
            <span key={s.key} className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                aria-hidden="true"
              />
              <ProviderIcon label={s.label} size="sm" />
              <span>{s.isBaseline ? `${s.label} · baseline` : s.label}</span>
            </span>
          ))}
        </div>
      )}
      <div style={{ height }} className="w-full min-w-0">
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
                dot={{ r: 3.5, strokeWidth: 0, fill: color }}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}