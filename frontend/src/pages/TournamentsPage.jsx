import React, { useState, useEffect } from 'react';
import { tournamentAPI } from '../api/client';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tournamentAPI.getAll().then(async (res) => {
      if (res.data.success) {
        setTournaments(res.data.data);
        if (res.data.data.length > 0) {
          const detailRes = await tournamentAPI.getById(res.data.data[0]._id);
          if (detailRes.data.success) {
            setSelectedDetails(detailRes.data.data);
          }
        }
      }
      setLoading(false);
    });
  }, []);

  const handleSelectTournament = async (id) => {
    setLoading(true);
    try {
      const res = await tournamentAPI.getById(id);
      if (res.data.success) {
        setSelectedDetails(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Tournaments & Clubs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Registered tournament leagues and participating squads</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {tournaments.map((t) => (
          <div
            key={t._id}
            className="card"
            style={{
              cursor: 'pointer',
              borderColor: selectedDetails?.tournament?._id === t._id ? 'var(--accent-emerald)' : undefined,
            }}
            onClick={() => handleSelectTournament(t._id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="live-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}>
                {t.format}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {t.status}</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>📍 {t.venue}</p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
              Dates: {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {selectedDetails && (
        <section>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
            Participating Teams ({selectedDetails.teams?.length || 0})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {selectedDetails.teams?.map((team) => (
              <div key={team._id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#60a5fa' }}>
                    {team.shortName}
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{team.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Captain: {team.captainName || 'TBD'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
