import React from 'react';

export default function LiveScorecard({ match, onOpenScorer, isAdmin }) {
  if (!match) return null;

  const { teamA, teamB, scoreA, scoreB, currentInnings, liveState, venue } = match;

  // Calculate run rates
  const oversCompletedA = scoreA.overs || 0.1;
  const currentRR_A = (scoreA.runs / oversCompletedA).toFixed(2);

  const oversCompletedB = scoreB.overs || 0.1;
  const currentRR_B = (scoreB.runs / oversCompletedB).toFixed(2);

  // Target equation in 2nd innings
  const target = scoreA.runs + 1;
  const runsNeeded = target - scoreB.runs;
  const ballsRemaining = Math.max(0, 120 - (scoreB.ballsLegal || 0));
  const reqRR = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : 0;

  const currentOverBalls = liveState?.currentOverBalls || [];

  const getBallClass = (ball) => {
    if (ball === '4') return 'ball-bubble ball-four';
    if (ball === '6') return 'ball-bubble ball-six';
    if (ball === 'W' || ball === 'w') return 'ball-bubble ball-wicket';
    return 'ball-bubble';
  };

  return (
    <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
      <div className="scorecard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="live-badge">
            <span className="live-dot"></span>
            LIVE MATCH
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {venue}</span>
        </div>

        {isAdmin && onOpenScorer && (
          <button className="btn btn-primary" onClick={() => onOpenScorer(match)}>
            ⚡ Admin Scoring Console
          </button>
        )}
      </div>

      <div className="match-teams-grid">
        {/* Team A */}
        <div className="team-score-block">
          <div className="team-short">{teamA?.shortName || 'TMA'}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            {teamA?.name}
          </div>
          <div className="team-runs-wickets">
            {scoreA.runs}/{scoreA.wickets}
          </div>
          <div className="team-overs">
            ({scoreA.overs} / 20 ov) • CRR: {currentRR_A}
          </div>
        </div>

        {/* VS Indicator */}
        <div style={{ textAlign: 'center' }}>
          <div className="vs-badge">VS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.5rem' }}>
            Innings {currentInnings}
          </div>
        </div>

        {/* Team B */}
        <div className="team-score-block" style={{ border: currentInnings === 2 ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)' }}>
          <div className="team-short">{teamB?.shortName || 'TMB'}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            {teamB?.name}
          </div>
          <div className="team-runs-wickets">
            {scoreB.runs}/{scoreB.wickets}
          </div>
          <div className="team-overs">
            ({scoreB.overs} / 20 ov) {currentInnings === 2 && `• CRR: ${currentRR_B}`}
          </div>
        </div>
      </div>

      {/* Target Equation Notice for Innings 2 */}
      {currentInnings === 2 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
        }}>
          <div>
            <strong>Equation:</strong> {teamB?.shortName} need <strong>{runsNeeded} runs</strong> in <strong>{ballsRemaining} balls</strong> to win.
          </div>
          <div>
            Target: <strong>{target}</strong> | Req RR: <strong style={{ color: 'var(--accent-gold)' }}>{reqRR}</strong>
          </div>
        </div>
      )}

      {/* Ball by Ball Timeline */}
      <div style={{ margin: '1rem 0' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          This Over (Balls):
        </div>
        <div className="over-balls-container">
          {currentOverBalls.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Starting new over...</span>
          ) : (
            currentOverBalls.map((ball, idx) => (
              <div key={idx} className={getBallClass(ball)}>
                {ball}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Batters & Bowler Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginTop: '1.25rem',
        background: 'rgba(0,0,0,0.2)',
        padding: '1rem',
        borderRadius: 'var(--radius-sm)',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>🏏 Active Batters</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>* {liveState?.strikerName || 'Striker'}</span>
            <span>{liveState?.strikerRuns || 0} ({liveState?.strikerBalls || 0})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{liveState?.nonStrikerName || 'Non-Striker'}</span>
            <span>{liveState?.nonStrikerRuns || 0} ({liveState?.nonStrikerBalls || 0})</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>🎯 Current Bowler</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>{liveState?.bowlerName || 'Bowler'}</span>
            <span>{liveState?.bowlerWickets || 0}/{liveState?.bowlerRuns || 0} ({liveState?.bowlerOvers || 0} ov)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
