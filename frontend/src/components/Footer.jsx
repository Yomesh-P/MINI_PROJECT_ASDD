import React from 'react';

export default function Footer({ setActiveTab }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'live', label: '🔴 Live Scorecard' },
    { id: 'standings', label: '📊 NRR Standings' },
    { id: 'tournaments', label: '🏆 2026 Tournaments' },
    { id: 'players', label: '👤 Player Form' },
    { id: 'predict', label: '🤖 AI Win Predictor' },
    { id: 'admin', label: '⚙️ Scorer Console' },
  ];

  return (
    <footer className="sexy-clay-footer">
      <div className="sexy-clay-footer-card">
        {/* Top Bento Section */}
        <div className="footer-bento-grid">
          {/* Brand & Mission */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => { setActiveTab('live'); scrollToTop(); }}>
              <div className="footer-brand-icon">🏏</div>
              <div>
                <div className="footer-brand-title">Smart Cricket Tracker</div>
                <div className="footer-brand-subtitle">Tactile White Claymorphism • 2026 Edition</div>
              </div>
            </div>
            <p className="footer-description">
              Next-generation tournament intelligence platform delivering real-time ball-by-ball 
              precision telemetry, automated Net Run Rate computations, and predictive match analytics.
            </p>
            <div className="footer-live-badge">
              <span className="live-pulse-dot"></span>
              <span className="live-badge-text">2026 Tournament Season Active • Real-Time Engine</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col nav-col">
            <h4 className="footer-col-title">Tournament Hub</h4>
            <div className="footer-links-grid">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  className="footer-nav-pill"
                  onClick={() => {
                    setActiveTab(link.id);
                    scrollToTop();
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matchday Intelligence & Back to Top */}
          <div className="footer-col highlight-col">
            <h4 className="footer-col-title">Engine Features</h4>
            <div className="footer-features-list">
              <div className="footer-feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Sub-second Live Ball Sync</span>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon">📐</span>
                <span className="feature-text">Dynamic NRR Qualification Scenarios</span>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">AI Expected Runs & POM Forecast</span>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon">🛡️</span>
                <span className="feature-text">Verified Match Official Scorer Console</span>
              </div>
            </div>

            <button className="footer-scroll-top-btn" onClick={scrollToTop} title="Scroll to top of page">
              <span>Back to Top</span>
              <span className="scroll-arrow">↑</span>
            </button>
          </div>
        </div>

        {/* Tactile Divider */}
        <div className="footer-clay-divider"></div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2026 <strong>Smart Cricket Tournament Tracker</strong>. Crafted with precision for the 2026 Championship.
          </div>
          <div className="footer-status-tags">
            <span className="footer-tag">Official Match Engine</span>
            <span className="footer-tag">ICC Standard NRR Rules</span>
            <span className="footer-tag highlight">2026 Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
