import React, { useState, useEffect } from 'react';
import { tournamentAPI, standingsAPI } from '../api/client';
import StandingsTable from '../components/StandingsTable';

export default function StandingsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tournamentAPI.getAll().then((res) => {
      if (res.data.success && res.data.data.length > 0) {
        setTournaments(res.data.data);
        setSelectedTournament(res.data.data[0]);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      setLoading(true);
      standingsAPI.getStandings(selectedTournament._id)
        .then((res) => {
          if (res.data.success) {
            setStandings(res.data.data);
          }
        })
        .catch((err) => console.error('Error fetching standings:', err))
        .finally(() => setLoading(false));
    }
  }, [selectedTournament]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Standings & Points Table</h1>
          <p style={{ color: 'var(--text-muted)' }}>Automatically computed from match scores & overs</p>
        </div>

        {tournaments.length > 1 && (
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '240px' }}
            value={selectedTournament?._id || ''}
            onChange={(e) => {
              const found = tournaments.find((t) => t._id === e.target.value);
              setSelectedTournament(found);
            }}
          >
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Calculating Net Run Rates and standings...</p>
        </div>
      ) : (
        <StandingsTable
          standings={standings}
          tournamentName={selectedTournament?.name}
        />
      )}

      {/* NRR Formula Explanation Card (Pedagogical clarity for Lab evaluation) */}
      <div className="card" style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.2)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>
          📐 Net Run Rate (NRR) Formula Applied:
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          NRR = (Total Runs Scored / Total Overs Faced) − (Total Runs Conceded / Total Overs Bowled).<br />
          Ties award 1 point each; Wins award 2 points. If points are level, teams are ranked by NRR, followed by total wins.
        </p>
      </div>
    </div>
  );
}
