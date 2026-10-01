const Match = require('../models/Match');
const PlayerMatchStat = require('../models/PlayerMatchStat');
const Player = require('../models/Player');
const { matchScoreUpdatesCounter } = require('../middleware/metrics');

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public
exports.getMatches = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.tournamentId) query.tournamentId = req.query.tournamentId;
    if (req.query.status) query.status = req.query.status;

    const matches = await Match.find(query)
      .populate('teamA', 'name shortName logoUrl')
      .populate('teamB', 'name shortName logoUrl')
      .populate('winner', 'name shortName')
      .populate('playerOfMatch', 'name role')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live matches specifically (optimized for polling/dashboard)
// @route   GET /api/matches/live
// @access  Public
exports.getLiveMatches = async (req, res, next) => {
  try {
    const liveMatches = await Match.find({ status: 'live' })
      .populate('teamA', 'name shortName logoUrl')
      .populate('teamB', 'name shortName logoUrl')
      .populate('tournamentId', 'name format oversPerInnings');

    res.status(200).json({ success: true, count: liveMatches.length, data: liveMatches });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single match details
// @route   GET /api/matches/:id
// @access  Public
exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA', 'name shortName logoUrl')
      .populate('teamB', 'name shortName logoUrl')
      .populate('tournamentId', 'name format oversPerInnings rules')
      .populate('winner', 'name shortName')
      .populate('playerOfMatch', 'name role');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Also fetch per-player match stats for this match if completed or underway
    const playerStats = await PlayerMatchStat.find({ matchId: req.params.id })
      .populate('playerId', 'name role battingStyle bowlingStyle')
      .populate('teamId', 'name shortName');

    res.status(200).json({ success: true, data: { match, playerStats } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new match
// @route   POST /api/matches
// @access  Private (Admin)
exports.createMatch = async (req, res, next) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live match scoring state (Admin scoring console)
// @route   PUT /api/matches/:id/score
// @access  Private (Admin/Scorer)
exports.updateLiveScore = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const {
      currentInnings,
      scoreA,
      scoreB,
      status,
      liveState,
      winner,
      winMargin,
      resultDescription,
      playerOfMatch,
    } = req.body;

    if (currentInnings !== undefined) match.currentInnings = currentInnings;
    if (scoreA) match.scoreA = { ...match.scoreA.toObject(), ...scoreA };
    if (scoreB) match.scoreB = { ...match.scoreB.toObject(), ...scoreB };
    if (status) match.status = status;
    if (liveState) match.liveState = { ...match.liveState.toObject(), ...liveState };
    if (winner !== undefined) match.winner = winner;
    if (winMargin !== undefined) match.winMargin = winMargin;
    if (resultDescription !== undefined) match.resultDescription = resultDescription;
    if (playerOfMatch !== undefined) match.playerOfMatch = playerOfMatch;

    await match.save();

    // Increment Prometheus counter
    matchScoreUpdatesCounter.inc({
      match_id: match._id.toString(),
      update_type: status === 'completed' ? 'match_completed' : 'ball_update',
    });

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

// @desc    Record ball-by-ball event (Scorer helper)
// @route   POST /api/matches/:id/ball
// @access  Private (Admin/Scorer)
exports.recordBall = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const { runs = 0, isWicket = false, isExtra = false, extraType = '', ballOutcome = '0' } = req.body;
    const targetScore = match.currentInnings === 1 ? match.scoreA : match.scoreB;

    // Update runs
    targetScore.runs += Number(runs);

    // Update legal ball or extra
    if (!['wide', 'no-ball'].includes(extraType.toLowerCase())) {
      targetScore.ballsLegal += 1;
      const completedOvers = Math.floor(targetScore.ballsLegal / 6);
      const ballsInOver = targetScore.ballsLegal % 6;
      targetScore.overs = Number(`${completedOvers}.${ballsInOver}`);
    }

    if (isWicket && targetScore.wickets < 10) {
      targetScore.wickets += 1;
    }

    if (isExtra && extraType) {
      if (extraType === 'wide') targetScore.extras.wides += Number(runs) || 1;
      if (extraType === 'noBall') targetScore.extras.noBalls += 1;
      if (extraType === 'bye') targetScore.extras.byes += Number(runs);
      if (extraType === 'legBye') targetScore.extras.legByes += Number(runs);
    }

    // Update live state ball timeline
    if (!match.liveState) match.liveState = {};
    if (!match.liveState.currentOverBalls) match.liveState.currentOverBalls = [];
    match.liveState.currentOverBalls.push(ballOutcome);

    // If over complete (6 legal balls), reset current over array
    if (targetScore.ballsLegal % 6 === 0 && !['wide', 'no-ball'].includes(extraType.toLowerCase())) {
      match.liveState.currentOverBalls = [];
    }

    if (!match.liveState.recentBalls) match.liveState.recentBalls = [];
    match.liveState.recentBalls.push(ballOutcome);
    if (match.liveState.recentBalls.length > 24) {
      match.liveState.recentBalls.shift();
    }

    await match.save();

    matchScoreUpdatesCounter.inc({
      match_id: match._id.toString(),
      update_type: isWicket ? 'wicket' : 'run',
    });

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

// @desc    Update general match info
// @route   PUT /api/matches/:id
// @access  Private (Admin)
exports.updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private (Admin)
exports.deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    await PlayerMatchStat.deleteMany({ matchId: req.params.id });
    res.status(200).json({ success: true, message: 'Match and associated stats removed' });
  } catch (error) {
    next(error);
  }
};
