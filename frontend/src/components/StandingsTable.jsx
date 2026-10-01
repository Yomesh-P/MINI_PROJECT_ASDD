import React from 'react';

export default function StandingsTable({ standings = [], tournamentName = 'Mumbai Premier League 2026' }) {
  return (
    <div className="bento-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Official Standings & Table</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{tournamentName} • Dynamic Net Run Rate (NRR) Engine</p>
        </div>
        <span style={{ fontSize: '0.78rem', background: 'var(--accent-sapphire-clay)', color: 'var(--accent-sapphire)', boxShadow: 'var(--accent-sapphire-shadow)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 800 }}>
          Top 2 Advance to Championship Final
        </span>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '65px' }}>Rank</th>
              <th>Club</th>
              <th style={{ textAlign: 'center' }}>P</th>
              <th style={{ textAlign: 'center' }}>W</th>
              <th style={{ textAlign: 'center' }}>L</th>
              <th style={{ textAlign: 'center' }}>T</th>
              <th style={{ textAlign: 'center' }}>Points</th>
              <th style={{ textAlign: 'right' }}>Net Run Rate (NRR)</th>
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No standings data available yet. Complete matches to generate live standings.
                </td>
              </tr>
            ) : (
              standings.map((team, idx) => (
                <tr key={team.teamId || idx}>
                  <td style={{ fontWeight: 800, color: idx < 2 ? 'var(--accent-emerald)' : 'var(--text-muted)', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
                    #{team.rank || idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>{team.teamName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#ffffff', boxShadow: 'var(--clay-sphere-shadow)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        {team.shortName}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{team.played}</td>
                  <td style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontWeight: 700 }}>{team.won}</td>
                  <td style={{ textAlign: 'center', color: 'var(--accent-ruby)', fontWeight: 600 }}>{team.lost}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{team.tied}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    {team.points}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`nrr-badge ${team.nrr >= 0 ? 'nrr-positive' : 'nrr-negative'}`}>
                      {team.nrr >= 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
