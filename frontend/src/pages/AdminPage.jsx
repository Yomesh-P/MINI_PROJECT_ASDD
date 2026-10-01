import React, { useState, useEffect } from 'react';
import { tournamentAPI, matchAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdminScorerModal from '../components/AdminScorerModal';

export default function AdminPage({ onGoToLogin }) {
  const { isAuthenticated, user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [scorerMatch, setScorerMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // New match form state
  const [selectedTournament, setSelectedTournament] = useState('');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState('Wankhede Stadium, Mumbai');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        tournamentAPI.getAll(),
        matchAPI.getAll(),
      ]);
      if (tRes.data.success && tRes.data.data.length > 0) {
        setTournaments(tRes.data.data);
        setSelectedTournament(tRes.data.data[0]._id);
        const detail = await tournamentAPI.getById(tRes.data.data[0]._id);
        if (detail.data.success) {
          setTeams(detail.data.data.teams);
          if (detail.data.data.teams.length >= 2) {
            setTeamA(detail.data.data.teams[0]._id);
            setTeamB(detail.data.data.teams[1]._id);
          }
        }
      }
      if (mRes.data.success) {
        setMatches(mRes.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Admin Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          You must be logged in as a tournament administrator to access match scheduling and live scoring controls.
        </p>
        <button className="btn btn-primary" onClick={onGoToLogin}>
          Proceed to Admin Login
        </button>
      </div>
    );
  }

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (teamA === teamB) {
      setMsg('Team A and Team B cannot be the same');
      return;
    }
    try {
      const res = await matchAPI.create({
        tournamentId: selectedTournament,
        teamA,
        teamB,
        date: new Date(matchDate),
        venue,
        status: 'live', // Start as live for immediate testability!
      });
      if (res.data.success) {
        setMsg('Match created successfully! Set to LIVE status.');
        loadData();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error creating match');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Tournament Admin & Operations</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Logged in as: <strong>{user?.name}</strong> ({user?.email} • {user?.role})
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Match Scoring Management */}
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Manage & Score Matches</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.map((m) => (
              <div key={m._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {m.teamA?.shortName} vs {m.teamB?.shortName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status: <strong style={{ color: m.status === 'live' ? 'var(--accent-ruby)' : 'var(--text-main)', textTransform: 'uppercase' }}>{m.status}</strong> • {m.venue}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                    {m.scoreA?.runs}/{m.scoreA?.wickets} vs {m.scoreB?.runs}/{m.scoreB?.wickets}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                  onClick={() => setScorerMatch(m)}
                >
                  ⚡ Open Scorer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule New Match Form */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Schedule New Match</h2>

            {msg && (
              <div style={{
                background: msg.includes('successfully') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${msg.includes('successfully') ? 'var(--accent-emerald)' : 'var(--accent-ruby)'}`,
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}>
                {msg}
              </div>
            )}

            <form onSubmit={handleCreateMatch}>
              <div className="form-group">
                <label className="form-label">Tournament</label>
                <select
                  className="form-select"
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                >
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team A</label>
                <select className="form-select" value={teamA} onChange={(e) => setTeamA(e.target.value)}>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team B</label>
                <select className="form-select" value={teamB} onChange={(e) => setTeamB(e.target.value)}>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Match Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="form-input"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Schedule & Launch Match
              </button>
            </form>
          </div>
        </div>
      </div>

      {scorerMatch && (
        <AdminScorerModal
          match={scorerMatch}
          onClose={() => setScorerMatch(null)}
          onMatchUpdated={(updated) => {
            setScorerMatch(updated);
            loadData();
          }}
        />
      )}
    </div>
  );
}
