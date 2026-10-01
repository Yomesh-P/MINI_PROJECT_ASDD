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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: 0 }}>⚡ Live Match Scoring Console</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Innings {match.currentInnings}: {currentTeam?.name} ({currentScore.runs}/{currentScore.wickets} in {currentScore.overs} ov)
            </span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Quick Runs Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Standard Runs (Legal Deliveries):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
            {[0, 1, 2, 3, 4, 6].map((run) => (
              <button
                key={run}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: run === 4 ? 'rgba(59, 130, 246, 0.25)' : run === 6 ? 'rgba(245, 158, 11, 0.25)' : undefined,
                  borderColor: run === 4 ? 'var(--accent-sapphire)' : run === 6 ? 'var(--accent-gold)' : undefined,
                }}
                onClick={() => handleRecordBall(run)}
              >
                +{run}
              </button>
            ))}
          </div>
        </div>

        {/* Wickets & Extras Buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Dismissals & Extras:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              disabled={loading}
              className="btn btn-danger"
              style={{ justifyContent: 'center' }}
              onClick={() => handleRecordBall(0, true)}
            >
              🚨 Wicket!
            </button>
            <button
              disabled={loading}
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
              onClick={() => handleRecordBall(1, false, true, 'wide')}
            >
              Wide (+1)
            </button>
            <button
              disabled={loading}
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
              onClick={() => handleRecordBall(1, false, true, 'noBall')}
            >
              No Ball (+1)
            </button>
          </div>
        </div>

        {/* Innings & Match Actions */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          {match.currentInnings === 1 ? (
            <button disabled={loading} className="btn btn-primary" onClick={handleSwitchInnings}>
              Switch to 2nd Innings
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleCompleteMatch(match.teamA?._id, `${match.teamA?.shortName} won`)}
              >
                Declare {match.teamA?.shortName} Winner
              </button>
              <button
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1 }}
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
