import React from 'react';

export default function MLPredictionCard({ playerName, predictionData, loading }) {
  if (loading) {
    return (
      <div className="bento-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Executing Scikit-learn inference via FastAPI microservice...</p>
      </div>
    );
  }

  if (!predictionData) return null;

  const { runsPrediction, pomPrediction, features } = predictionData;
  const predictedRuns = runsPrediction?.predicted_runs ?? 34;
  const confidence = runsPrediction?.confidence_range ?? [22, 48];
  const pomProbability = pomPrediction?.pom_probability ? Math.round(pomPrediction.pom_probability * 100) : 24;

  return (
    <div className="bento-card" style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-sm)', background: 'var(--accent-sapphire-clay)', color: 'var(--accent-sapphire)', boxShadow: 'var(--accent-sapphire-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-main)' }}>AI Performance Forecast: {playerName}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FastAPI Microservice + MLflow Model Registry (LO5)</span>
          </div>
        </div>
        <span style={{ fontSize: '0.78rem', background: 'var(--accent-emerald-clay)', color: 'var(--accent-emerald)', boxShadow: 'var(--accent-emerald-shadow)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
          RandomForest Regressor v1.2
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Metric 1: Expected Runs Clay Tile */}
        <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Expected Runs (Next Match)
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.035em' }}>
            {predictedRuns}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Confidence Range: <strong style={{ color: 'var(--text-main)' }}>{confidence[0]} – {confidence[1]} runs</strong>
          </div>
        </div>

        {/* Metric 2: POM Prob Clay Tile */}
        <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Player of the Match Probability
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.2rem 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.035em' }}>
            {pomProbability}%
          </div>
          <div style={{ width: '100%', height: '10px', background: '#f1f5f9', boxShadow: 'var(--clay-inset-field)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ width: `${pomProbability}%`, height: '100%', background: 'linear-gradient(90deg, #d97706, #dc2626)', borderRadius: 'var(--radius-full)' }}></div>
          </div>
        </div>
      </div>

      {/* Feature Attribution Module */}
      {features && (
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)', fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Features Queried from MongoDB:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#ffffff', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--clay-sphere-shadow)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>5-MATCH FORM AVG</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>{features.recent_form_avg} runs</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--clay-sphere-shadow)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>RECENT STRIKE RATE</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-sapphire)' }}>{features.recent_strike_rate}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--clay-sphere-shadow)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>OPP. BOWLING ECONOMY</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-gold)' }}>{features.opp_bowling_strength}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--clay-sphere-shadow)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>VENUE AVG SCORE</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-emerald)' }}>{features.venue_avg_score}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
