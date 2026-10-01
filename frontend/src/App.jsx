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

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        background: 'rgba(11, 15, 25, 0.95)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Smart Cricket Tournament Tracker</strong> • TE AI & DS, Sem V
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
            <span>DevOps: Git • Docker • K3s • Jenkins • Ansible</span>
            <span>MLOps: FastAPI • MLflow • Apache Airflow</span>
            <span>Monitoring: Prometheus • Grafana</span>
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
