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
    // Auto-polling interval: 4 seconds for real-time live match updates (FR-9)
    const interval = setInterval(fetchMatches, 4000);
    return () => clearInterval(interval);
  }, []);

  const completedMatches = allMatches.filter((m) => m.status === 'completed');
  const upcomingMatches = allMatches.filter((m) => m.status === 'upcoming');

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <h1 className="hero-title">Smart Cricket Tournament Tracker</h1>
        <p className="hero-subtitle">
          Real-time ball-by-ball scorecards, automated Net Run Rate (NRR) standings,
          and Machine Learning player performance predictions powered by an automated DevOps lifecycle.
        </p>
      </section>

      {/* Quick Stats Bar */}
      <QuickStats liveCount={liveMatches.length} />

      {/* Live Match Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Live Score Center</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-refreshing every 4s</span>
        </div>

        {liveMatches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>☕</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No Matches Currently Live</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Check the upcoming fixtures below or browse completed match scorecards.
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

      {/* Completed Matches Recap */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Completed Matches & Results</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {completedMatches.map((m) => (
            <div key={m._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  <span>{new Date(m.date).toLocaleDateString()}</span>
                  <span>📍 {m.venue}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{m.teamA?.shortName || 'TMA'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: m.winner?._id === m.teamA?._id ? 'var(--accent-emerald)' : '#fff' }}>
                    {m.scoreA?.runs}/{m.scoreA?.wickets} ({m.scoreA?.overs} ov)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{m.teamB?.shortName || 'TMB'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: m.winner?._id === m.teamB?._id ? 'var(--accent-emerald)' : '#fff' }}>
                    {m.scoreB?.runs}/{m.scoreB?.wickets} ({m.scoreB?.overs} ov)
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>🏆 {m.resultDescription}</span>
                {m.playerOfMatch && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Player of the Match: <strong>{m.playerOfMatch.name}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Fixtures */}
      {upcomingMatches.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Upcoming Fixtures</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {upcomingMatches.map((m) => (
              <div key={m._id} className="card">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Scheduled: {new Date(m.date).toLocaleDateString()} • {m.venue}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '1rem 0' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{m.teamA?.name}</span>
                  <span className="vs-badge">VS</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{m.teamB?.name}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-sapphire)' }}>
                  Format: T20 (20 Overs)
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
