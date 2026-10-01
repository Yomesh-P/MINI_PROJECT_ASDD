const Team = require('../models/Team');
const Player = require('../models/Player');

// @desc    Get all teams (optional query: tournamentId)
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.tournamentId) {
      query.tournamentId = req.query.tournamentId;
    }
    const teams = await Team.find(query).populate('tournamentId', 'name format');
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team with player roster
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('tournamentId', 'name format');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    const players = await Player.find({ teamId: req.params.id }).sort({ role: 1, name: 1 });
    res.status(200).json({ success: true, data: { team, players } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Admin)
exports.createTeam = async (req, res, next) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin)
exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    await Player.deleteMany({ teamId: req.params.id });
    res.status(200).json({ success: true, message: 'Team and linked players removed' });
  } catch (error) {
    next(error);
  }
};
