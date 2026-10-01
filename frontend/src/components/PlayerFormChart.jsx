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
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
        No recent match performance data recorded for this player yet.
      </div>
    );
  }

  // Format data for chart
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
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.85rem',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#fff' }}>{label}</div>
          <div style={{ color: 'var(--accent-emerald)' }}>Runs Scored: <strong>{data.runs}</strong> ({data.ballsFaced} balls)</div>
          <div style={{ color: 'var(--accent-sapphire)' }}>Strike Rate: <strong>{data.strikeRate}</strong></div>
          {data.wickets > 0 && <div style={{ color: 'var(--accent-gold)' }}>Wickets: <strong>{data.wickets}</strong></div>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>
            Recent Form & Trajectory: <span style={{ color: 'var(--accent-emerald)' }}>{playerName}</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Last {history.length} matches performance visualization (Recharts)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5-Match Form Avg</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{recentAverage}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Career Batting Avg</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{careerStats.battingAvg || 34.2}</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} domain={[0, 'auto']} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--accent-sapphire)" fontSize={12} domain={[50, 240]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar yAxisId="left" dataKey="runs" name="Runs Scored" fill="url(#emeraldGradient)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            <Line yAxisId="right" type="monotone" dataKey="strikeRate" name="Strike Rate" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} />
            <Line yAxisId="left" type="monotone" dataKey="average" name="Rolling Avg" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={false} />
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
