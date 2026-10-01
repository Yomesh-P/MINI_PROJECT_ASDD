const express = require('express');
const {
  getTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
} = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTournaments)
  .post(protect, authorize('admin'), createTournament);

router.route('/:id')
  .get(getTournament)
  .put(protect, authorize('admin'), updateTournament)
  .delete(protect, authorize('admin'), deleteTournament);

module.exports = router;
