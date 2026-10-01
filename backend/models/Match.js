const mongoose = require('mongoose');

const inningsScoreSchema = new mongoose.Schema(
  {
    runs: { type: Number, default: 0, min: 0 },
    wickets: { type: Number, default: 0, min: 0, max: 10 },
    overs: { type: Number, default: 0.0, min: 0 },
    ballsLegal: { type: Number, default: 0 },
    extras: {
      wides: { type: Number, default: 0 },
      noBalls: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'abandoned'],
      default: 'upcoming',
      index: true,
    },
    toss: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      decision: { type: String, enum: ['bat', 'bowl'], default: 'bat' },
    },
    currentInnings: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    battingFirst: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    scoreA: {
      type: inningsScoreSchema,
      default: () => ({}),
    },
    scoreB: {
      type: inningsScoreSchema,
      default: () => ({}),
    },
    liveState: {
      currentOverBalls: [{ type: String }],
      strikerName: { type: String, default: '' },
      strikerRuns: { type: Number, default: 0 },
      strikerBalls: { type: Number, default: 0 },
      nonStrikerName: { type: String, default: '' },
      nonStrikerRuns: { type: Number, default: 0 },
      nonStrikerBalls: { type: Number, default: 0 },
      bowlerName: { type: String, default: '' },
      bowlerOvers: { type: Number, default: 0 },
      bowlerRuns: { type: Number, default: 0 },
      bowlerWickets: { type: Number, default: 0 },
      recentBalls: [{ type: String }],
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    winMargin: {
      type: String,
      default: '',
    },
    resultDescription: {
      type: String,
      default: '',
    },
    playerOfMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
  },
  { timestamps: true }
);

matchSchema.index({ tournamentId: 1, status: 1 });
matchSchema.index({ date: -1 });

module.exports = mongoose.model('Match', matchSchema);
