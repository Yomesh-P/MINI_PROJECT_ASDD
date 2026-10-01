const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    const teams = await Team.find({ tournamentId: req.params.id });
    const matches = await Match.find({ tournamentId: req.params.id })
      .populate('teamA', 'name shortName logoUrl')
      .populate('teamB', 'name shortName logoUrl')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: { tournament, teams, matches },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private (Admin)
exports.createTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Admin)
exports.updateTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin)
exports.deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    await Team.deleteMany({ tournamentId: req.params.id });
    await Match.deleteMany({ tournamentId: req.params.id });
    res.status(200).json({ success: true, message: 'Tournament and linked entities removed' });
  } catch (error) {
    next(error);
  }
};
