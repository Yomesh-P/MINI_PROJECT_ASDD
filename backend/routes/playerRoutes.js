const express = require('express');
const {
  getPlayers,
  getPlayer,
  getPlayerForm,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require('../controllers/playerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPlayers)
  .post(protect, authorize('admin'), createPlayer);

router.get('/:id/form', getPlayerForm);

router.route('/:id')
  .get(getPlayer)
  .put(protect, authorize('admin'), updatePlayer)
  .delete(protect, authorize('admin'), deletePlayer);

module.exports = router;
