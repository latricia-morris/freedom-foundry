import React from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const BAR_COLORS = ['#b3232c', '#d9622c', '#f0d9b5', '#8f9aa6'];

/** Pulls numeric follower counts out of "724 followers, 766 posts" style strings. */
function followerRows(channels) {
  return (channels || [])
    .map((c) => {
      const match = String(c.followers || '').match(/([\d,]+)\s*followers?/i);
      if (!match) return null;
      return { name: c.platform, count: Number(match[1].replace(/,/g, '')) };
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count);
}

/**
 * Compact audience chart: where the brand's social accounts actually sit,
 * drawn from the follower counts captured on the report.
 */
export default function SocialReachChart({ channels }) {
  const rows = followerRows(channels);
  if (rows.length < 2) return null;

  return (
    <div className="mb-4 h-44 w-full">
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 44, bottom: 0, left: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={175}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            stroke="hsl(var(--border))"
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} followers`, 'Audience']}
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 2,
              color: 'hsl(var(--popover-foreground))',
              fontSize: 12,
            }}
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={18}>
            {rows.map((r, i) => (
              <Cell key={r.name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              formatter={(v) => Number(v).toLocaleString()}
              style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}