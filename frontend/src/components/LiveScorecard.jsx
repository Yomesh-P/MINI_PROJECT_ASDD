import React from 'react';

export default function LiveScorecard({ match, onOpenScorer, isAdmin }) {
  if (!match) return null;

  const { teamA, teamB, scoreA, scoreB, currentInnings, liveState, venue } = match;

  const oversCompletedA = scoreA.overs || 0.1;
  const currentRR_A = (scoreA.runs / oversCompletedA).toFixed(2);

  const oversCompletedB = scoreB.overs || 0.1;
  const currentRR_B = (scoreB.runs / oversCompletedB).toFixed(2);

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
    <div className="bento-card" style={{ marginBottom: '2.5rem' }}>
      <div className="scorecard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="live-badge">
            <span className="live-dot"></span>
            LIVE MATCH
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            📍 {venue}
          </span>
        </div>

        {isAdmin && onOpenScorer && (
          <button className="btn btn-primary" onClick={() => onOpenScorer(match)}>
            ⚡ Open Scorer Console
          </button>
        )}
      </div>

      <div className="match-teams-grid">
        {/* Team A */}
        <div className="team-score-block">
          <div className="team-short">{teamA?.shortName || 'TMA'}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            {teamA?.name}
          </div>
          <div className="team-runs-wickets">
            {scoreA.runs}/{scoreA.wickets}
          </div>
          <div className="team-overs">
            ({scoreA.overs} / 20 ov) • CRR: <strong>{currentRR_A}</strong>
          </div>
        </div>

        {/* VS Indicator */}
        <div style={{ textAlign: 'center' }}>
          <div className="vs-badge">VS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Innings {currentInnings}
          </div>
        </div>

        {/* Team B */}
        <div
          className="team-score-block"
          style={{
            boxShadow: currentInnings === 2 ? '0 0 0 3px rgba(5, 150, 105, 0.2), var(--clay-tile-shadow)' : 'var(--clay-tile-shadow)',
          }}
        >
          <div className="team-short">{teamB?.shortName || 'TMB'}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
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
          background: '#ffffff',
          boxShadow: 'var(--clay-tile-shadow)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.92rem',
          color: 'var(--text-main)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ background: 'var(--accent-emerald-clay)', color: 'var(--accent-emerald)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.75rem' }}>TARGET</span>
            <span>{teamB?.shortName} need <strong style={{ color: 'var(--accent-emerald)' }}>{runsNeeded} runs</strong> in <strong>{ballsRemaining} balls</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.88rem' }}>
            <span>Target: <strong>{target}</strong></span>
            <span>Req RR: <strong style={{ color: 'var(--accent-gold)' }}>{reqRR}</strong></span>
          </div>
        </div>
      )}

      {/* Ball by Ball Timeline */}
      <div style={{ margin: '1.25rem 0' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 700, letterSpacing: '0.04em' }}>
          Current Over Timeline:
        </div>
        <div className="over-balls-container">
          {currentOverBalls.length === 0 ? (
            <span style={{ fontSize: '0.88rem', color: 'var(--text-faint)' }}>Starting new over...</span>
          ) : (
            currentOverBalls.map((ball, idx) => (
              <div key={idx} className={getBallClass(ball)}>
                {ball}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Batters & Bowler Bento Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.5rem',
      }}>
        <div style={{
          background: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--clay-tile-shadow)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
            🏏 Active Batters
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', fontWeight: 600 }}>
            <span>* {liveState?.strikerName || 'Striker'}</span>
            <span style={{ color: 'var(--accent-emerald)' }}>{liveState?.strikerRuns || 0} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({liveState?.strikerBalls || 0})</span></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            <span>{liveState?.nonStrikerName || 'Non-Striker'}</span>
            <span>{liveState?.nonStrikerRuns || 0} ({liveState?.nonStrikerBalls || 0})</span>
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--clay-tile-shadow)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
            🎯 Current Bowler
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', fontWeight: 600 }}>
            <span>{liveState?.bowlerName || 'Bowler'}</span>
            <span style={{ color: 'var(--accent-sapphire)' }}>{liveState?.bowlerWickets || 0} / {liveState?.bowlerRuns || 0}</span>
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Overs Bowled: <strong>{liveState?.bowlerOvers || 0} ov</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
