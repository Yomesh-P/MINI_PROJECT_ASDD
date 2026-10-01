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
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem', border: '1px solid var(--accent-emerald-border)' }}>
            🏏
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Admin Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Tournament Scorer & Management Console (JWT Authenticated)
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-ruby-light)', border: '1px solid #fecaca', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', color: 'var(--accent-ruby)', fontSize: '0.88rem' }}>
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
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Console'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1.1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Demo Admin Credentials:</div>
          <div>Email: <code>admin@cricket.org</code></div>
          <div>Password: <code>admin123</code></div>
        </div>
      </div>
    </div>
  );
}
