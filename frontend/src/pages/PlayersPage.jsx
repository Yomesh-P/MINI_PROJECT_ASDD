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
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  color: 'var(--accent-emerald)',
                  boxShadow: 'var(--clay-tile-shadow)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {playerData.jerseyNumber || 18}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.85rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{playerData.name}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>🛡️ {playerData.teamId?.name}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>🏏 {playerData.role}</span>
                    <span>•</span>
                    <span>Bat: <strong>{playerData.battingStyle}</strong></span>
                    {playerData.bowlingStyle !== 'none' && (
                      <>
                        <span>•</span>
                        <span>Bowl: <strong>{playerData.bowlingStyle}</strong></span>
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
              gap: '1.25rem',
              marginTop: '2rem',
              borderTop: '2px solid #f1f5f9',
              paddingTop: '1.75rem',
              textAlign: 'center',
            }}>
              <div style={{ background: '#ffffff', padding: '1.25rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>MATCHES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
                  {playerData.careerStats?.matches || 28}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.25rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>RUNS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
                  {playerData.careerStats?.runs || 890}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.25rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>BATTING AVG</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
                  {playerData.careerStats?.battingAvg || 36.4}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.25rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>STRIKE RATE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-sapphire)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
                  {playerData.careerStats?.strikeRate || 142.1}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.25rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>WICKETS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
                  {playerData.careerStats?.wickets || 12}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '1.25rem 1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ECONOMY</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
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
