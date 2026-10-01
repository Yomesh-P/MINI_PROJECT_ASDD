const express = require('express');
const { getStandings } = require('../controllers/standingsController');

const router = express.Router();

router.get('/:tournamentId', getStandings);

module.exports = router;
