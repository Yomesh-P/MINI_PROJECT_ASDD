const express = require('express');
const {
  getMatches,
  getLiveMatches,
  getMatch,
  createMatch,
  updateMatch,
  updateLiveScore,
  recordBall,
  deleteMatch,
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/live', getLiveMatches);

router.route('/')
  .get(getMatches)
  .post(protect, authorize('admin', 'scorer'), createMatch);

router.route('/:id')
  .get(getMatch)
  .put(protect, authorize('admin'), updateMatch)
  .delete(protect, authorize('admin'), deleteMatch);

router.put('/:id/score', protect, authorize('admin', 'scorer'), updateLiveScore);
router.post('/:id/ball', protect, authorize('admin', 'scorer'), recordBall);

module.exports = router;
