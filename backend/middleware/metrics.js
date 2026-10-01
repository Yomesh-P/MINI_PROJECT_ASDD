const client = require('prom-client');

// Collect default Node runtime and process metrics (CPU, Memory, Event Loop)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register, prefix: 'cricket_backend_' });

// HTTP request counter
const httpRequestCounter = new client.Counter({
  name: 'cricket_http_requests_total',
  help: 'Total number of HTTP requests processed by the Cricket Tracker API',
  labelNames: ['method', 'route', 'status_code'],
});

// HTTP request latency histogram
const httpRequestDuration = new client.Histogram({
  name: 'cricket_http_request_duration_seconds',
  help: 'Histogram of HTTP response latencies in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

// Match updates counter
const matchScoreUpdatesCounter = new client.Counter({
  name: 'cricket_match_score_updates_total',
  help: 'Total number of live ball/score updates recorded by scorers',
  labelNames: ['match_id', 'update_type'],
});

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const elapsed = process.hrtime(start);
    const durationInSeconds = elapsed[0] + elapsed[1] / 1e9;
    const route = req.route ? req.route.path : req.baseUrl || req.path;
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    if (req.path !== '/metrics') {
      httpRequestCounter.inc({
        method: req.method,
        route,
        status_code: statusCode,
      });

      httpRequestDuration.observe(
        {
          method: req.method,
          route,
          status_code: statusCode,
        },
        durationInSeconds
      );
    }
  });

  next();
};

module.exports = {
  client,
  metricsMiddleware,
  matchScoreUpdatesCounter,
};
