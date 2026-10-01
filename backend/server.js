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
