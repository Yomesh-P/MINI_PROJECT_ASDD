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
              boxShadow: selectedDetails?.tournament?._id === t._id ? '0 0 0 3px rgba(5, 150, 105, 0.25), var(--clay-card-shadow-hover)' : undefined,
            }}
            onClick={() => handleSelectTournament(t._id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ background: 'var(--accent-emerald-clay)', color: 'var(--accent-emerald)', boxShadow: 'var(--accent-emerald-shadow)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800 }}>
                {t.format}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status: <strong style={{ color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>{t.status}</strong></span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{t.name}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>📍 {t.venue}</p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-faint)', fontWeight: 500 }}>
              Dates: {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {selectedDetails && (
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>
            Participating Teams ({selectedDetails.teams?.length || 0})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {selectedDetails.teams?.map((team) => (
              <div key={team._id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', background: 'var(--accent-sapphire-clay)', color: 'var(--accent-sapphire)', boxShadow: 'var(--accent-sapphire-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                    {team.shortName}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{team.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Captain: <strong>{team.captainName || 'TBD'}</strong></span>
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
