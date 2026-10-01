import React from 'react';

export default function StandingsTable({ standings = [], tournamentName = 'Mumbai Premier League 2025' }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Tournament Standings</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tournamentName} • Automatic NRR Calculation</p>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
          Top 2 Qualify for Finals
        </span>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Rank</th>
              <th>Team</th>
              <th style={{ textAlign: 'center' }}>P</th>
              <th style={{ textAlign: 'center' }}>W</th>
              <th style={{ textAlign: 'center' }}>L</th>
              <th style={{ textAlign: 'center' }}>T</th>
              <th style={{ textAlign: 'center' }}>Pts</th>
              <th style={{ textAlign: 'right' }}>Net Run Rate (NRR)</th>
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No standings data available yet. Complete matches to generate standings.
                </td>
              </tr>
            ) : (
              standings.map((team, idx) => (
                <tr key={team.teamId || idx}>
                  <td style={{ fontWeight: 700, color: idx < 2 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    #{team.rank || idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{team.teamName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>({team.shortName})</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{team.played}</td>
                  <td style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontWeight: 600 }}>{team.won}</td>
                  <td style={{ textAlign: 'center', color: '#f87171' }}>{team.lost}</td>
                  <td style={{ textAlign: 'center' }}>{team.tied}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
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
