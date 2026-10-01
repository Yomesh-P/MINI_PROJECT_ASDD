import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LiveMatchesPage from './pages/LiveMatchesPage';
import StandingsPage from './pages/StandingsPage';
import TournamentsPage from './pages/TournamentsPage';
import PlayersPage from './pages/PlayersPage';
import PredictionsPage from './pages/PredictionsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

function MainApp() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'live' && <LiveMatchesPage onSelectPlayer={() => setActiveTab('players')} />}
        {activeTab === 'standings' && <StandingsPage />}
        {activeTab === 'tournaments' && <TournamentsPage />}
        {activeTab === 'players' && <PlayersPage />}
        {activeTab === 'predict' && <PredictionsPage />}
        {activeTab === 'admin' && <AdminPage onGoToLogin={() => setActiveTab('login')} />}
        {activeTab === 'login' && <LoginPage onLoginSuccess={() => setActiveTab('admin')} />}
      </main>

      <footer className="clay-footer">
        <div className="clay-footer-inner">
          <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🏏</span>
            <span><strong>Smart Cricket Tournament Tracker</strong> • White Claymorphism Edition</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.84rem', flexWrap: 'wrap' }}>
            <span>DevOps: Git • Docker • K3s • Jenkins • Ansible</span>
            <span>MLOps: FastAPI • MLflow • Airflow</span>
            <span>Metrics: Prometheus • Grafana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
