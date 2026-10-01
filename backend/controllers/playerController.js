const Player = require('../models/Player');
const PlayerMatchStat = require('../models/PlayerMatchStat');

// @desc    Get all players (filter by teamId, role)
// @route   GET /api/players
// @access  Public
exports.getPlayers = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.teamId) query.teamId = req.query.teamId;
    if (req.query.role) query.role = req.query.role;

    const players = await Player.find(query).populate('teamId', 'name shortName');
    res.status(200).json({ success: true, count: players.length, data: players });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single player profile with career stats
// @route   GET /api/players/:id
// @access  Public
exports.getPlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id).populate('teamId', 'name shortName logoUrl');
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

// @desc    Get player form history (last N matches) for Recharts visualization
// @route   GET /api/players/:id/form
// @access  Public
exports.getPlayerForm = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const stats = await PlayerMatchStat.find({ playerId: req.params.id })
      .populate('matchId', 'venue date resultDescription')
      .populate('oppositionTeamId', 'name shortName')
      .sort({ matchDate: -1 })
      .limit(limit)
      .lean();

    // Format for Recharts consumption
    const chartData = stats.reverse().map((stat, idx) => ({
      matchNumber: `M${idx + 1}`,
      date: new Date(stat.matchDate).toISOString().split('T')[0],
      opposition: stat.oppositionTeamId ? stat.oppositionTeamId.shortName : 'OPP',
      runs: stat.batting.runs,
      ballsFaced: stat.batting.ballsFaced,
      strikeRate: stat.batting.strikeRate,
      wickets: stat.bowling.wickets,
      oversBowled: stat.bowling.overs,
      runsConceded: stat.bowling.runsConceded,
      economyRate: stat.bowling.economyRate,
      impactScore: stat.impactScore,
      isPlayerOfMatch: stat.isPlayerOfMatch,
    }));

    // Calculate rolling summary
    const totalRuns = chartData.reduce((acc, c) => acc + c.runs, 0);
    const avgRuns = chartData.length > 0 ? Number((totalRuns / chartData.length).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      data: {
        player: {
          id: player._id,
          name: player.name,
          role: player.role,
          careerStats: player.careerStats,
        },
        recentAverage: avgRuns,
        history: chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create player
// @route   POST /api/players
// @access  Private (Admin)
exports.createPlayer = async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private (Admin)
exports.updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private (Admin)
exports.deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }
    await PlayerMatchStat.deleteMany({ playerId: req.params.id });
    res.status(200).json({ success: true, message: 'Player removed' });
  } catch (error) {
    next(error);
  }
};
