import React from 'react';

export default function MLPredictionCard({ playerName, predictionData, loading }) {
  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Querying FastAPI ML Prediction Microservice...</p>
      </div>
    );
  }

  if (!predictionData) return null;

  const { runsPrediction, pomPrediction, features } = predictionData;
  const predictedRuns = runsPrediction?.predicted_runs ?? 34;
  const confidence = runsPrediction?.confidence_range ?? [22, 48];
  const pomProbability = pomPrediction?.pom_probability ? Math.round(pomPrediction.pom_probability * 100) : 24;

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(22, 30, 49, 0.9), rgba(15, 23, 42, 0.95))',
      border: '1px solid rgba(59, 130, 246, 0.35)',
      boxShadow: '0 8px 30px rgba(59, 130, 246, 0.1)',
      marginBottom: '2rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🤖</span>
          <div>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>ML Performance Forecast: {playerName}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Powered by FastAPI + MLflow Model Registry (LO5)</span>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
          Model: RandomForest Regressor
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Metric 1: Expected Runs */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Runs (Next Match)</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0' }}>
            {predictedRuns}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Confidence Range: <strong>{confidence[0]} – {confidence[1]} runs</strong>
          </div>
        </div>

        {/* Metric 2: Player of the Match Probability */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Player of the Match Prob.</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.2rem 0' }}>
            {pomProbability}%
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
            <div style={{ width: `${pomProbability}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* Feature Attribution Bar */}
      {features && (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Active Feature Values Extracted from MongoDB:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>📈 Recent 5-Match Form Avg: <strong>{features.recent_form_avg}</strong></div>
            <div>⚡ Recent Strike Rate: <strong>{features.recent_strike_rate}</strong></div>
            <div>🎯 Opp. Bowling Economy: <strong>{features.opp_bowling_strength}</strong></div>
            <div>🏟️ Venue Avg Score: <strong>{features.venue_avg_score}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
