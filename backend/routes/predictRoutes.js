const express = require('express');
const {
  predictRuns,
  predictPlayerOfTheMatch,
  getPlayerPrediction,
} = require('../controllers/predictController');

const router = express.Router();

router.post('/runs', predictRuns);
router.post('/pom', predictPlayerOfTheMatch);
router.get('/:playerId', getPlayerPrediction);

module.exports = router;
