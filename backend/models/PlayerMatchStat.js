const mongoose = require('mongoose');

const playerMatchStatSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      index: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    oppositionTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    matchDate: {
      type: Date,
      required: true,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      index: true,
    },
    batting: {
      runs: { type: Number, default: 0, min: 0 },
      ballsFaced: { type: Number, default: 0, min: 0 },
      fours: { type: Number, default: 0, min: 0 },
      sixes: { type: Number, default: 0, min: 0 },
      strikeRate: { type: Number, default: 0.0 },
      battingPosition: { type: Number, default: 0 },
      isDismissed: { type: Boolean, default: false },
      dismissalMode: {
        type: String,
        default: 'not out',
      },
    },
    bowling: {
      overs: { type: Number, default: 0.0, min: 0 },
      ballsBowled: { type: Number, default: 0, min: 0 },
      maidens: { type: Number, default: 0, min: 0 },
      runsConceded: { type: Number, default: 0, min: 0 },
      wickets: { type: Number, default: 0, min: 0 },
      economyRate: { type: Number, default: 0.0 },
      dotBalls: { type: Number, default: 0 },
    },
    fielding: {
      catches: { type: Number, default: 0 },
      runOuts: { type: Number, default: 0 },
      stumpings: { type: Number, default: 0 },
    },
    isPlayerOfMatch: {
      type: Boolean,
      default: false,
    },
    impactScore: {
      type: Number,
      default: 0.0,
    },
  },
  { timestamps: true }
);

playerMatchStatSchema.pre('save', function (next) {
  if (this.batting.ballsFaced > 0) {
    this.batting.strikeRate = Number(
      ((this.batting.runs / this.batting.ballsFaced) * 100).toFixed(2)
    );
  }
  if (this.bowling.ballsBowled > 0) {
    const oversDecimal = this.bowling.ballsBowled / 6;
    this.bowling.economyRate = Number(
      (this.bowling.runsConceded / oversDecimal).toFixed(2)
    );
  }
  this.impactScore =
    this.batting.runs * 1 +
    this.batting.fours * 1 +
    this.batting.sixes * 2 +
    this.bowling.wickets * 25 +
    this.fielding.catches * 10;
  next();
});

playerMatchStatSchema.index({ playerId: 1, matchDate: -1 });
playerMatchStatSchema.index({ playerId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('PlayerMatchStat', playerMatchStatSchema);
