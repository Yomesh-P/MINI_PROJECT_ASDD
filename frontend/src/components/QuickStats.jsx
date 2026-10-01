import React from 'react';

export default function QuickStats({ liveCount = 1, teamsCount = 4, matchesCount = 6 }) {
  return (
    <div className="stats-grid">
      <div className="card stat-card">
        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
          🏏
        </div>
        <div>
          <div className="stat-val">{liveCount} Active</div>
          <div className="stat-label">Live Matches In Progress</div>
        </div>
      </div>

      <div className="card stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          🏆
        </div>
        <div>
          <div className="stat-val">{teamsCount} Clubs</div>
          <div className="stat-label">Registered Teams</div>
        </div>
      </div>

      <div className="card stat-card">
        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          🤖
        </div>
        <div>
          <div className="stat-val">RandomForest v1.2</div>
          <div className="stat-label">MLflow Registered Model</div>
        </div>
      </div>

      <div className="card stat-card">
        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
          ⚡
        </div>
        <div>
          <div className="stat-val">Airflow Weekly</div>
          <div className="stat-label">Automated Retraining DAG</div>
        </div>
      </div>
    </div>
  );
}
