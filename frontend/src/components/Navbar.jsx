import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'live', label: '🔴 Live Matches' },
    { id: 'standings', label: '📊 Standings' },
    { id: 'tournaments', label: '🏆 Tournaments' },
    { id: 'players', label: '👤 Players & Form' },
    { id: 'predict', label: '🤖 ML Predictions' },
    { id: 'admin', label: '⚙️ Admin Console' },
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-brand" onClick={() => setActiveTab('live')}>
          <span>🏏 Smart Cricket Tracker</span>
          <span className="nav-brand-badge">DevOps & MLOps</span>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                👤 {user?.name || user?.email}
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="nav-auth-btn"
              onClick={() => setActiveTab('login')}
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
