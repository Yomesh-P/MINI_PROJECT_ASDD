const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Calculate and return tournament standings with Net Run Rate (NRR)
// @route   GET /api/standings/:tournamentId
// @access  Public
exports.getStandings = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const teams = await Team.find({ tournamentId });
    const matches = await Match.find({
      tournamentId,
      status: 'completed',
    });

    // Initialize standings map for every registered team
    const standingsMap = {};
    teams.forEach((t) => {
      standingsMap[t._id.toString()] = {
        teamId: t._id,
        teamName: t.name,
        shortName: t.shortName,
        logoUrl: t.logoUrl,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        nrr: 0.0,
      };
    });

    matches.forEach((m) => {
      const teamAId = m.teamA.toString();
      const teamBId = m.teamB.toString();

      if (!standingsMap[teamAId] || !standingsMap[teamBId]) return;

      standingsMap[teamAId].played += 1;
      standingsMap[teamBId].played += 1;

      // Legal balls converted to decimal overs for NRR computation
      const oversA = m.scoreA.ballsLegal > 0 ? m.scoreA.ballsLegal / 6 : (m.scoreA.overs || 0.1);
      const oversB = m.scoreB.ballsLegal > 0 ? m.scoreB.ballsLegal / 6 : (m.scoreB.overs || 0.1);

      standingsMap[teamAId].runsScored += m.scoreA.runs;
      standingsMap[teamAId].oversFaced += oversA;
      standingsMap[teamAId].runsConceded += m.scoreB.runs;
      standingsMap[teamAId].oversBowled += oversB;

      standingsMap[teamBId].runsScored += m.scoreB.runs;
      standingsMap[teamBId].oversFaced += oversB;
      standingsMap[teamBId].runsConceded += m.scoreA.runs;
      standingsMap[teamBId].oversBowled += oversA;

      if (!m.winner) {
        standingsMap[teamAId].tied += 1;
        standingsMap[teamBId].tied += 1;
        standingsMap[teamAId].points += tournament.rules?.pointsForTie ?? 1;
        standingsMap[teamBId].points += tournament.rules?.pointsForTie ?? 1;
      } else if (m.winner.toString() === teamAId) {
        standingsMap[teamAId].won += 1;
        standingsMap[teamAId].points += tournament.rules?.pointsForWin ?? 2;
        standingsMap[teamBId].lost += 1;
      } else if (m.winner.toString() === teamBId) {
        standingsMap[teamBId].won += 1;
        standingsMap[teamBId].points += tournament.rules?.pointsForWin ?? 2;
        standingsMap[teamAId].lost += 1;
      }
    });

    // Compute NRR for each team
    const table = Object.values(standingsMap).map((entry) => {
      const batRate = entry.oversFaced > 0 ? entry.runsScored / entry.oversFaced : 0;
      const bowlRate = entry.oversBowled > 0 ? entry.runsConceded / entry.oversBowled : 0;
      const nrr = Number((batRate - bowlRate).toFixed(3));

      return {
        ...entry,
        nrr,
      };
    });

    // Sort by points DESC, then NRR DESC, then wins DESC
    table.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.nrr !== a.nrr) return b.nrr - a.nrr;
      return b.won - a.won;
    });

    // Add rank
    const rankedTable = table.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    res.status(200).json({
      success: true,
      tournament: { id: tournament._id, name: tournament.name, format: tournament.format },
      data: rankedTable,
    });
  } catch (error) {
    next(error);
  }
};
