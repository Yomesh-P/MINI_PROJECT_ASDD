import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@cricket.org');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3.5rem auto' }}>
      <div className="bento-card" style={{ padding: '2.75rem 2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-clay)', color: 'var(--accent-emerald)', boxShadow: 'var(--accent-emerald-shadow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', marginBottom: '1.25rem' }}>
            🏏
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Admin Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Tournament Scorer & Management Console (JWT Authenticated)
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-ruby-clay)', boxShadow: 'var(--accent-ruby-shadow)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', color: 'var(--accent-ruby)', fontSize: '0.88rem', fontWeight: 700 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.9rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--clay-tile-shadow)', border: '1px solid rgba(255, 255, 255, 0.95)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.04em' }}>Demo Admin Credentials:</div>
          <div style={{ marginTop: '0.2rem' }}>Email: <code style={{ background: 'var(--clay-bg-canvas)', padding: '0.2rem 0.4rem', borderRadius: '6px' }}>admin@cricket.org</code></div>
          <div style={{ marginTop: '0.2rem' }}>Password: <code style={{ background: 'var(--clay-bg-canvas)', padding: '0.2rem 0.4rem', borderRadius: '6px' }}>admin123</code></div>
        </div>
      </div>
    </div>
  );
}
