import React from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { SERIES_COLORS, VISIBILITY_CATEGORIES } from '@/lib/visibility';

/**
 * Radar chart for visibility category scores.
 * series: [{ name, report }] — one entry per report/model source.
 */
export default function VisibilityRadarChart({ series, height = 320 }) {
  const safeSeries = (series || []).map((s, i) => ({ ...s, name: s.name || `Source ${i + 1}` }));
  const data = VISIBILITY_CATEGORIES.map((c) => {
    const row = { category: c.short };
    safeSeries.forEach((s) => {
      row[s.name] = s.report?.category_scores?.[c.key] ?? 0;
    });
    return row;
  });

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 20]} tick={false} axisLine={false} />
          {safeSeries.map((s, i) => (
            <Radar
              key={s.name}
              name={s.name}
              dataKey={s.name}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              fill={SERIES_COLORS[i % SERIES_COLORS.length]}
              fillOpacity={safeSeries.length > 1 ? 0.12 : 0.28}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}