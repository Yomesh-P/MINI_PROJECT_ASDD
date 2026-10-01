const axios = require('axios');
const Player = require('../models/Player');
const PlayerMatchStat = require('../models/PlayerMatchStat');
const Match = require('../models/Match');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper: Extract features for a player
async function extractPlayerFeatures(playerId, oppositionTeamId, venue) {
  // 1. Rolling 5 matches form
  const recentStats = await PlayerMatchStat.find({ playerId })
    .sort({ matchDate: -1 })
    .limit(5)
    .lean();

  const runsList = recentStats.map((s) => s.batting.runs);
  const strikeRateList = recentStats.map((s) => s.batting.strikeRate).filter((sr) => sr > 0);

  const player = await Player.findById(playerId);

  const recent_form_avg =
    runsList.length > 0
      ? Number((runsList.reduce((a, b) => a + b, 0) / runsList.length).toFixed(1))
      : player?.careerStats?.battingAvg || 22.5;

  const recent_strike_rate =
    strikeRateList.length > 0
      ? Number((strikeRateList.reduce((a, b) => a + b, 0) / strikeRateList.length).toFixed(1))
      : player?.careerStats?.strikeRate || 125.0;

  // 2. Opposition bowling economy
  let opp_bowling_strength = 8.2;
  if (oppositionTeamId) {
    const oppStats = await PlayerMatchStat.find({ oppositionTeamId }).limit(30).lean();
    if (oppStats.length > 0) {
      const validEcon = oppStats.map((s) => s.bowling.economyRate).filter((e) => e > 0);
      if (validEcon.length > 0) {
        opp_bowling_strength = Number(
          (validEcon.reduce((a, b) => a + b, 0) / validEcon.length).toFixed(2)
        );
      }
    }
  }

  // 3. Venue average score
  let venue_avg_score = 165.0;
  if (venue) {
    const venueMatches = await Match.find({ venue, status: 'completed' }).limit(10).lean();
    if (venueMatches.length > 0) {
      const totalRuns = venueMatches.reduce((acc, m) => acc + (m.scoreA.runs + m.scoreB.runs), 0);
      venue_avg_score = Number((totalRuns / (venueMatches.length * 2)).toFixed(1));
    }
  }

  return {
    player_id: playerId.toString(),
    player_name: player?.name || 'Unknown Player',
    player_role: player?.role || 'batsman',
    recent_form_avg,
    recent_strike_rate,
    opp_bowling_strength,
    venue_avg_score,
  };
}

// @desc    Predict player expected runs in upcoming match
// @route   POST /api/predict/runs
// @access  Public
exports.predictRuns = async (req, res, next) => {
  try {
    const { playerId, oppositionTeamId, venue } = req.body;
    if (!playerId) {
      return res.status(400).json({ success: false, message: 'playerId is required' });
    }

    const features = await extractPlayerFeatures(playerId, oppositionTeamId, venue);

    try {
      // Call FastAPI ML microservice
      const response = await axios.post(`${ML_SERVICE_URL}/predict/runs`, features, {
        timeout: 2500,
      });

      return res.status(200).json({
        success: true,
        source: 'ml_service',
        data: response.data,
      });
    } catch (mlErr) {
      // Fallback baseline heuristic if ML microservice is starting or unreachable
      console.warn(`[ML-Service Fallback] FastAPI not reachable at ${ML_SERVICE_URL}: ${mlErr.message}`);
      const baselineRuns = Math.max(
        5,
        Math.round(features.recent_form_avg * 0.85 + (features.venue_avg_score / 165) * 4)
      );

      return res.status(200).json({
        success: true,
        source: 'heuristic_fallback',
        data: {
          player_name: features.player_name,
          player_role: features.player_role,
          predicted_runs: baselineRuns,
          confidence_range: [Math.max(0, baselineRuns - 12), baselineRuns + 15],
          features_used: features,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Predict Player of the Match probability
// @route   POST /api/predict/pom
// @access  Public
exports.predictPlayerOfTheMatch = async (req, res, next) => {
  try {
    const { playerId, oppositionTeamId, venue } = req.body;
    if (!playerId) {
      return res.status(400).json({ success: false, message: 'playerId is required' });
    }

    const features = await extractPlayerFeatures(playerId, oppositionTeamId, venue);

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict/pom`, features, {
        timeout: 2500,
      });
      return res.status(200).json({
        success: true,
        source: 'ml_service',
        data: response.data,
      });
    } catch (mlErr) {
      // Fallback heuristic probability
      const pomProb = Number(
        Math.min(0.45, Math.max(0.04, (features.recent_form_avg / 100) * 0.7)).toFixed(2)
      );

      return res.status(200).json({
        success: true,
        source: 'heuristic_fallback',
        data: {
          player_name: features.player_name,
          pom_probability: pomProb,
          key_factors: [
            `Recent form average: ${features.recent_form_avg} runs`,
            `Strike rate: ${features.recent_strike_rate}`,
          ],
          features_used: features,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction for single player
// @route   GET /api/predict/:playerId
// @access  Public
exports.getPlayerPrediction = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const { oppositionTeamId, venue } = req.query;

    const features = await extractPlayerFeatures(playerId, oppositionTeamId, venue);

    try {
      const [runsRes, pomRes] = await Promise.all([
        axios.post(`${ML_SERVICE_URL}/predict/runs`, features, { timeout: 2500 }),
        axios.post(`${ML_SERVICE_URL}/predict/pom`, features, { timeout: 2500 }),
      ]);

      res.status(200).json({
        success: true,
        source: 'ml_service',
        data: {
          runsPrediction: runsRes.data,
          pomPrediction: pomRes.data,
          features,
        },
      });
    } catch (err) {
      const baselineRuns = Math.max(8, Math.round(features.recent_form_avg * 0.9));
      res.status(200).json({
        success: true,
        source: 'heuristic_fallback',
        data: {
          runsPrediction: {
            predicted_runs: baselineRuns,
            confidence_range: [Math.max(0, baselineRuns - 10), baselineRuns + 12],
          },
          pomPrediction: {
            pom_probability: 0.18,
          },
          features,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
