import React from 'react';

export default function QuickStats({ liveCount = 1, teamsCount = 4, matchesCount = 6 }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--accent-ruby-light)', color: 'var(--accent-ruby)' }}>
          🏏
        </div>
        <div>
          <div className="stat-val">{liveCount} Live</div>
          <div className="stat-label">Matches Active</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
          🏆
        </div>
        <div>
          <div className="stat-val">{teamsCount} Teams</div>
          <div className="stat-label">Registered Clubs</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--accent-sapphire-light)', color: 'var(--accent-sapphire)' }}>
          🤖
        </div>
        <div>
          <div className="stat-val">RandomForest</div>
          <div className="stat-label">MLflow Production v1.2</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
          ⚡
        </div>
        <div>
          <div className="stat-val">Airflow DAG</div>
          <div className="stat-label">Weekly Auto-Retrain</div>
        </div>
      </div>
    </div>
  );
}
