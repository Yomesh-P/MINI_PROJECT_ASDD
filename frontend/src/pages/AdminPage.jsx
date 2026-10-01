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
      <div className="bento-card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Admin Authentication Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.92rem' }}>
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
        status: 'live',
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
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Tournament Operations & Admin</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Logged in as: <strong>{user?.name}</strong> ({user?.email} • {user?.role})
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Match Scoring Management */}
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Manage & Score Matches</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.map((m) => (
              <div key={m._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {m.teamA?.shortName} vs {m.teamB?.shortName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Status: <strong style={{ color: m.status === 'live' ? 'var(--accent-ruby)' : 'var(--accent-emerald)', textTransform: 'uppercase' }}>{m.status}</strong> • {m.venue}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    {m.scoreA?.runs}/{m.scoreA?.wickets} vs {m.scoreB?.runs}/{m.scoreB?.wickets}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
                  onClick={() => setScorerMatch(m)}
                >
                  ⚡ Score Match
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule New Match Form */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Schedule New Match</h2>

            {msg && (
              <div style={{
                background: msg.includes('successfully') ? 'var(--accent-emerald-clay)' : 'var(--accent-ruby-clay)',
                boxShadow: msg.includes('successfully') ? 'var(--accent-emerald-shadow)' : 'var(--accent-ruby-shadow)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.88rem',
                color: msg.includes('successfully') ? 'var(--accent-emerald)' : 'var(--accent-ruby)',
                fontWeight: 700,
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
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
