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

import Footer from './components/Footer';

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

      <Footer setActiveTab={setActiveTab} />
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
