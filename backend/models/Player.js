const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'],
      required: true,
      index: true,
    },
    battingStyle: {
      type: String,
      enum: ['right-hand', 'left-hand'],
      default: 'right-hand',
    },
    bowlingStyle: {
      type: String,
      enum: ['right-arm-fast', 'right-arm-spin', 'left-arm-fast', 'left-arm-spin', 'none'],
      default: 'none',
    },
    jerseyNumber: {
      type: Number,
      default: 18,
    },
    careerStats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0.0 },
      battingAvg: { type: Number, default: 0.0 },
      highestScore: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      oversBowled: { type: Number, default: 0.0 },
      runsConceded: { type: Number, default: 0 },
      economyRate: { type: Number, default: 0.0 },
      catches: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
