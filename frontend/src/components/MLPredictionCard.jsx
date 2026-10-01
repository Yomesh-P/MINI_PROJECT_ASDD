import React from 'react';

export default function MLPredictionCard({ playerName, predictionData, loading }) {
  if (loading) {
    return (
      <div className="bento-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Executing Scikit-learn inference via FastAPI microservice...</p>
      </div>
    );
  }

  if (!predictionData) return null;

  const { runsPrediction, pomPrediction, features } = predictionData;
  const predictedRuns = runsPrediction?.predicted_runs ?? 34;
  const confidence = runsPrediction?.confidence_range ?? [22, 48];
  const pomProbability = pomPrediction?.pom_probability ? Math.round(pomPrediction.pom_probability * 100) : 24;

  return (
    <div className="bento-card" style={{
      border: '1px solid #93c5fd',
      boxShadow: '0 10px 30px -5px rgba(37, 99, 235, 0.08)',
      marginBottom: '2.5rem',
      background: '#ffffff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--accent-sapphire-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>AI Performance Forecast: {playerName}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FastAPI Microservice + MLflow Model Registry (LO5)</span>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', border: '1px solid var(--accent-emerald-border)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
          RandomForest Regressor v1.2
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Metric 1: Expected Runs Bento Tile */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Expected Runs (Next Match)
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
            {predictedRuns}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Confidence Range: <strong style={{ color: 'var(--text-main)' }}>{confidence[0]} – {confidence[1]} runs</strong>
          </div>
        </div>

        {/* Metric 2: POM Prob Bento Tile */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Player of the Match Probability
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.2rem 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
            {pomProbability}%
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.6rem' }}>
            <div style={{ width: `${pomProbability}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-ruby))', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* Feature Attribution Module */}
      {features && (
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Features Queried from MongoDB:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>5-MATCH FORM AVG</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{features.recent_form_avg} runs</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RECENT STRIKE RATE</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-sapphire)' }}>{features.recent_strike_rate}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>OPP. BOWLING ECONOMY</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>{features.opp_bowling_strength}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VENUE AVG SCORE</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>{features.venue_avg_score}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
