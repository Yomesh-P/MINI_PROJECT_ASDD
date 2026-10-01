import React, { useState, useEffect } from 'react';
import { playerAPI, predictAPI } from '../api/client';
import PlayerFormChart from '../components/PlayerFormChart';
import MLPredictionCard from '../components/MLPredictionCard';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    playerAPI.getAll().then((res) => {
      if (res.data.success && res.data.data.length > 0) {
        setPlayers(res.data.data);
        setSelectedPlayerId(res.data.data[0]._id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedPlayerId) {
      setLoading(true);
      setPredictionData(null);
      Promise.all([
        playerAPI.getById(selectedPlayerId),
        playerAPI.getForm(selectedPlayerId, 5),
      ])
        .then(([playerRes, formRes]) => {
          if (playerRes.data.success) setPlayerData(playerRes.data.data);
          if (formRes.data.success) setFormData(formRes.data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedPlayerId]);

  const handleGeneratePrediction = async () => {
    if (!selectedPlayerId) return;
    setPredictLoading(true);
    try {
      const res = await predictAPI.getPlayerPrediction(selectedPlayerId, {
        venue: 'Wankhede Stadium, Mumbai',
      });
      if (res.data.success) {
        setPredictionData(res.data.data);
      }
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Player Profiles & Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Career stats, Recharts form visualization, and AI performance predictions</p>
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '260px' }}
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
        >
          {players.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.teamId?.shortName || 'Team'} - {p.role})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading player statistics and match log...</p>
        </div>
      ) : playerData && (
        <div>
          {/* Player Header Card */}
          <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(22, 30, 49, 0.9), rgba(15, 23, 42, 0.9))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--accent-emerald), #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: '#fff',
                }}>
                  {playerData.jerseyNumber || 18}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{playerData.name}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>🛡️ {playerData.teamId?.name}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>🏏 {playerData.role}</span>
                    <span>•</span>
                    <span>Bat: {playerData.battingStyle}</span>
                    {playerData.bowlingStyle !== 'none' && (
                      <>
                        <span>•</span>
                        <span>Bowl: {playerData.bowlingStyle}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleGeneratePrediction}
                disabled={predictLoading}
              >
                {predictLoading ? 'Computing Model...' : '🤖 Predict Next Match (FastAPI ML)'}
              </button>
            </div>

            {/* Career Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.25rem',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MATCHES</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{playerData.careerStats?.matches || 28}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RUNS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {playerData.careerStats?.runs || 890}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BATTING AVG</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{playerData.careerStats?.battingAvg || 36.4}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STRIKE RATE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-sapphire)' }}>
                  {playerData.careerStats?.strikeRate || 142.1}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WICKETS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {playerData.careerStats?.wickets || 12}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ECONOMY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{playerData.careerStats?.economyRate || 7.8}</div>
              </div>
            </div>
          </div>

          {/* ML Prediction Output (if triggered) */}
          <MLPredictionCard
            playerName={playerData.name}
            predictionData={predictionData}
            loading={predictLoading}
          />

          {/* Recharts Form Chart */}
          <PlayerFormChart
            playerName={playerData.name}
            history={formData?.history || []}
            recentAverage={formData?.recentAverage || 0}
            careerStats={playerData.careerStats || {}}
          />
        </div>
      )}
    </div>
  );
}
