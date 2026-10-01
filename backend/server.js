const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { client, metricsMiddleware } = require('./middleware/metrics');

// Load environment variables
dotenv.config();

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Body Parser & CORS
app.use(express.json());
app.use(cors());

// Prometheus Metrics Middleware (observability for LO5 & Exp 8)
app.use(metricsMiddleware);

// Root Endpoint: Portal Landing & Auto-Redirect to Frontend (Port 3000)
app.get('/', (req, res) => {
  if (req.accepts('html') && !req.xhr) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Smart Cricket Tracker API 2026</title>
          <meta http-equiv="refresh" content="2;url=http://localhost:3000">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f2f5fa; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; color: #0f172a; }
            .card { background: #ffffff; padding: 2.5rem; border-radius: 28px; box-shadow: 14px 18px 36px rgba(160, 178, 202, 0.25), -10px -10px 28px #ffffff; text-align: center; max-width: 520px; border: 1px solid rgba(255,255,255,0.95); }
            .badge { background: #ecfdf5; color: #059669; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.8rem; display: inline-block; margin-bottom: 1rem; }
            h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
            p { color: #64748b; font-size: 0.95rem; margin-bottom: 1.75rem; }
            .btn { display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 0.85rem 1.75rem; border-radius: 9999px; font-weight: 700; box-shadow: 6px 10px 20px rgba(15, 23, 42, 0.25); transition: transform 0.2s; }
            .btn:hover { transform: translateY(-2px); }
            .links { margin-top: 1.5rem; font-size: 0.85rem; color: #94a3b8; }
            .links a { color: #2563eb; text-decoration: none; margin: 0 0.5rem; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">🚀 API Online • 2026 Edition</span>
            <h1>Smart Cricket Tracker API</h1>
            <p>The Express REST API is running. Redirecting to the White Claymorphism Web App on <strong>port 3000</strong> in 2 seconds...</p>
            <a href="http://localhost:3000" class="btn">🏏 Open Web App (Port 3000)</a>
            <div class="links">
              Endpoints: 
              <a href="/api/matches/live">/api/matches/live</a> | 
              <a href="/api/standings">/api/standings</a> | 
              <a href="/health">/health</a> | 
              <a href="/metrics">/metrics</a>
            </div>
          </div>
        </body>
      </html>
    `);
  }
  res.json({
    service: 'Smart Cricket Tournament Tracker API',
    year: 2026,
    status: 'online',
    frontendUrl: 'http://localhost:3000',
    endpoints: {
      liveMatches: '/api/matches/live',
      allMatches: '/api/matches',
      standings: '/api/standings',
      players: '/api/players',
      tournaments: '/api/tournaments',
      predict: '/api/predict',
      health: '/health',
      metrics: '/metrics'
    }
  });
});

// Health check endpoint for Kubernetes probes & monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'cricket-tracker-backend',
    uptime: process.uptime(),
  });
});

// Prometheus scraping endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/standings', require('./routes/standingsRoutes'));
app.use('/api/predict', require('./routes/predictRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[Express] Cricket Tracker API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = { app, server };
