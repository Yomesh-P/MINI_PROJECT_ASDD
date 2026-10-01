import React, { useState, useEffect } from 'react';
import { matchAPI } from '../api/client';
import LiveScorecard from '../components/LiveScorecard';
import QuickStats from '../components/QuickStats';
import AdminScorerModal from '../components/AdminScorerModal';
import { useAuth } from '../context/AuthContext';

export default function LiveMatchesPage({ onSelectPlayer }) {
  const [liveMatches, setLiveMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scorerMatch, setScorerMatch] = useState(null);
  const { isAdmin } = useAuth();

  const fetchMatches = async () => {
    try {
      const [liveRes, allRes] = await Promise.all([
        matchAPI.getLive(),
        matchAPI.getAll(),
      ]);

      if (liveRes.data.success) {
        setLiveMatches(liveRes.data.data);
      }
      if (allRes.data.success) {
        setAllMatches(allRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 4000);
    return () => clearInterval(interval);
  }, []);

  const completedMatches = allMatches.filter((m) => m.status === 'completed');
  const upcomingMatches = allMatches.filter((m) => m.status === 'upcoming');

  return (
    <div>
      {/* Hero Bento Banner */}
      <section className="hero-bento">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', boxShadow: 'var(--clay-sphere-shadow)', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            <span>⚡ Automated DevOps & MLOps Lifecycle</span>
          </div>
          <h1 className="hero-title">
            Smart Cricket <span>Tournament Tracker</span>
          </h1>
          <p className="hero-subtitle">
            Real-time ball-by-ball scorecards, dynamic Net Run Rate (NRR) standings,
            and machine learning player forecasts delivered via an automated DevOps pipeline.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ background: '#ffffff', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
              2025
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '0.04em' }}>
              T20 Championship
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bento Row */}
      <QuickStats liveCount={liveMatches.length} />

      {/* Live Match Center Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>Live Score Center</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: '#ffffff', boxShadow: 'var(--clay-sphere-shadow)', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            Auto-polling every 4s
          </span>
        </div>

        {liveMatches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>☕</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No Matches Currently Live</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Check scheduled upcoming fixtures below or review completed scorecards.
            </p>
          </div>
        ) : (
          liveMatches.map((m) => (
            <LiveScorecard
              key={m._id}
              match={m}
              isAdmin={isAdmin}
              onOpenScorer={(match) => setScorerMatch(match)}
            />
          ))
        )}
      </section>

      {/* Completed Matches Bento Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Completed Matches & Results</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {completedMatches.map((m) => (
            <div key={m._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 500 }}>
                  <span>📅 {new Date(m.date).toLocaleDateString()}</span>
                  <span>📍 {m.venue}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', padding: '0.75rem 1.1rem', background: m.winner?._id === m.teamA?._id ? 'var(--accent-emerald-clay)' : '#ffffff', boxShadow: 'var(--clay-sphere-shadow)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>{m.teamA?.shortName || 'TMA'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: m.winner?._id === m.teamA?._id ? 'var(--accent-emerald)' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {m.scoreA?.runs}/{m.scoreA?.wickets} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>({m.scoreA?.overs} ov)</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0.75rem 1.1rem', background: m.winner?._id === m.teamB?._id ? 'var(--accent-emerald-clay)' : '#ffffff', boxShadow: 'var(--clay-sphere-shadow)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>{m.teamB?.shortName || 'TMB'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: m.winner?._id === m.teamB?._id ? 'var(--accent-emerald)' : 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {m.scoreB?.runs}/{m.scoreB?.wickets} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>({m.scoreB?.overs} ov)</span>
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>🏆 {m.resultDescription}</span>
                {m.playerOfMatch && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Player of the Match: <strong style={{ color: 'var(--text-main)' }}>{m.playerOfMatch.name}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Fixtures Section */}
      {upcomingMatches.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Upcoming Match Fixtures</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {upcomingMatches.map((m) => (
              <div key={m._id} className="bento-card">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Scheduled: <strong>{new Date(m.date).toLocaleDateString()}</strong> • 📍 {m.venue}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '1.25rem 0' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)' }}>{m.teamA?.name}</span>
                  <span className="vs-badge">VS</span>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)' }}>{m.teamB?.name}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--accent-sapphire)', fontWeight: 600 }}>
                  Format: T20 (20 Overs Per Side)
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Admin Scorer Modal */}
      {scorerMatch && (
        <AdminScorerModal
          match={scorerMatch}
          onClose={() => setScorerMatch(null)}
          onMatchUpdated={(updated) => {
            setScorerMatch(updated);
            fetchMatches();
          }}
        />
      )}
    </div>
  );
}
