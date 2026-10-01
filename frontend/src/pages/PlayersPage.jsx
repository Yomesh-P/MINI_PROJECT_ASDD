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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Player Profiles & Form</h1>
          <p style={{ color: 'var(--text-muted)' }}>Career stats, Recharts form visualization, and AI performance predictions</p>
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '280px' }}
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
        <div className="bento-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading player statistics and form chart...</p>
        </div>
      ) : playerData && (
        <div>
          {/* Player Header Bento Card */}
          <div className="bento-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: 68,
                  height: 68,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {playerData.jerseyNumber || 18}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{playerData.name}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>🛡️ {playerData.teamId?.name}</span>
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

            {/* Career Metrics Bento Modules */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginTop: '1.75rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>MATCHES</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  {playerData.careerStats?.matches || 28}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>RUNS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                  {playerData.careerStats?.runs || 890}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>BATTING AVG</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  {playerData.careerStats?.battingAvg || 36.4}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>STRIKE RATE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-sapphire)', fontFamily: 'var(--font-heading)' }}>
                  {playerData.careerStats?.strikeRate || 142.1}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>WICKETS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)' }}>
                  {playerData.careerStats?.wickets || 12}
                </div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ECONOMY</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  {playerData.careerStats?.economyRate || 7.8}
                </div>
              </div>
            </div>
          </div>

          {/* ML Prediction Output */}
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
