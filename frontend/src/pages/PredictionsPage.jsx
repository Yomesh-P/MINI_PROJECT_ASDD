import React, { useState, useEffect } from 'react';
import { playerAPI, tournamentAPI, predictAPI } from '../api/client';
import MLPredictionCard from '../components/MLPredictionCard';

export default function PredictionsPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedOpposition, setSelectedOpposition] = useState('');
  const [venue, setVenue] = useState('Wankhede Stadium, Mumbai');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([playerAPI.getAll(), tournamentAPI.getAll()]).then(([pRes, tRes]) => {
      if (pRes.data.success && pRes.data.data.length > 0) {
        setPlayers(pRes.data.data);
        setSelectedPlayer(pRes.data.data[0]._id);
      }
      if (tRes.data.success && tRes.data.data.length > 0) {
        tournamentAPI.getById(tRes.data.data[0]._id).then((detail) => {
          if (detail.data.success) {
            setTeams(detail.data.data.teams);
            if (detail.data.data.teams.length > 1) {
              setSelectedOpposition(detail.data.data.teams[1]._id);
            }
          }
        });
      }
    });
  }, []);

  const handleRunPrediction = async (e) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    setLoading(true);
    try {
      const res = await predictAPI.getPlayerPrediction(selectedPlayer, {
        oppositionTeamId: selectedOpposition,
        venue,
      });
      if (res.data.success) {
        setPredictionData(res.data.data);
      }
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentPlayerObj = players.find((p) => p._id === selectedPlayer);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>AI Match Performance Predictor</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          MLOps-driven forecasting: Scikit-learn Random Forest model tracked via MLflow & retrained weekly via Apache Airflow
        </p>
      </div>

      <div className="bento-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Simulation Parameters</h3>
        <form onSubmit={handleRunPrediction}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div className="form-group">
              <label className="form-label">Select Player / Batter</label>
              <select
                className="form-select"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                {players.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Opposition Bowling Team</label>
              <select
                className="form-select"
                value={selectedOpposition}
                onChange={(e) => setSelectedOpposition(e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Match Venue Condition</label>
              <select
                className="form-select"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              >
                <option value="Wankhede Stadium, Mumbai">Wankhede Stadium (Batting Paradise)</option>
                <option value="DY Patil Stadium, Navi Mumbai">DY Patil Stadium (Balanced Pace)</option>
                <option value="Brabourne Stadium, Mumbai">Brabourne Stadium (High Scoring)</option>
                <option value="Eden Gardens, Kolkata">Eden Gardens (Spin Friendly)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Running Inference...' : '🚀 Generate Prediction (FastAPI ML Service)'}
          </button>
        </form>
      </div>

      {predictionData && (
        <MLPredictionCard
          playerName={currentPlayerObj?.name || 'Selected Batter'}
          predictionData={predictionData}
          loading={loading}
        />
      )}

      {/* MLOps Architecture Explanatory Callout */}
      <div className="bento-card" style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-sapphire)', marginBottom: '0.65rem' }}>
          🧠 How This Model Operates (LO5 Architecture):
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          1. The Node.js Express backend extracts a rolling 5-match history from <code>PlayerMatchStat</code> along with opposition bowling economy and venue score indices.<br />
          2. The payload is sent via HTTP POST to the Python FastAPI microservice (<code>/predict/runs</code> and <code>/predict/pom</code>).<br />
          3. FastAPI evaluates the feature vector using a RandomForest Regressor and Classifier loaded directly from the MLflow Model Registry.<br />
          4. An Apache Airflow DAG runs weekly to retrain and promote models whose validation MAE improves over the production champion.
        </p>
      </div>
    </div>
  );
}
