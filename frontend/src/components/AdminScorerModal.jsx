import React, { useState } from 'react';
import { matchAPI } from '../api/client';

export default function AdminScorerModal({ match, onClose, onMatchUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!match) return null;

  const currentScore = match.currentInnings === 1 ? match.scoreA : match.scoreB;
  const currentTeam = match.currentInnings === 1 ? match.teamA : match.teamB;

  const handleRecordBall = async (runs, isWicket = false, isExtra = false, extraType = '') => {
    setLoading(true);
    setError('');
    try {
      let ballLabel = runs.toString();
      if (isWicket) ballLabel = 'W';
      if (extraType === 'wide') ballLabel = 'Wd';
      if (extraType === 'noBall') ballLabel = 'Nb';

      const res = await matchAPI.recordBall(match._id, {
        runs,
        isWicket,
        isExtra,
        extraType,
        ballOutcome: ballLabel,
      });

      if (res.data.success) {
        onMatchUpdated(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording score update');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchInnings = async () => {
    setLoading(true);
    try {
      const res = await matchAPI.updateScore(match._id, {
        currentInnings: 2,
        liveState: {
          currentOverBalls: [],
          recentBalls: [],
          strikerName: 'Opening Batter',
          strikerRuns: 0,
          strikerBalls: 0,
        },
      });
      if (res.data.success) onMatchUpdated(res.data.data);
    } catch (err) {
      setError('Failed to switch innings');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async (winnerId, winDesc) => {
    setLoading(true);
    try {
      const res = await matchAPI.updateScore(match._id, {
        status: 'completed',
        winner: winnerId,
        resultDescription: winDesc,
      });
      if (res.data.success) {
        onMatchUpdated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError('Failed to finalize match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>⚡ Live Match Scoring Console</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Innings {match.currentInnings}: <strong>{currentTeam?.name}</strong> ({currentScore.runs}/{currentScore.wickets} in {currentScore.overs} ov)
            </span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', borderRadius: 'var(--radius-full)' }} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-ruby-clay)', boxShadow: 'var(--accent-ruby-shadow)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', color: 'var(--accent-ruby)', fontSize: '0.88rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Quick Runs Buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Standard Runs (Legal Deliveries):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.65rem' }}>
            {[0, 1, 2, 3, 4, 6].map((run) => (
              <button
                key={run}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  fontFamily: 'var(--font-heading)',
                  padding: '0.75rem 0.25rem',
                  background: run === 4 ? 'var(--accent-sapphire-clay)' : run === 6 ? 'var(--accent-gold-clay)' : '#ffffff',
                  color: run === 4 ? 'var(--accent-sapphire)' : run === 6 ? 'var(--accent-gold)' : 'var(--text-main)',
                  boxShadow: run === 4 ? 'var(--accent-sapphire-shadow), var(--clay-tile-shadow)' : run === 6 ? 'var(--accent-gold-shadow), var(--clay-tile-shadow)' : 'var(--clay-button-secondary-shadow)',
                }}
                onClick={() => handleRecordBall(run)}
              >
                +{run}
              </button>
            ))}
          </div>
        </div>

        {/* Wickets & Extras Buttons */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Dismissals & Extras:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <button
              disabled={loading}
              className="btn btn-danger"
              style={{ justifyContent: 'center', fontWeight: 800 }}
              onClick={() => handleRecordBall(0, true)}
            >
              🚨 Wicket!
            </button>
            <button
              disabled={loading}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', fontWeight: 700 }}
              onClick={() => handleRecordBall(1, false, true, 'wide')}
            >
              Wide (+1)
            </button>
            <button
              disabled={loading}
              className="btn btn-secondary"
              style={{ justifyContent: 'center', fontWeight: 700 }}
              onClick={() => handleRecordBall(1, false, true, 'noBall')}
            >
              No Ball (+1)
            </button>
          </div>
        </div>

        {/* Innings & Match Actions */}
        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '0.85rem', flexWrap: 'wrap' }}>
          {match.currentInnings === 1 ? (
            <button disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSwitchInnings}>
              Switch to 2nd Innings
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleCompleteMatch(match.teamA?._id, `${match.teamA?.shortName} won`)}
              >
                Declare {match.teamA?.shortName} Winner
              </button>
              <button
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleCompleteMatch(match.teamB?._id, `${match.teamB?.shortName} won`)}
              >
                Declare {match.teamB?.shortName} Winner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
