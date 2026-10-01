import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export default function PlayerFormChart({ playerName, history = [], recentAverage = 0, careerStats = {} }) {
  if (!history || history.length === 0) {
    return (
      <div className="bento-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        No recent match performance data recorded for this player yet.
      </div>
    );
  }

  const chartData = history.map((item, idx) => ({
    name: `${item.matchNumber} vs ${item.opposition}`,
    runs: item.runs,
    strikeRate: Math.round(item.strikeRate || 0),
    ballsFaced: item.ballsFaced,
    wickets: item.wickets,
    average: recentAverage,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.15rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          fontSize: '0.88rem',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Runs: <strong>{data.runs}</strong> ({data.ballsFaced} balls)</div>
          <div style={{ color: 'var(--accent-sapphire)', fontWeight: 600 }}>Strike Rate: <strong>{data.strikeRate}</strong></div>
          {data.wickets > 0 && <div style={{ color: 'var(--accent-gold)' }}>Wickets: <strong>{data.wickets}</strong></div>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bento-card" style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
            Recent Form & Trajectory: <span style={{ color: 'var(--accent-emerald)' }}>{playerName}</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Last {history.length} matches performance visualization (Recharts Interactive)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right', background: 'var(--bg-subtle)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>5-Match Form Avg</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{recentAverage}</div>
          </div>
          <div style={{ textAlign: 'right', background: 'var(--bg-subtle)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Career Average</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>{careerStats.battingAvg || 34.2}</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} domain={[0, 'auto']} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--accent-sapphire)" fontSize={12} domain={[50, 240]} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar yAxisId="left" dataKey="runs" name="Runs Scored" fill="url(#emeraldLightGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            <Line yAxisId="right" type="monotone" dataKey="strikeRate" name="Strike Rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} />
            <Line yAxisId="left" type="monotone" dataKey="average" name="Rolling Avg" stroke="#d97706" strokeDasharray="4 4" strokeWidth={2} dot={false} />
            <defs>
              <linearGradient id="emeraldLightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
